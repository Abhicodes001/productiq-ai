export interface SourceCitation {
  source_id?: string | null;
  source_name: string;
  source_type: 'website' | 'pdf' | 'image' | 'enrichment' | 'product_metadata' | string;
  page_number?: number | null;
  url?: string | null;
  evidence_text: string;
  similarity_score?: number;
}

export interface ChunkMetadata {
  chunk_id: string;
  product_id: string;
  document_id?: string | null;
  source_id?: string | null;
  source_type: string;
  source_name: string;
  page_number?: number | null;
  url?: string | null;
}

export interface VectorChunk {
  chunk_id: string;
  text: string;
  metadata: ChunkMetadata;
  similarity_score?: number;
}

export interface IndexProductResponse {
  product_id: string;
  status: string;
  indexed_chunks_count: number;
  collection_name: string;
  message: string;
}

export interface VectorSearchResponse {
  product_id: string;
  query: string;
  results_count: number;
  chunks: VectorChunk[];
}

export interface VerifyAttributeResponse {
  product_id: string;
  attribute_name: string;
  value: string;
  confidence: number;
  verified: boolean;
  evidence_text: string;
  supporting_sources: SourceCitation[];
}

export interface ProductQAResponse {
  product_id: string;
  question: string;
  answer: string;
  found_evidence: boolean;
  citations: SourceCitation[];
}
