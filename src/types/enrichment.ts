export interface MissingAttributeItem {
  key: string;
  attribute_name: string;
  category: string;
  importance: 'critical' | 'recommended' | 'optional' | string;
  reason: string;
}

export interface DetectMissingResponse {
  product_id: string;
  total_expected_specs: number;
  extracted_specs_count: number;
  missing_specs_count: number;
  missing_attributes: MissingAttributeItem[];
}

export interface EnrichedAttributeItem {
  id: string;
  attribute_name: string;
  key: string;
  value: string;
  unit?: string | null;
  confidence: number;
  status: 'extracted' | 'ai_enriched' | 'needs_review' | 'not_found' | string;
  source_name: string;
  source_url?: string | null;
  source_priority: number; // 1 to 5
  evidence_text: string;
  enrichment_method: string;
  verified: boolean;
}

export interface EnrichmentResponse {
  product_id: string;
  status: string;
  enriched_count: number;
  not_found_count: number;
  enriched_attributes: EnrichedAttributeItem[];
  agent_logs: string[];
}

export interface EnrichmentSummaryResponse {
  product_id: string;
  extracted_count: number;
  ai_enriched_count: number;
  needs_review_count: number;
  missing_count: number;
  overall_completeness_percent: number;
  source_priority_breakdown: Record<string, number>;
}
