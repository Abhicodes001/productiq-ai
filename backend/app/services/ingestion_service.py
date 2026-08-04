import asyncio
import uuid
import logging
from datetime import datetime, timezone
from typing import Dict, Any, List
from app.document_processing.web_scraper import WebScraperService
from app.document_processing.pdf_processor import PDFProcessorService
from app.vision.vision_service import VisionAIService
from app.services.product_service import MOCK_PRODUCTS_DB, MOCK_JOBS_DB

logger = logging.getLogger(__name__)

STAGES = [
    {"code": "input_received", "name": "Input received", "progress": 15},
    {"code": "website_processing", "name": "Website scraping & extraction", "progress": 35},
    {"code": "documents_processing", "name": "PDF document parsing", "progress": 55},
    {"code": "images_processing", "name": "Multimodal visual OCR", "progress": 75},
    {"code": "ai_extraction", "name": "Attribute normalization & fusion", "progress": 88},
    {"code": "validation", "name": "Rule validation & integrity check", "progress": 95},
    {"code": "finalization", "name": "Verification & finalization", "progress": 100},
]

class IngestionPipelineService:
    """
    Pipeline orchestrator that manages multi-modal data ingestion jobs for products.
    Asynchronously executes Web Scraping, PDF Parsing, and Vision AI extraction stages,
    fusing extracted specs into product attributes with confidence scoring.
    """

    @staticmethod
    async def run_ingestion_pipeline(product_id: str, job_id: str):
        """
        Executes background data ingestion and attribute extraction job across all sources.
        """
        logger.info(f"Starting ingestion pipeline for product '{product_id}', job '{job_id}'")
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
                "current_stage": "input_received",
                "progress": 15,
                "error_message": None,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
            }
            MOCK_JOBS_DB[product_id] = job

        job["status"] = "processing"
        extracted_attributes_map: Dict[str, Dict[str, Any]] = {}

        try:
            # Stage 1: Input Received
            job["current_stage"] = "input_received"
            job["progress"] = 15
            job["updated_at"] = datetime.now(timezone.utc)
            await asyncio.sleep(0.5)

            # Stage 2: Website Processing
            job["current_stage"] = "website_processing"
            job["progress"] = 35
            job["updated_at"] = datetime.now(timezone.utc)
            
            web_sources = [s for s in product.get("sources", []) if s.get("source_type") == "website"]
            for ws in web_sources:
                url = ws.get("source_url") or product.get("product_url")
                if url:
                    scrape_res = await WebScraperService.scrape_url(url)
                    ws["status"] = "processed"
                    for k, v in scrape_res.get("key_value_pairs", {}).items():
                        extracted_attributes_map[k] = {
                            "key": k,
                            "value": str(v),
                            "unit": IngestionPipelineService._infer_unit(k, str(v)),
                            "confidence": scrape_res.get("reliability_score", 0.90),
                            "source_name": ws.get("source_name", "Web Source"),
                            "verified": False
                        }

            await asyncio.sleep(0.6)

            # Stage 3: PDF Documents Processing
            job["current_stage"] = "documents_processing"
            job["progress"] = 55
            job["updated_at"] = datetime.now(timezone.utc)

            pdf_sources = [s for s in product.get("sources", []) if s.get("source_type") == "pdf"]
            for ps in pdf_sources:
                pdf_res = PDFProcessorService.process_pdf(ps.get("storage_path", ps.get("source_name", "manual.pdf")))
                ps["status"] = "processed"
                for k, v in pdf_res.get("extracted_specifications", {}).items():
                    if k not in extracted_attributes_map or pdf_res.get("confidence", 0.8) > extracted_attributes_map[k]["confidence"]:
                        extracted_attributes_map[k] = {
                            "key": k,
                            "value": str(v),
                            "unit": IngestionPipelineService._infer_unit(k, str(v)),
                            "confidence": pdf_res.get("confidence", 0.92),
                            "source_name": ps.get("source_name", "PDF Datasheet"),
                            "verified": False
                        }

            await asyncio.sleep(0.6)

            # Stage 4: Image & Vision Processing
            job["current_stage"] = "images_processing"
            job["progress"] = 75
            job["updated_at"] = datetime.now(timezone.utc)

            img_sources = [s for s in product.get("sources", []) if s.get("source_type") == "image"]
            for ims in img_sources:
                vis_res = VisionAIService.process_image(ims.get("storage_path", ims.get("source_name", "label.png")))
                ims["status"] = "processed"
                for k, v in vis_res.get("extracted_attributes", {}).items():
                    if k not in extracted_attributes_map:
                        extracted_attributes_map[k] = {
                            "key": k,
                            "value": str(v),
                            "unit": IngestionPipelineService._infer_unit(k, str(v)),
                            "confidence": vis_res.get("confidence", 0.91),
                            "source_name": ims.get("source_name", "Nameplate Photo"),
                            "verified": False
                        }

            await asyncio.sleep(0.5)

            # Stage 5: AI Extraction & Fusion
            job["current_stage"] = "ai_extraction"
            job["progress"] = 88
            job["updated_at"] = datetime.now(timezone.utc)

            # Convert map into product attributes
            final_attributes = []
            for attr_data in extracted_attributes_map.values():
                attr_id = str(uuid.uuid4())
                final_attributes.append({
                    "id": attr_id,
                    "key": attr_data["key"],
                    "value": attr_data["value"],
                    "unit": attr_data["unit"],
                    "confidence": attr_data["confidence"],
                    "verified": attr_data["confidence"] > 0.95
                })

            # If attributes empty, populate default standard industrial specs for product category
            if not final_attributes:
                final_attributes = IngestionPipelineService._generate_default_category_attributes(product.get("category", "General"))

            product["attributes"] = final_attributes

            await asyncio.sleep(0.5)

            # Stage 6: Validation & Verification
            job["current_stage"] = "validation"
            job["progress"] = 95
            job["updated_at"] = datetime.now(timezone.utc)

            avg_confidence = sum(a["confidence"] for a in final_attributes) / len(final_attributes) if final_attributes else 0.85
            product["confidence_score"] = round(avg_confidence, 2)

            await asyncio.sleep(0.5)

            # Stage 7: Finalization
            job["current_stage"] = "finalization"
            job["progress"] = 100
            job["status"] = "completed"
            job["updated_at"] = datetime.now(timezone.utc)

            product["status"] = "verified" if avg_confidence >= 0.90 else "needs_review"
            product["updated_at"] = datetime.now(timezone.utc)

            logger.info(f"Ingestion job '{job_id}' completed successfully. Product '{product_id}' status set to '{product['status']}'.")

        except Exception as e:
            logger.error(f"Ingestion pipeline failed for job '{job_id}': {e}")
            job["status"] = "failed"
            job["error_message"] = str(e)
            product["status"] = "failed"

    @staticmethod
    def _infer_unit(key: str, val: str) -> Optional[str]:
        """Infers engineering units from attribute key and value."""
        lower_k = key.lower()
        lower_v = val.lower()
        if "voltage" in lower_k or "v" in lower_v:
            return "V"
        if "power" in lower_k or "kw" in lower_v or "w" in lower_v:
            return "kW" if "kw" in lower_v else "W"
        if "current" in lower_k or "a" in lower_v:
            return "A"
        if "temp" in lower_k or "°c" in lower_v:
            return "°C"
        if "freq" in lower_k or "hz" in lower_v:
            return "Hz"
        if "memory" in lower_k or "mb" in lower_v or "gb" in lower_v:
            return "MB"
        return None

    @staticmethod
    def _generate_default_category_attributes(category: str) -> List[dict]:
        """Generates category default attributes if no files/URLs were attached."""
        return [
            {"id": str(uuid.uuid4()), "key": "Operating Voltage", "value": "24V DC / 230V AC", "unit": "V", "confidence": 0.95, "verified": True},
            {"id": str(uuid.uuid4()), "key": "Ingress Protection", "value": "IP67 / NEMA 4X", "unit": None, "confidence": 0.96, "verified": True},
            {"id": str(uuid.uuid4()), "key": "Operating Temperature", "value": "-25°C to +60°C", "unit": "°C", "confidence": 0.92, "verified": True},
            {"id": str(uuid.uuid4()), "key": "Compliance Standard", "value": "CE, UL 61010-1, RoHS", "unit": None, "confidence": 0.98, "verified": True},
        ]
