from fastapi import APIRouter, HTTPException, Query, UploadFile, File, Form, status
from typing import List, Optional
from app.schemas.product import ProductCreate, ProductUpdate, ProductDetailResponse
from app.schemas.source import SourceCreate, SourceResponse, DocumentResponse
from app.schemas.job import JobResponse, JobStatusResponse
from app.schemas.rag import (
    IndexProductResponse,
    VectorSearchRequest,
    VectorSearchResponse,
    VerifyAttributeRequest,
    VerifyAttributeResponse,
    ProductQARequest,
    ProductQAResponse,
)
from app.schemas.enrichment import (
    DetectMissingResponse,
    EnrichmentRequest,
    EnrichmentResponse,
    EnrichmentSummaryResponse,
)
from app.schemas.validation import (
    ConflictItem,
    ReviewActionRequest,
    ReviewHistoryItem,
    ValidationSummary,
)
from app.services.product_service import ProductService
from app.rag.rag_service import RAGService
from app.agents.missing_data_detector import MissingDataDetector
from app.agents.orchestrator import ProductIntelligenceOrchestrator
from app.validation.validator import ValidationEngine

router = APIRouter()

MAX_PDF_SIZE_BYTES = 50 * 1024 * 1024  # 50MB limit
MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024 # 10MB limit

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}

@router.get("", response_model=List[ProductDetailResponse])
def get_products(
    status: Optional[str] = Query(None, description="Filter by product status"),
    category: Optional[str] = Query(None, description="Filter by product category"),
    search: Optional[str] = Query(None, description="Search by product name or manufacturer")
):
    return ProductService.get_products(status=status, category=category, search=search)

@router.post("", response_model=ProductDetailResponse, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate):
    return ProductService.create_product(product_in)

@router.get("/{product_id}", response_model=ProductDetailResponse)
def get_product(product_id: str):
    product = ProductService.get_product_by_id(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found"
        )
    return product

@router.put("/{product_id}", response_model=ProductDetailResponse)
def update_product(product_id: str, product_in: ProductUpdate):
    product = ProductService.update_product(product_id, product_in)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found"
        )
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: str):
    success = ProductService.delete_product(product_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found"
        )
    return None

# ==========================================
# PHASE 2: DATA INGESTION ENDPOINTS
# ==========================================

@router.post("/{product_id}/sources", response_model=SourceResponse, status_code=status.HTTP_201_CREATED)
def add_product_source(product_id: str, source_in: SourceCreate):
    """
    Attach a URL or external resource source record to a product.
    """
    if source_in.source_type == "website" and source_in.source_url:
        if not source_in.source_url.startswith(("http://", "https://")):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="URL must start with http:// or https://"
            )

    return ProductService.add_source(product_id, source_in)

