export interface ConflictCandidate {
  candidate_id: string;
  value: string;
  unit?: string | null;
  source_name: string;
  source_type: 'pdf' | 'website' | 'catalog' | 'image' | 'third_party' | string;
  source_url?: string | null;
  page_number?: number | null;
  confidence: number;
  evidence_text: string;
}

export interface ConflictItem {
  id: string;
  product_id: string;
  product_name?: string;
  attribute_name: string;
  key: string;
  current_value?: string | null;
  status: 'conflict' | 'needs_review' | 'resolved' | string;
  candidates: ConflictCandidate[];
  created_at: string;
}

export interface ReviewActionRequest {
  action: 'select_candidate' | 'edit_manual' | 'mark_na' | 'reject_ai' | string;
  selected_candidate_id?: string;
  manual_value?: string;
  manual_unit?: string;
  reviewer_name?: string;
  notes?: string;
}

export interface ReviewHistoryItem {
  id: string;
  product_id: string;
  attribute_name: string;
  key: string;
  previous_value?: string | null;
  final_value: string;
  reviewer: string;
  action: string;
  timestamp: string;
}

export interface ValidationSummary {
  product_id: string;
  total_attributes_validated: number;
  matching_specs_count: number;
  conflicts_count: number;
  low_confidence_count: number;
  unverified_enriched_count: number;
  overall_confidence: number;
  confidence_tier: 'High Confidence' | 'Medium Confidence' | 'Low Confidence' | string;
  validation_status: 'verified' | 'human_verified' | 'needs_review' | 'conflict' | string;
}
