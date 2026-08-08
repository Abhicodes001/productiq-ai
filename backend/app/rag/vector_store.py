import logging
import math
import re
import hashlib
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

# Standard stop words to ignore during vector embedding generation to prevent query dilution
STOP_WORDS = {
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and',
    'any', 'are', 'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being',
    'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot', 'could',
    'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from',
    'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself',
    'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its',
    'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not',
    'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves',
    'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than',
    'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these',
    'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very',
    'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom',
    'why', 'with', 'would', 'you', 'your', 'yours', 'yourself', 'yourselves'
}

def deterministic_hash(text: str) -> int:
    """Returns a 32-bit deterministic integer hash for text string."""
    return int(hashlib.md5(text.encode('utf-8')).hexdigest()[:8], 16)

SPEC_SYNONYMS = {
    'voltage': ['v', 'vac', 'vdc', 'volt', 'volts', 'voltage', 'supply', '230v', '415v', '24v'],
    'power': ['w', 'kw', 'watt', 'watts', 'hp', 'power', 'rating'],
    'current': ['a', 'amp', 'amps', 'ma', 'current', 'output'],
    'frequency': ['hz', 'khz', 'mhz', 'freq', 'frequency'],
    'temperature': ['c', 'f', 'temp', 'temperature', '°c', '℃', 'ambient'],
    'weight': ['kg', 'g', 'lbs', 'weight', 'mass'],
    'dimensions': ['mm', 'cm', 'in', 'dimensions', 'size', 'wxhxd'],
    'pressure': ['bar', 'psi', 'kpa', 'pressure'],
    'flow': ['l/min', 'gpm', 'flow'],
    'speed': ['rpm', 'speed', 'rotation']
}

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
        Filters out common stop words to concentrate vector mass on domain technical terms.
        """
        dim = 128
        vec = [0.0] * dim
        clean = re.sub(r'[^\w\s]', ' ', text.lower())
        words = [w for w in clean.split() if w and w not in STOP_WORDS]

        # Fallback if text only contained stop words
        if not words:
            words = clean.split()

        for idx, word in enumerate(words):
            hash_val = deterministic_hash(word)
            pos = abs(hash_val) % dim
            val = ((hash_val % 100) / 100.0) + 1.0
            vec[pos] += val

            # Character bi-grams for technical codes, numbers, and units
            for j in range(len(word) - 1):
                bigram = word[j:j+2]
                bpos = abs(deterministic_hash(bigram)) % dim
                vec[bpos] += 0.4

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
            if not text.strip():
                continue

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
        query_words = [w.lower() for w in re.findall(r'\w+', query) if w.lower() not in STOP_WORDS]
        if not query_words:
            query_words = [w.lower() for w in re.findall(r'\w+', query)]

        scored_results = []
        for item in collection:
            sim = cls.calculate_cosine_similarity(query_vec, item["embedding"])
            item_text_lower = item["text"].lower()
            
            # Keyword relevance boost for exact technical terms, specs, or model codes
            overlap = 0
            for w in query_words:
                if len(w) >= 2 and w in item_text_lower:
                    overlap += 1
                elif w in SPEC_SYNONYMS:
                    syns = SPEC_SYNONYMS[w]
                    if any(syn in item_text_lower for syn in syns):
                        overlap += 1

            if overlap > 0:
                sim += (overlap * 0.25)

            sim = min(0.99, round(sim, 4))

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

