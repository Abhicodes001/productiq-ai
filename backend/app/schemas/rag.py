from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SourceCitation(BaseModel):
    source_id: Optional[str] = None
    source_name: str
    source_type: str  # 'website', 'pdf', 'image', 'enrichment'
    page_number: Optional[int] = None
    url: Optional[str] = None
    evidence_text: str
    similarity_score: Optional[float] = 0.0

class ChunkMetadata(BaseModel):
    chunk_id: str
    product_id: str
    document_id: Optional[str] = None
    source_id: Optional[str] = None
    source_type: str
    source_name: str
    page_number: Optional[int] = None
    url: Optional[str] = None

class VectorChunk(BaseModel):
    chunk_id: str
    text: str
    metadata: ChunkMetadata
    similarity_score: Optional[float] = 0.0

class IndexProductResponse(BaseModel):
    product_id: str
    status: str
    indexed_chunks_count: int
    collection_name: str
    message: str

class VectorSearchRequest(BaseModel):
    query: str
    top_k: int = Field(default=5, ge=1, le=20)
    min_score: float = Field(default=0.0, ge=0.0, le=1.0)

class VectorSearchResponse(BaseModel):
    product_id: str
    query: str
    results_count: int
    chunks: List[VectorChunk]

class VerifyAttributeRequest(BaseModel):
    attribute_name: str
    current_value: Optional[str] = None

class VerifyAttributeResponse(BaseModel):
    product_id: str
    attribute_name: str
    value: str
    confidence: float
    verified: bool
    evidence_text: str
    supporting_sources: List[SourceCitation]

class ProductQARequest(BaseModel):
    question: str
    top_k: int = 5

class ProductQAResponse(BaseModel):
    product_id: str
    question: str
    answer: str
    found_evidence: bool
    citations: List[SourceCitation]