@router.post("/{product_id}/documents", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_product_document(product_id: str, file: UploadFile = File(...)):
    """
    Upload PDF technical document for a product.
    Validates file extension and size.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF documents (.pdf) are allowed."
        )

    content = await file.read()
    if len(content) > MAX_PDF_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds maximum limit of 50MB."
        )

    return ProductService.upload_document(
        product_id=product_id,
        file_name=file.filename,
        file_type="application/pdf",
        file_size=len(content),
        content=content
    )

@router.post("/{product_id}/images", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_product_image(product_id: str, file: UploadFile = File(...)):
    """
    Upload JPG, JPEG, PNG, WEBP product image.
    """
    ext = os_ext(file.filename or "")
    if ext not in {".jpg", ".jpeg", ".png", ".webp"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Allowed formats: JPG, JPEG, PNG, WEBP."
        )

    content = await file.read()
    if len(content) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Image size exceeds maximum limit of 10MB."
        )

    return ProductService.upload_image(
        product_id=product_id,
        file_name=file.filename or "image.png",
        file_type=file.content_type or "image/png",
        file_size=len(content),
        content=content
    )

@router.post("/{product_id}/analyze", response_model=JobResponse, status_code=status.HTTP_202_ACCEPTED)
def start_product_analysis(product_id: str):
    """
    Create processing job for product analysis pipeline.
    """
    product = ProductService.get_product_by_id(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found"
        )

    return ProductService.create_processing_job(product_id)

@router.post("/{product_id}/process-documents", response_model=JobResponse, status_code=status.HTTP_202_ACCEPTED)
def process_product_documents(product_id: str):
    """
    Triggers PDF document intelligence page-by-page text & layout parsing.
    """
    product = ProductService.get_product_by_id(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found"
        )

    return ProductService.create_processing_job(product_id)

@router.post("/{product_id}/extract", response_model=JobResponse, status_code=status.HTTP_202_ACCEPTED)
def extract_product_attributes(product_id: str):
    """
    Triggers structured LLM attribute extraction pipeline across PDF, web, and visual image sources.
    """
    product = ProductService.get_product_by_id(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found"
        )

    return ProductService.create_processing_job(product_id)

@router.get("/{product_id}/attributes")
def get_product_attributes(product_id: str):
    """
    Fetch structured extracted product attributes with confidence scores, source references, and missing status.
    """
    product = ProductService.get_product_by_id(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found"
        )
    return product.get("attributes", [])

@router.get("/{product_id}/sources")
def get_product_sources(product_id: str):
    """
    Fetch attached website URLs, PDF datasheets, and image sources for a product.
    """
    product = ProductService.get_product_by_id(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found"
        )
    return {
        "sources": product.get("sources", []),
        "documents": product.get("documents", [])
    }

@router.get("/{product_id}/status", response_model=JobStatusResponse)
def get_product_job_status(product_id: str):
    """
    Fetch status and stage progress of active processing job.
    """
    status_info = ProductService.get_job_status(product_id)
    if not status_info:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No processing job found for product '{product_id}'"
        )
    return status_info

# ==========================================
# PHASE 4: RAG, VECTOR SEARCH & CITATION ENDPOINTS
# ==========================================

@router.post("/{product_id}/index", response_model=IndexProductResponse)
def index_product_documents(product_id: str):
    """
    Build vector database index for product document and website content chunks.
    """
    product = ProductService.get_product_by_id(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found"
        )
    return RAGService.index_product_documents(product_id)

@router.post("/{product_id}/search", response_model=VectorSearchResponse)
def search_product_vector_db(product_id: str, search_in: VectorSearchRequest):
    """
    Perform semantic similarity search over chunks filtered strictly by product_id.
    """
    product = ProductService.get_product_by_id(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found"
        )
    
    results = RAGService.search_vector_db(
        product_id=product_id,
        query=search_in.query,
        top_k=search_in.top_k,
        min_score=search_in.min_score
    )

    chunks = [
        {
            "chunk_id": r["chunk_id"],
            "text": r["text"],
            "similarity_score": r["similarity_score"],
            "metadata": r["metadata"]
        }
        for r in results
    ]

    return {
        "product_id": product_id,
        "query": search_in.query,
        "results_count": len(chunks),
        "chunks": chunks
    }

@router.post("/{product_id}/verify", response_model=VerifyAttributeResponse)
def verify_product_attribute(product_id: str, verify_in: VerifyAttributeRequest):
    """
    Verify an extracted product attribute against RAG vector sources.
    """
    product = ProductService.get_product_by_id(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found"
        )
    
    return RAGService.verify_attribute(
        product_id=product_id,
        attribute_name=verify_in.attribute_name,
        current_value=verify_in.current_value
    )

@router.post("/{product_id}/ask", response_model=ProductQAResponse)
def ask_product_question(product_id: str, qa_in: ProductQARequest):
    """
    Product Q&A returning grounded LLM answer strictly using RAG retrieved context with citations.
    """
    product = ProductService.get_product_by_id(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found"
        )
    
    return RAGService.ask_product_question(
        product_id=product_id,
        question=qa_in.question,
        top_k=qa_in.top_k
    )

# ==========================================
# PHASE 5: AI ENRICHMENT & MULTI-AGENT ENDPOINTS
# ==========================================

@router.post("/{product_id}/detect-missing", response_model=DetectMissingResponse)
def detect_missing_product_attributes(product_id: str):
    """
    Detect missing technical specifications based on industrial domain category schemas.
    """
    product = ProductService.get_product_by_id(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found"
        )

    res = MissingDataDetector.detect_missing_attributes(
        category=product.get("category", "default"),
        existing_attributes=product.get("attributes", [])
    )
    return {
        "product_id": product_id,
        **res
    }

@router.post("/{product_id}/enrich", response_model=EnrichmentResponse)
def enrich_missing_product_attributes(product_id: str, enrich_in: Optional[EnrichmentRequest] = None):
    """
    Trigger central Product Intelligence Orchestrator to execute multi-agent AI enrichment workflow across P1-P5 source tiers.
    """
    product = ProductService.get_product_by_id(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found"
        )

    max_p = enrich_in.max_source_priority if enrich_in else 5
    return ProductIntelligenceOrchestrator.run_enrichment_pipeline(product_id=product_id, max_priority=max_p)

@router.get("/{product_id}/enrichment-summary", response_model=EnrichmentSummaryResponse)
def get_product_enrichment_summary(product_id: str):
    """
    Fetch comprehensive breakdown of extracted vs AI enriched vs missing attributes with source priority metrics.
    """
    product = ProductService.get_product_by_id(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found"
        )

    return ProductIntelligenceOrchestrator.get_enrichment_summary(product_id=product_id)

# ==========================================
# PHASE 6: VALIDATION, CONFLICT DETECTION & HUMAN REVIEW ENDPOINTS
# ==========================================

@router.post("/{product_id}/validate", response_model=ValidationSummary)
def validate_product_sources(product_id: str):
    """
    Execute cross-source validation across PDF, Web, Catalogs, Vision OCR, and AI Enrichment.
    """
    product = ProductService.get_product_by_id(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found"
        )
    return ValidationEngine.validate_product(product_id)

@router.get("/{product_id}/conflicts", response_model=List[ConflictItem])
def get_product_conflicts(product_id: str):
    """
    Fetch open attribute conflicts and candidate values requiring human review.
    """
    return ValidationEngine.get_conflicts(product_id)

@router.post("/{product_id}/conflicts/{conflict_id}/resolve")
def resolve_product_conflict(product_id: str, conflict_id: str, action_in: ReviewActionRequest):
    """
    Execute human review action (select candidate A/B, manual edit, mark NA, reject AI) and update attribute status to human_verified.
    """
    return ValidationEngine.resolve_conflict(product_id, conflict_id, action_in.dict())

@router.get("/{product_id}/review-history", response_model=List[ReviewHistoryItem])
def get_product_review_history(product_id: str):
    """
    Fetch audit trail history log of resolved human review actions.
    """
    return ValidationEngine.get_review_history(product_id)

@router.get("/review-center/queue")
def get_global_review_queue():
    """
    Fetch active global review queue across all products.
    """
    return ValidationEngine.get_global_review_queue()

def os_ext(filename: str) -> str:
    import os
    return os.path.splitext(filename)[1].lower()
