from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class SourcePriorityTag(BaseModel):
    priority_level: int = Field(description="1: Technical Doc, 2: Official Web, 3: Catalog, 4: Distributor, 5: Other")
    source_type_name: str
    is_official_manufacturer: bool = True

class EnrichedAttributeItem(BaseModel):
    id: str
    attribute_name: str
    key: str
    value: str
    unit: Optional[str] = None
    confidence: float
    status: str  # 'extracted', 'ai_enriched', 'needs_review', 'not_found'
    source_name: str
    source_url: Optional[str] = None
    source_priority: int  # 1 to 5
    evidence_text: str
    enrichment_method: str  # 'rag_vector_search', 'web_research', 'document_intelligence', 'vision_ocr'
    verified: bool = False  # Left false until Phase 6 Rule Validation

class MissingAttributeItem(BaseModel):
    key: str
    attribute_name: str
    category: str
    importance: str  # 'critical', 'recommended', 'optional'
    reason: str

class DetectMissingResponse(BaseModel):
    product_id: str
    total_expected_specs: int
    extracted_specs_count: int
    missing_specs_count: int
    missing_attributes: List[MissingAttributeItem]

class EnrichmentRequest(BaseModel):
    target_attributes: Optional[List[str]] = None  # None = enrich all missing
    max_source_priority: int = 5

class EnrichmentResponse(BaseModel):
    product_id: str
    status: str
    enriched_count: int
    not_found_count: int
    enriched_attributes: List[EnrichedAttributeItem]
    agent_logs: List[str]

class EnrichmentSummaryResponse(BaseModel):
    product_id: str
    extracted_count: int
    ai_enriched_count: int
    needs_review_count: int
    missing_count: int
    overall_completeness_percent: float
    source_priority_breakdown: Dict[str, int]
