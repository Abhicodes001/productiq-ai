export type ProductStatus = 'processing' | 'needs_review' | 'verified' | 'failed' | 'draft';
export type SourceType = 'website' | 'pdf' | 'image' | 'manual';
export type SourceStatus = 'pending' | 'processing' | 'processed' | 'failed';

export interface ProductAttribute {
  id: string;
  key: string;
  value: string;
  unit?: string;
  confidence: number;
  source_id?: string;
  verified: boolean;
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
