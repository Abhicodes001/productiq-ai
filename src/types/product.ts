export type ProductStatus = 'processing' | 'needs_review' | 'verified' | 'failed' | 'draft';

export interface ProductAttribute {
  id: string;
  key: string;
  value: string;
  unit?: string;
  confidence: number;
  source_id?: string;
  verified: boolean;
}

export interface Product {
  id: string;
  name: string;
  manufacturer: string;
  category: string;
  product_url?: string;
  status: ProductStatus;
  confidence_score: number;
  created_at: string;
  updated_at: string;
  attributes?: ProductAttribute[];
  sources_count?: number;
  conflicts_count?: number;
}

export interface CreateProductInput {
  name: string;
  manufacturer: string;
  category: string;
  product_url?: string;
}

export interface ProductFilters {
  search: string;
  status: string;
  category: string;
  sortBy: 'updated_at' | 'name' | 'confidence_score';
  sortOrder: 'asc' | 'desc';
}
