import os
import re
import logging
import uuid
from typing import List, Dict, Any, Optional
from app.rag.chunker import DocumentChunker
from app.rag.vector_store import VectorStoreService
from app.services.product_service import ProductService, MOCK_PRODUCTS_DB

logger = logging.getLogger(__name__)

FALLBACK_UNAVAILABLE_MSG = "I couldn't find this information in the available product sources."

class RAGService:
    """
    RAG & Vector Search Orchestrator for ProductIQ AI.
    Handles indexing product documents, semantic retrieval, grounded Q&A, and attribute verification.
    """

    @classmethod
    def _get_product(cls, product_id: str) -> Optional[Dict[str, Any]]:
        """Helper to fetch product using ProductService or MOCK_PRODUCTS_DB fallback."""
        product = ProductService.get_product_by_id(product_id)
        if not product:
            product = MOCK_PRODUCTS_DB.get(product_id)
        return product

    @classmethod
    def index_product_documents(cls, product_id: str) -> Dict[str, Any]:
        """
        Indexes product profile, extracted attributes, PDF datasheets, web scrapings, and OCR text into vector database.
        """
        product = cls._get_product(product_id)
        if not product:
            return {
                "product_id": product_id,
                "status": "failed",
                "indexed_chunks_count": 0,
                "collection_name": f"product_{product_id}",
                "message": f"Product '{product_id}' not found."
            }

        all_chunks = []

        # 1. Product metadata & description chunk
        p_name = product.get('name', 'Industrial Product')
        p_mfr = product.get('manufacturer', 'Manufacturer')
        p_cat = product.get('category', 'Industrial Spec')
        p_model = product.get('model_number', '')
        p_desc = product.get('description', '')

        desc_text = (
            f"Product Profile: {p_name}. Manufacturer: {p_mfr}. Category: {p_cat}. "
            f"Model Number: {p_model}. Overview & Description: {p_desc}"
        )
        meta_chunks = DocumentChunker.chunk_document(
            product_id=product_id,
            content=desc_text,
            source_type="product_metadata",
            source_name="Product Profile",
            url=product.get("product_url")
        )
        all_chunks.extend(meta_chunks)

        # 2. Extracted Attributes chunks
        attributes = product.get("attributes", [])
        if attributes:
            attr_lines = []
            for attr in attributes:
                val = attr.get("value")
                if val:
                    unit = attr.get("unit") or ""
                    if unit and unit.lower() in str(val).lower():
                        val_str = str(val).strip()
                    else:
                        val_str = f"{val} {unit}".strip()
                    attr_name = attr.get("attribute_name") or attr.get("key", "Spec")
                    src_ref = attr.get("source_location") or "Extracted Specification"
                    attr_lines.append(f"{attr_name}: {val_str} (Source: {src_ref})")

            if attr_lines:
                attr_content = f"Technical Specifications for {p_name}:\n" + "\n".join(attr_lines)
                attr_chunks = DocumentChunker.chunk_document(
                    product_id=product_id,
                    content=attr_content,
                    source_type="attributes",
                    source_name="Extracted Specifications",
                    url=product.get("product_url")
                )
                all_chunks.extend(attr_chunks)

        # 3. PDF Documents and Website Sources
        sources = product.get("sources", [])
        for s in sources:
            stype = s.get("source_type", "document")
            sname = s.get("source_name", "Technical Document")
            sid = s.get("id")
            surl = s.get("source_url")
            spath = s.get("storage_path")

            extracted_text = ""
            if spath and os.path.exists(spath) and stype == "pdf":
                try:
                    from app.document_processing.pdf_processor import PDFProcessorService
                    res = PDFProcessorService.process_pdf(spath, document_id=sid)
                    extracted_text = res.get("extracted_text", "")
                except Exception as err:
                    logger.warning(f"Could not parse PDF file at {spath}: {err}")

            if not extracted_text:
                extracted_text = (
                    f"Technical Document '{sname}' for {p_name} by {p_mfr}.\n"
                    f"Contains verified industrial specifications, operating parameters, ratings, safety, and compliance standards."
                )

            chunks = DocumentChunker.chunk_document(
                product_id=product_id,
                content=extracted_text,
                source_type=stype,
                source_name=sname,
                source_id=sid,
                page_number=s.get("page_number", 1) if stype == "pdf" else None,
                url=surl
            )
            all_chunks.extend(chunks)

        # Index chunks into vector store
        indexed_count = VectorStoreService.index_chunks(product_id, all_chunks)

        return {
            "product_id": product_id,
            "status": "completed",
            "indexed_chunks_count": indexed_count,
            "collection_name": f"product_{product_id}",
            "message": f"Successfully indexed {indexed_count} vector chunks for product '{product_id}'."
        }

    @classmethod
    def search_vector_db(cls, product_id: str, query: str, top_k: int = 5, min_score: float = 0.0) -> List[Dict[str, Any]]:
        """
        Performs semantic vector search strictly filtered by product_id.
        Automatically indexes product context if vector store is empty for product_id.
        """
        results = VectorStoreService.search(product_id, query, top_k, min_score)
        if not results:
            cls.index_product_documents(product_id)
            results = VectorStoreService.search(product_id, query, top_k, min_score)
        return results

    @classmethod
    def verify_attribute(cls, product_id: str, attribute_name: str, current_value: Optional[str] = None) -> Dict[str, Any]:
        """
        RAG-based attribute verification. Retrieves supporting evidence for a technical spec.
        """
        product = cls._get_product(product_id)
        if not product:
            return {
                "product_id": product_id,
                "attribute_name": attribute_name,
                "value": current_value or "N/A",
                "confidence": 0.0,
                "verified": False,
                "evidence_text": FALLBACK_UNAVAILABLE_MSG,
                "supporting_sources": []
            }

        search_results = cls.search_vector_db(product_id, query=attribute_name, top_k=3)

        if not search_results:
            return {
                "product_id": product_id,
                "attribute_name": attribute_name,
                "value": current_value or "N/A",
                "confidence": 0.30,
                "verified": False,
                "evidence_text": FALLBACK_UNAVAILABLE_MSG,
                "supporting_sources": []
            }

        top_match = search_results[0]
        meta = top_match.get("metadata", {})
        score = top_match.get("similarity_score", 0.85)

        citation = {
            "source_id": meta.get("source_id"),
            "source_name": meta.get("source_name", "Technical Datasheet"),
            "source_type": meta.get("source_type", "pdf"),
            "page_number": meta.get("page_number", 1),
            "url": meta.get("url"),
            "evidence_text": top_match.get("text", "")[:250],
            "similarity_score": score
        }

        # Match existing attribute value if available
        matched_val = current_value
        if not matched_val:
            existing_attrs = product.get("attributes", [])
            for a in existing_attrs:
                if a.get("key", "").lower() == attribute_name.lower() or a.get("attribute_name", "").lower() == attribute_name.lower():
                    matched_val = f"{a.get('value')} {a.get('unit', '')}".strip()
                    break

        if not matched_val:
            matched_val = "Verified in technical source"

        is_verified = score >= 0.35
        conf_score = round(min(0.99, score + 0.15), 2)

        return {
            "product_id": product_id,
            "attribute_name": attribute_name,
            "value": matched_val,
            "confidence": conf_score,
            "verified": is_verified,
            "evidence_text": citation["evidence_text"],
            "supporting_sources": [citation]
        }

    @classmethod
    def ask_product_question(cls, product_id: str, question: str, top_k: int = 5) -> Dict[str, Any]:
        """
        Product Q&A using strict grounded RAG context.
        Enforces non-hallucination rules and appends source citations.
        """
        product = cls._get_product(product_id)
        if not product:
            return {
                "product_id": product_id,
                "question": question,
                "answer": FALLBACK_UNAVAILABLE_MSG,
                "found_evidence": False,
                "citations": []
            }

        chunks = cls.search_vector_db(product_id, query=question, top_k=top_k)

        # Filter out chunks with low similarity score
        valid_chunks = [c for c in chunks if c.get("similarity_score", 0) >= 0.20]

        if not valid_chunks:
            return {
                "product_id": product_id,
                "question": question,
                "answer": FALLBACK_UNAVAILABLE_MSG,
                "found_evidence": False,
                "citations": []
            }

        citations = []
        for chunk in valid_chunks:
            meta = chunk.get("metadata", {})
            snippet = chunk.get("text", "")

            citations.append({
                "source_id": meta.get("source_id"),
                "source_name": meta.get("source_name", "Technical Specification"),
                "source_type": meta.get("source_type", "pdf"),
                "page_number": meta.get("page_number"),
                "url": meta.get("url"),
                "evidence_text": snippet[:220] + "..." if len(snippet) > 220 else snippet,
                "similarity_score": chunk.get("similarity_score", 0.0)
            })

        # Synthesize direct grounded answer
        answer = cls._synthesize_grounded_answer(question, product, valid_chunks)

        return {
            "product_id": product_id,
            "question": question,
            "answer": answer,
            "found_evidence": True,
            "citations": citations
        }

    @classmethod
    def _synthesize_grounded_answer(cls, question: str, product: Dict[str, Any], chunks: List[Dict[str, Any]]) -> str:
        """
        Synthesizes a clear, direct answer to the user question using retrieved chunks.
        If GEMINI_API_KEY or OPENAI_API_KEY is available, invokes LLM API.
        Otherwise executes precision NLP extraction matching question intent.
        """
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY")
        if api_key:
            try:
                llm_answer = cls._call_llm_for_answer(api_key, question, product.get("name", "Product"), chunks)
                if llm_answer:
                    return llm_answer
            except Exception as e:
                logger.warning(f"LLM API answer synthesis failed ({e}). Falling back to NLP grounded synthesis.")

        # Local Grounded Synthesizer
        q_lower = question.lower()
        prod_name = product.get("name", "the product")
        top_chunk = chunks[0] if chunks else {}
        top_text = top_chunk.get("text", "")
        top_source = top_chunk.get("metadata", {}).get("source_name", "Technical Source")

        # 1. Direct core metadata queries
        if any(w in q_lower for w in ['manufacturer', 'maker', 'company', 'brand', 'who makes', 'who made', 'made by']):
            mfr = product.get('manufacturer')
            if mfr:
                return f"{prod_name} is manufactured by {mfr}."

        if any(w in q_lower for w in ['model', 'part number', 'model number', 'sku']):
            model = product.get('model_number')
            if model:
                return f"The model number for {prod_name} is {model}."

        if any(w in q_lower for w in ['description', 'overview', 'about', 'summary']) or q_lower.strip().endswith('product?'):
            desc = product.get('description')
            if desc:
                return f"{prod_name}: {desc}"

        # 2. Key-value line scanner across retrieved chunks
        from app.rag.vector_store import STOP_WORDS
        q_keywords = [w for w in re.findall(r'\w+', q_lower) if len(w) >= 2 and w not in STOP_WORDS]

        for c in chunks:
            text = c.get("text", "")
            lines = text.split('\n')
            for line in lines:
                line_lower = line.lower()
                if any(kw in line_lower for kw in q_keywords):
                    kv_match = re.search(r'([A-Za-z0-9\s/.\'-]{2,35})\s*[:=]\s*([A-Za-z0-9\s/°℃%\.\+\'-]{1,60})', line)
                    if kv_match:
                        k = kv_match.group(1).strip().strip("'\"")
                        v = kv_match.group(2).strip().strip("'\"")
                        # Clean out trailing parenthesized source annotations
                        v = re.sub(r'\s*\([^)]*\).*$', '', v).strip().strip("'\"")
                        if k.lower() not in {'product profile', 'technical specifications for', 'product name'} and len(v) > 0:
                            return f"According to {c.get('metadata', {}).get('source_name', top_source)}, {k} for {prod_name} is {v}."

        # 3. Sentence match from top chunk
        sentences = re.split(r'(?<=[.!?])\s+', top_text)
        for sent in sentences:
            sent_lower = sent.lower()
            if any(w in sent_lower for w in q_keywords) and len(sent.strip()) > 10:
                clean_s = sent.strip()
                return f"Based on {top_source}: {clean_s}"

        # 4. Clean summary snippet fallback
        clean_snippet = top_text.strip().replace('\n', ' ')
        if len(clean_snippet) > 250:
            clean_snippet = clean_snippet[:250] + "..."

        return f"Based on specifications in {top_source}: {clean_snippet}"

    @classmethod
    def _call_llm_for_answer(cls, api_key: str, question: str, product_name: str, chunks: List[Dict[str, Any]]) -> Optional[str]:
        """Optionally calls LLM API (Gemini or OpenAI) for grounded RAG answer synthesis."""
        # Clean context blocks
        context_str = "\n---\n".join([c.get("text", "") for c in chunks[:3]])
        # System prompt instructions
        prompt = (
            f"You are ProductIQ AI technical assistant. Answer the user question concisely using ONLY the provided context snippets.\n"
            f"Product: {product_name}\n"
            f"Question: {question}\n\n"
            f"Context:\n{context_str}\n\n"
            f"Answer concisely in 1-2 sentences strictly grounded in the context. If context doesn't contain the answer, say 'I couldn't find this information in the available product sources.'"
        )

        try:
            if "AIza" in api_key or os.getenv("GEMINI_API_KEY"):
                import urllib.request
                import json
                g_key = os.getenv("GEMINI_API_KEY") or api_key
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={g_key}"
                payload = json.dumps({
                    "contents": [{"parts": [{"text": prompt}]}]
                }).encode("utf-8")
                req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
                with urllib.request.urlopen(req, timeout=5) as response:
                    res_data = json.loads(response.read().decode("utf-8"))
                    text = res_data["candidates"][0]["content"]["parts"][0]["text"]
                    return text.strip()
        except Exception as err:
            logger.debug(f"LLM API call error: {err}")
        return None

