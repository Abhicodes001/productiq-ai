import asyncio
import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List
from app.document_processing.web_scraper import WebScraperService
from app.document_processing.pdf_processor import PDFProcessorService
from app.vision.vision_service import VisionAIService
from app.rag.llm_extractor import LLMExtractorService
from app.services.product_service import MOCK_PRODUCTS_DB, MOCK_JOBS_DB

logger = logging.getLogger(__name__)

STAGES = [
    {"code": "input_validation", "name": "Input validation", "progress": 15},
    {"code": "website_extraction", "name": "Website content extraction", "progress": 35},
    {"code": "pdf_extraction", "name": "PDF document intelligence", "progress": 55},
    {"code": "image_analysis", "name": "Vision AI image analysis", "progress": 75},
    {"code": "attribute_extraction", "name": "LLM structured spec extraction", "progress": 90},
    {"code": "structured_storage", "name": "Structured data storage", "progress": 100},
]

class IngestionPipelineService:
    """
    Master pipeline orchestrator that executes the 6 Phase 3 processing stages:
    1. Input validation
    2. Website extraction
    3. PDF extraction (page-by-page)
    4. Image analysis (observed vs inferred)
    5. Attribute extraction (LLM schema)
    6. Structured data storage
    """

    @staticmethod
    async def run_ingestion_pipeline(product_id: str, job_id: str):
        logger.info(f"Starting Phase 3 pipeline for product '{product_id}', job '{job_id}'")
        product = MOCK_PRODUCTS_DB.get(product_id)
        if not product:
            logger.error(f"Product '{product_id}' not found for job execution.")
            return

        job = MOCK_JOBS_DB.get(product_id)
        if not job:
            job = {
                "id": job_id,
                "product_id": product_id,
                "status": "processing",
                "current_stage": "input_validation",
                "progress": 15,
                "error_message": None,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
            }
            MOCK_JOBS_DB[product_id] = job

        job["status"] = "processing"

        pdf_extracted_pages: List[Dict[str, Any]] = []
        web_extracted_data: Dict[str, Any] = {}
        image_extracted_data: Dict[str, Any] = {}

        try:
            # Stage 1: Input Validation
            job["current_stage"] = "input_validation"
            job["progress"] = 15
            job["updated_at"] = datetime.now(timezone.utc)
            await asyncio.sleep(0.4)

            # Stage 2: Website Extraction
            job["current_stage"] = "website_extraction"
            job["progress"] = 35
            job["updated_at"] = datetime.now(timezone.utc)

            web_sources = [s for s in product.get("sources", []) if s.get("source_type") == "website"]
            url = product.get("product_url")
            if web_sources and web_sources[0].get("source_url"):
                url = web_sources[0].get("source_url")

            if url:
                web_extracted_data = await WebScraperService.scrape_url(url, max_depth_pages=3)
                for ws in web_sources:
                    ws["status"] = "processed"

            await asyncio.sleep(0.5)

            # Stage 3: PDF Document Intelligence
            job["current_stage"] = "pdf_extraction"
            job["progress"] = 55
            job["updated_at"] = datetime.now(timezone.utc)

            pdf_sources = [s for s in product.get("sources", []) if s.get("source_type") == "pdf"]
            for ps in pdf_sources:
                pdf_res = PDFProcessorService.process_pdf(
                    file_path=ps.get("storage_path", ps.get("source_name", "manual.pdf")),
                    document_id=ps.get("id")
                )
                ps["status"] = "processed"
                pdf_extracted_pages.extend(pdf_res.get("pages", []))

            await asyncio.sleep(0.5)

            # Stage 4: Vision AI Image Analysis
            job["current_stage"] = "image_analysis"
            job["progress"] = 75
            job["updated_at"] = datetime.now(timezone.utc)

            img_sources = [s for s in product.get("sources", []) if s.get("source_type") == "image"]
            if img_sources:
                ims = img_sources[0]
                image_extracted_data = VisionAIService.process_image(
                    file_path=ims.get("storage_path", ims.get("source_name", "label.png")),
                    image_id=ims.get("id")
                )
                ims["status"] = "processed"

            await asyncio.sleep(0.5)

            # Stage 5: Attribute Extraction (LLM Structured Schema)
            job["current_stage"] = "attribute_extraction"
            job["progress"] = 90
            job["updated_at"] = datetime.now(timezone.utc)

            extracted_items = LLMExtractorService.extract_structured_product(
                product_info=product,
                pdf_pages=pdf_extracted_pages,
                web_content=web_extracted_data,
                image_content=image_extracted_data
            )

            await asyncio.sleep(0.5)

            # Stage 6: Structured Data Storage
            job["current_stage"] = "structured_storage"
            job["progress"] = 100
            job["updated_at"] = datetime.now(timezone.utc)

            stored_attributes = []
            verified_count = 0

            for item in extracted_items:
                attr_id = str(uuid.uuid4())
                is_verified = item["status"] == "verified"
                if is_verified:
                    verified_count += 1

                stored_attributes.append({
                    "id": attr_id,
                    "product_id": product_id,
                    "attribute_name": item["attribute_name"],
                    "key": item["key"],
                    "value": item["value"],
                    "unit": item["unit"],
                    "confidence": item["confidence"],
                    "status": item["status"],
                    "source_id": None,
                    "source_location": item["source_reference"],
                    "extraction_method": item["extraction_method"],
                    "verified": is_verified
                })

            product["attributes"] = stored_attributes
            
            # Compute confidence score
            valid_confs = [a["confidence"] for a in stored_attributes if a["status"] != "not_found"]
            avg_conf = sum(valid_confs) / len(valid_confs) if valid_confs else 0.85
            product["confidence_score"] = round(avg_conf, 2)
            product["status"] = "verified" if avg_conf >= 0.90 else "needs_review"
            product["updated_at"] = datetime.now(timezone.utc)

            job["status"] = "completed"
            logger.info(f"Phase 3 Pipeline completed for job '{job_id}'. Stored {len(stored_attributes)} attributes ({verified_count} verified).")

        except Exception as e:
            logger.error(f"Pipeline processing error for job '{job_id}': {e}")
            job["status"] = "failed"
            job["error_message"] = str(e)
            product["status"] = "failed"
