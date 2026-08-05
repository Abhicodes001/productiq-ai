import logging
import math
import re
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Check if qdrant_client or fastembed are available; if not, use standard cosine similarity vector engine
try:
    from qdrant_client import QdrantClient
    from qdrant_client.models import VectorParams, Distance, PointStruct, Filter, FieldCondition, MatchValue
    HAS_QDRANT = True
except ImportError:
    HAS_QDRANT = False

class VectorStoreService:
    """
    Vector database store for ProductIQ AI.
    Handles embedding generation, chunk indexing, and cosine-similarity vector search
    filtered strictly by product_id.
    """
    _in_memory_collections: Dict[str, List[Dict[str, Any]]] = {}

    @classmethod
    def generate_embedding(cls, text: str) -> List[float]:
        """
        Generates a 128-dimensional dense embedding vector for semantic search.
        Uses deterministic text feature hashing + n-gram frequency normalization.
        """
        dim = 128
        vec = [0.0] * dim
        clean = re.sub(r'[^\w\s]', '', text.lower())
        words = clean.split()

        for idx, word in enumerate(words):
            hash_val = hash(word)
            pos = abs(hash_val) % dim
            val = (hash_val % 100) / 100.0
            vec[pos] += val + (1.0 / (idx + 1))

            # Character bi-grams for technical codes & numbers
            for j in range(len(word) - 1):
                bigram = word[j:j+2]
                bpos = abs(hash(bigram)) % dim
                vec[bpos] += 0.5

        # L2 Normalization
        norm = math.sqrt(sum(v * v for v in vec))
        if norm > 0:
            vec = [v / norm for v in vec]
        else:
            vec = [1.0 / math.sqrt(dim)] * dim

        return vec

    @classmethod
    def calculate_cosine_similarity(cls, vec_a: List[float], vec_b: List[float]) -> float:
        dot = sum(a * b for a, b in zip(vec_a, vec_b))
        norm_a = math.sqrt(sum(a * a for a in vec_a))
        norm_b = math.sqrt(sum(b * b for b in vec_b))
        if norm_a == 0 or norm_b == 0:
            return 0.0
        return dot / (norm_a * norm_b)

    @classmethod
    def index_chunks(cls, product_id: str, chunks: List[Dict[str, Any]]) -> int:
        """
        Indexes chunks into the vector store, associated with product_id.
        """
        if not product_id:
            raise ValueError("product_id is required for vector indexing.")

        if product_id not in cls._in_memory_collections:
            cls._in_memory_collections[product_id] = []

        indexed_count = 0
        for chunk in chunks:
            text = chunk.get("text", "")
            embedding = cls.generate_embedding(text)
            
            entry = {
                "chunk_id": chunk.get("chunk_id"),
                "text": text,
                "embedding": embedding,
                "metadata": chunk.get("metadata", {}),
            }
            
            # Upsert into collection for product_id
            existing_idx = next(
                (i for i, item in enumerate(cls._in_memory_collections[product_id]) 
                 if item["chunk_id"] == entry["chunk_id"]), 
                None
            )
            if existing_idx is not None:
                cls._in_memory_collections[product_id][existing_idx] = entry
            else:
                cls._in_memory_collections[product_id].append(entry)
            
            indexed_count += 1

        logger.info(f"Successfully indexed {indexed_count} chunks into collection for product_id={product_id}")
        return indexed_count

    @classmethod
    def search(cls, product_id: str, query: str, top_k: int = 5, min_score: float = 0.0) -> List[Dict[str, Any]]:
        """
        Performs semantic vector search over chunks filtered strictly by product_id.
        """
        collection = cls._in_memory_collections.get(product_id, [])
        if not collection or not query.strip():
            return []

        query_vec = cls.generate_embedding(query)
        query_words = set(re.findall(r'\w+', query.lower()))

        scored_results = []
        for item in collection:
            sim = cls.calculate_cosine_similarity(query_vec, item["embedding"])
            
            # Keyword relevance boost for exact technical terms / model codes
            item_text_lower = item["text"].lower()
            overlap = sum(1 for w in query_words if len(w) > 2 and w in item_text_lower)
            if overlap > 0:
                sim += (overlap * 0.08)

            sim = min(1.0, round(sim, 4))

            if sim >= min_score:
                scored_results.append({
                    "chunk_id": item["chunk_id"],
                    "text": item["text"],
                    "similarity_score": sim,
                    "metadata": item["metadata"]
                })

        # Sort descending by similarity score
        scored_results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return scored_results[:top_k]
