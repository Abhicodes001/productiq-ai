export type ProductStatus = 'processing' | 'needs_review' | 'verified' | 'human_verified' | 'conflict' | 'failed' | 'draft' | string;
export type SourceType = 'website' | 'pdf' | 'image' | 'manual';
export type SourceStatus = 'pending' | 'processing' | 'processed' | 'failed';

export const PRODUCT_CATEGORIES = [
  'Power Tools',
  'Hand Tools',
  'Industrial Power Tools',
  'Electric Motors',
  'Industrial Pumps',
  'Valves & Actuators',
  'Sensors & Instrumentation',
  'Industrial Robotics',
  'PLCs (Programmable Logic Controllers)',
  'Variable Frequency Drives (VFDs)',
  'Human Machine Interfaces (HMI)',
  'Electrical Components',
  'Safety Equipment',
];

export interface ProductAttribute {
  id: string;
  product_id?: string;
  attribute_name?: string;
  key: string;
  value: string | null;
  unit?: string | null;
  confidence: number;
  status?: 'extracted' | 'ai_enriched' | 'needs_review' | 'verified' | 'unverified' | 'not_found' | 'missing' | string;
  source_id?: string | null;
  source_location?: string | null;
  extraction_method?: string | null;
  source_priority?: number;
  source_name?: string;
  source_url?: string | null;
  evidence_text?: string;
  source?: string;
  verified?: boolean;
}

export interface ProductSource {
  id: string;
  product_id: string;
  source_type: SourceType;
  source_name: string;
  source_url?: string;
  storage_path?: string;
  status: SourceStatus;
  reliability_score: number;
  created_at: string;
}

export interface ProductDocument {
  id: string;
  product_id: string;
  file_name: string;
  file_type: string;
  file_path: string;
  file_size: number;
  upload_status: string;
  created_at: string;
}

export interface JobStage {
  code: string;
  name: string;
  status: 'completed' | 'in_progress' | 'pending' | 'failed';
}

export interface JobStatusResponse {
  job_id: string;
  product_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  current_stage: string;
  progress: number;
  stages_breakdown: JobStage[];
}

export interface Product {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  model_number?: string;
  description?: string;
  product_url?: string;
  image_url?: string;
  is_demo?: boolean;
  status: ProductStatus;
  confidence_score: number;
  created_at: string;
  updated_at: string;
  attributes?: ProductAttribute[];
  sources?: ProductSource[];
  documents?: ProductDocument[];
  sources_count?: number;
  conflicts_count?: number;
}

export interface CreateProductInput {
  name: string;
  manufacturer: string;
  category: string;
  model_number?: string;
  description?: string;
  product_url?: string;
}

export interface ProductFilters {
  search: string;
  status: string;
  category: string;
  sortBy: 'updated_at' | 'name' | 'confidence_score';
  sortOrder: 'asc' | 'desc';
}
