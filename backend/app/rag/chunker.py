import uuid
import re
from typing import List, Dict, Any, Optional

class DocumentChunker:
    """
    Splits product document text and web scrapings into semantic chunks,
    preserving full source metadata for RAG traceability.
    """

    @staticmethod
    def clean_text(text: str) -> str:
        if not text:
            return ""
        # Clean extra whitespace, null bytes, invalid control characters
        text = re.sub(r'[\r\t\x00-\x08\x0b\x0c\x0e-\x1f]', ' ', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r' {2,}', ' ', text)
        return text.strip()

    @classmethod
    def chunk_document(
        cls,
        product_id: str,
        content: str,
        source_type: str,
        source_name: str,
        document_id: Optional[str] = None,
        source_id: Optional[str] = None,
        page_number: Optional[int] = None,
        url: Optional[str] = None,
        chunk_size: int = 400,
        chunk_overlap: int = 60
    ) -> List[Dict[str, Any]]:
        """
        Splits clean text into overlapping chunks with metadata attached.
        """
        cleaned = cls.clean_text(content)
        if not cleaned:
            return []

        words = cleaned.split(" ")
        if len(words) <= chunk_size:
            return [{
                "chunk_id": f"chk_{uuid.uuid4().hex[:12]}",
                "text": cleaned,
                "metadata": {
                    "chunk_id": f"chk_{uuid.uuid4().hex[:12]}",
                    "product_id": product_id,
                    "document_id": document_id,
                    "source_id": source_id,
                    "source_type": source_type,
                    "source_name": source_name,
                    "page_number": page_number,
                    "url": url,
                }
            }]

        chunks = []
        step = max(1, chunk_size - chunk_overlap)
        
        for i in range(0, len(words), step):
            chunk_words = words[i:i + chunk_size]
            if not chunk_words:
                continue
            
            chunk_text = " ".join(chunk_words).strip()
            if len(chunk_text) < 15 and len(words) > 50:
                continue  # Skip trailing tiny snippets

            cid = f"chk_{uuid.uuid4().hex[:12]}"
            chunks.append({
                "chunk_id": cid,
                "text": chunk_text,
                "metadata": {
                    "chunk_id": cid,
                    "product_id": product_id,
                    "document_id": document_id,
                    "source_id": source_id,
                    "source_type": source_type,
                    "source_name": source_name,
                    "page_number": page_number,
                    "url": url,
                }
            })

        return chunks
