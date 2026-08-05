from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ConflictCandidate(BaseModel):
    candidate_id: str
    value: str
    unit: Optional[str] = None
    source_name: str
    source_type: str  # 'pdf', 'website', 'catalog', 'image', 'third_party'
    source_url: Optional[str] = None
    page_number: Optional[int] = None
    confidence: float
    evidence_text: str

class ConflictItem(BaseModel):
    id: str
    product_id: str
    attribute_name: str
    key: str
    current_value: Optional[str] = None
    status: str  # 'conflict', 'needs_review', 'resolved'
    candidates: List[ConflictCandidate]
    created_at: str

class ReviewActionRequest(BaseModel):
    action: str  # 'select_candidate', 'edit_manual', 'mark_na', 'reject_ai'
    selected_candidate_id: Optional[str] = None
    manual_value: Optional[str] = None
    manual_unit: Optional[str] = None
    reviewer_name: str = "Lead Quality Engineer"
    notes: Optional[str] = None

class ReviewHistoryItem(BaseModel):
    id: str
    product_id: str
    attribute_name: str
    key: str
    previous_value: Optional[str] = None
    final_value: str
    reviewer: str
    action: str
    timestamp: str

class ValidationSummary(BaseModel):
    product_id: str
    total_attributes_validated: int
    matching_specs_count: int
    conflicts_count: int
    low_confidence_count: int
    unverified_enriched_count: int
    overall_confidence: float
    confidence_tier: str  # 'High Confidence', 'Medium Confidence', 'Low Confidence'
    validation_status: str  # 'verified', 'human_verified', 'needs_review', 'conflict'
