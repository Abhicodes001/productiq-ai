import uuid
import os
import re
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from app.schemas.product import ProductCreate, ProductUpdate
from app.schemas.source import SourceCreate
from app.database.session import get_supabase_client

# In-memory storage structures for development/demo fallback
MOCK_PRODUCTS_DB: Dict[str, dict] = {
    "77777777-7777-7777-7777-777777777777": {
        "id": "77777777-7777-7777-7777-777777777777",
        "name": "Flowserve Durco Mark 3 ISO Industrial Centrifugal Pump",
        "manufacturer": "Flowserve Corporation",
        "category": "Industrial Centrifugal Pumps",
        "model_number": "Mark 3 ISO 50-32-200",
        "description": "Heavy-duty end-suction chemical process centrifugal pump conforming strictly to ISO 2858 and ISO 5199 hydraulic & dimensional standards.",
        "product_url": "https://www.flowserve.com/en/products/pumps/durco-mark-3-iso",
        "image_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
        "status": "needs_review",
        "confidence_score": 0.84,
        "is_demo": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "attributes": [
            {"id": "pump-attr-1", "key": "Rated Flow Rate", "value": "140", "unit": "m³/h", "confidence": 0.96, "verified": True, "source": "PDF Datasheet p.4"},
            {"id": "pump-attr-2", "key": "Total Dynamic Head", "value": "65", "unit": "m", "confidence": 0.94, "verified": True, "source": "PDF Datasheet p.4"},
            {"id": "pump-attr-3", "key": "Motor Power Rating", "value": "30", "unit": "kW", "confidence": 0.98, "verified": True, "source": "Web Specification"},
            {"id": "pump-attr-4", "key": "Nominal Impeller Diameter", "value": "200", "unit": "mm", "confidence": 0.92, "verified": True, "source": "Vision OCR Nameplate"},
            {"id": "pump-attr-5", "key": "Max Operating Temperature", "value": "180", "unit": "°C", "confidence": 0.72, "verified": False, "source": "Discrepancy (PDF: 180°C / Web: 210°C)", "status": "conflict"},
            {"id": "pump-attr-6", "key": "Casing Material", "value": "Duplex Stainless Steel 2205", "unit": None, "confidence": 0.95, "verified": True, "source": "PDF Datasheet p.6"},
            {"id": "pump-attr-7", "key": "Inlet Suction Flange", "value": "50", "unit": "mm", "confidence": 0.99, "verified": True, "source": "ISO 2858 Specs"},
            {"id": "pump-attr-8", "key": "Outlet Discharge Flange", "value": "32", "unit": "mm", "confidence": 0.99, "verified": True, "source": "ISO 2858 Specs"},
            {"id": "pump-attr-9", "key": "Shaft Sealing System", "value": "Cartridge Mechanical Seal", "unit": None, "confidence": 0.91, "verified": True, "source": "Catalog Data"},
            {"id": "pump-attr-10", "key": "ECCN Classification Code", "value": "2B350.i", "unit": None, "confidence": 0.98, "verified": True, "source": "AI Enrichment (Export Compliance Agent)"},
            {"id": "pump-attr-11", "key": "Harmonized System (HS) Code", "value": "8413.70.20", "unit": None, "confidence": 0.97, "verified": True, "source": "AI Enrichment (Taxonomy Agent)"},
            {"id": "pump-attr-12", "key": "Ingress Protection Rating", "value": "IP66", "unit": None, "confidence": 0.93, "verified": True, "source": "AI Enrichment (Domain Schema Agent)"},
            {"id": "pump-attr-13", "key": "Regulatory Standard", "value": "ISO 2858 / ISO 5199 / ATEX Zone 1", "unit": None, "confidence": 0.99, "verified": True, "source": "AI Enrichment (Standardization Agent)"},
            {"id": "pump-attr-14", "key": "Recommended Service Interval", "value": "8,000", "unit": "Operating Hours", "confidence": 0.89, "verified": True, "source": "AI Enrichment (Maintenance Agent)"},
        ],
        "sources": [
            {
                "id": "src-pump-1",
                "product_id": "77777777-7777-7777-7777-777777777777",
                "source_type": "pdf",
                "source_name": "Durco_Mark3_ISO_Technical_Catalog.pdf",
                "source_url": None,
                "storage_path": "/storage/documents/Durco_Mark3_ISO_Technical_Catalog.pdf",
                "status": "processed",
                "reliability_score": 0.98,
                "created_at": datetime.now(timezone.utc),
            },
            {
                "id": "src-pump-2",
                "product_id": "77777777-7777-7777-7777-777777777777",
                "source_type": "website",
                "source_name": "Flowserve Official Catalog Webpage",
                "source_url": "https://www.flowserve.com/en/products/pumps/durco-mark-3-iso",
                "storage_path": None,
                "status": "processed",
                "reliability_score": 0.95,
                "created_at": datetime.now(timezone.utc),
            },
            {
                "id": "src-pump-3",
                "product_id": "77777777-7777-7777-7777-777777777777",
                "source_type": "image",
                "source_name": "Centrifugal_Pump_Nameplate_OCR.jpg",
                "source_url": "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop",
                "storage_path": "/storage/images/Centrifugal_Pump_Nameplate_OCR.jpg",
                "status": "processed",
                "reliability_score": 0.91,
                "created_at": datetime.now(timezone.utc),
            }
        ],
        "documents": [
            {
                "id": "doc-pump-1",
                "product_id": "77777777-7777-7777-7777-777777777777",
                "file_name": "Durco_Mark3_ISO_Technical_Catalog.pdf",
                "file_type": "application/pdf",
                "file_path": "/storage/documents/Durco_Mark3_ISO_Technical_Catalog.pdf",
                "file_size": 3984000,
                "upload_status": "uploaded",
                "created_at": datetime.now(timezone.utc),
            },
            {
                "id": "doc-pump-2",
                "product_id": "77777777-7777-7777-7777-777777777777",
                "file_name": "Centrifugal_Pump_Nameplate_OCR.jpg",
                "file_type": "image/jpeg",
                "file_path": "/storage/images/Centrifugal_Pump_Nameplate_OCR.jpg",
                "file_size": 1245000,
                "upload_status": "uploaded",
                "created_at": datetime.now(timezone.utc),
            }
        ],
        "sources_count": 3,
        "conflicts_count": 1,
    },
    "11111111-1111-1111-1111-111111111111": {
        "id": "11111111-1111-1111-1111-111111111111",
        "name": "Siemens SIMATIC S7-1500 CPU 1516-3 PN/DP",
        "manufacturer": "Siemens AG",
        "category": "Programmable Logic Controllers",
        "model_number": "6ES7516-3AN02-0AB0",
        "description": "High performance CPU with large program and data memory for demanding industrial automation applications.",
        "product_url": "https://mall.industry.siemens.com/product?id=6ES7516-3AN02-0AB0",
        "status": "verified",
        "confidence_score": 0.98,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "attributes": [
            {"id": str(uuid.uuid4()), "key": "Work Memory (Program)", "value": "1 MB", "unit": "MB", "confidence": 1.0, "verified": True},
            {"id": str(uuid.uuid4()), "key": "Work Memory (Data)", "value": "5 MB", "unit": "MB", "confidence": 0.99, "verified": True},
        ],
        "sources": [
            {
                "id": str(uuid.uuid4()),
                "product_id": "11111111-1111-1111-1111-111111111111",
                "source_type": "website",
                "source_name": "Siemens Industry Mall Catalog",
                "source_url": "https://mall.industry.siemens.com/product?id=6ES7516-3AN02-0AB0",
                "storage_path": None,
                "status": "processed",
                "reliability_score": 0.99,
                "created_at": datetime.now(timezone.utc),
            }
        ],
        "documents": [
            {
                "id": str(uuid.uuid4()),
                "product_id": "11111111-1111-1111-1111-111111111111",
                "file_name": "SIMATIC_S7_1500_Manual_EN.pdf",
                "file_type": "application/pdf",
                "file_path": "/storage/documents/SIMATIC_S7_1500_Manual_EN.pdf",
                "file_size": 4200150,
                "upload_status": "uploaded",
                "created_at": datetime.now(timezone.utc),
            }
        ],
        "sources_count": 2,
        "conflicts_count": 0,
    }
}

MOCK_JOBS_DB: Dict[str, dict] = {}

def sanitize_filename(filename: str) -> str:
    """Sanitizes user filename to prevent path traversal and unsafe characters."""
    filename = os.path.basename(filename)
    return re.sub(r'[^a-zA-Z0-9_.-]', '_', filename)

class ProductService:

    @staticmethod
    def get_products(status: Optional[str] = None, category: Optional[str] = None, search: Optional[str] = None) -> List[dict]:
        supabase = get_supabase_client()
        if supabase:
            try:
                query = supabase.table("products").select("*")
                if status:
                    query = query.eq("status", status)
                if category:
                    query = query.eq("category", category)
                if search:
                    query = query.ilike("name", f"%{search}%")
                response = query.execute()
                return response.data
            except Exception as e:
                print(f"Supabase query error: {e}")

        products = list(MOCK_PRODUCTS_DB.values())
        if status and status != 'all':
            products = [p for p in products if p["status"] == status]
        if category and category != 'all':
            products = [p for p in products if p["category"].lower() == category.lower()]
        if search:
            q = search.lower()
            products = [p for p in products if q in p["name"].lower() or q in p["manufacturer"].lower()]
        
        return products

    @staticmethod
    def get_product_by_id(product_id: str) -> Optional[dict]:
        supabase = get_supabase_client()
        if supabase:
            try:
                response = supabase.table("products").select("*").eq("id", product_id).execute()
                if response.data:
                    prod = response.data[0]
                    # fetch sources and docs
                    sources_res = supabase.table("sources").select("*").eq("product_id", product_id).execute()
                    docs_res = supabase.table("documents").select("*").eq("product_id", product_id).execute()
                    prod["sources"] = sources_res.data or []
                    prod["documents"] = docs_res.data or []
                    return prod
            except Exception as e:
                print(f"Supabase fetch error: {e}")

        return MOCK_PRODUCTS_DB.get(product_id)

    @staticmethod
    def create_product(product_in: ProductCreate) -> dict:
        new_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)

        product_data = {
            "id": new_id,
            "name": product_in.name,
            "manufacturer": product_in.manufacturer,
            "category": product_in.category,
            "model_number": product_in.model_number,
            "description": product_in.description,
            "product_url": product_in.product_url,
            "status": "draft",
            "confidence_score": 0.0,
            "created_at": now,
            "updated_at": now,
            "attributes": [],
            "sources": [],
            "documents": [],
            "sources_count": 0,
            "conflicts_count": 0,
        }

        # If product URL is provided, automatically attach a pending website source
        if product_in.product_url:
            source_id = str(uuid.uuid4())
            website_source = {
                "id": source_id,
                "product_id": new_id,
                "source_type": "website",
                "source_name": f"URL Source ({product_in.name})",
                "source_url": product_in.product_url,
                "storage_path": None,
                "status": "pending",
                "reliability_score": 1.0,
                "created_at": now,
            }
            product_data["sources"].append(website_source)
            product_data["sources_count"] = 1

        supabase = get_supabase_client()
        if supabase:
            try:
                res = supabase.table("products").insert({
                    "id": new_id,
                    "name": product_in.name,
                    "manufacturer": product_in.manufacturer,
                    "category": product_in.category,
                    "model_number": product_in.model_number,
                    "description": product_in.description,
                    "product_url": product_in.product_url,
                    "status": "draft",
                    "confidence_score": 0.0,
                    "created_at": now.isoformat(),
                    "updated_at": now.isoformat(),
                }).execute()
                if product_in.product_url:
                    supabase.table("sources").insert({
                        **website_source,
                        "created_at": now.isoformat()
                    }).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"Supabase insert error: {e}")

        MOCK_PRODUCTS_DB[new_id] = product_data
        return product_data

    @staticmethod
    def add_source(product_id: str, source_in: SourceCreate) -> dict:
        now = datetime.now(timezone.utc)
        source_id = str(uuid.uuid4())

        source_record = {
            "id": source_id,
            "product_id": product_id,
            "source_type": source_in.source_type,
            "source_name": source_in.source_name,
            "source_url": source_in.source_url,
            "storage_path": source_in.storage_path,
            "status": "pending",
            "reliability_score": 1.0,
            "created_at": now,
        }

        product = MOCK_PRODUCTS_DB.get(product_id)
        if product:
            product["sources"].append(source_record)
            product["sources_count"] = len(product["sources"])
            product["updated_at"] = now

        return source_record

    @staticmethod
    def upload_document(product_id: str, file_name: str, file_type: str, file_size: int, content: bytes) -> dict:
        now = datetime.now(timezone.utc)
        doc_id = str(uuid.uuid4())
        safe_name = sanitize_filename(file_name)
        storage_path = f"/storage/documents/{product_id}/{safe_name}"

        doc_record = {
            "id": doc_id,
            "product_id": product_id,
            "file_name": safe_name,
            "file_type": file_type,
            "file_path": storage_path,
            "file_size": file_size,
            "upload_status": "uploaded",
            "created_at": now,
        }

        # Also register as PDF source
        source_record = {
            "id": str(uuid.uuid4()),
            "product_id": product_id,
            "source_type": "pdf",
            "source_name": safe_name,
            "source_url": None,
            "storage_path": storage_path,
            "status": "pending",
            "reliability_score": 1.0,
            "created_at": now,
        }

        product = MOCK_PRODUCTS_DB.get(product_id)
        if product:
            product["documents"].append(doc_record)
            product["sources"].append(source_record)
            product["sources_count"] = len(product["sources"])
            product["updated_at"] = now

        return doc_record

    @staticmethod
    def upload_image(product_id: str, file_name: str, file_type: str, file_size: int, content: bytes) -> dict:
        now = datetime.now(timezone.utc)
        doc_id = str(uuid.uuid4())
        safe_name = sanitize_filename(file_name)
        storage_path = f"/storage/images/{product_id}/{safe_name}"

        doc_record = {
            "id": doc_id,
            "product_id": product_id,
            "file_name": safe_name,
            "file_type": file_type,
            "file_path": storage_path,
            "file_size": file_size,
            "upload_status": "uploaded",
            "created_at": now,
        }

        # Register as Image source
        source_record = {
            "id": str(uuid.uuid4()),
            "product_id": product_id,
            "source_type": "image",
            "source_name": safe_name,
            "source_url": None,
            "storage_path": storage_path,
            "status": "pending",
            "reliability_score": 1.0,
            "created_at": now,
        }

        product = MOCK_PRODUCTS_DB.get(product_id)
        if product:
            product["documents"].append(doc_record)
            product["sources"].append(source_record)
            product["sources_count"] = len(product["sources"])
            product["updated_at"] = now

        return doc_record

    @staticmethod
    def create_processing_job(product_id: str) -> dict:
        import asyncio
        from app.services.ingestion_service import IngestionPipelineService

        now = datetime.now(timezone.utc)
        job_id = str(uuid.uuid4())

        job_record = {
            "id": job_id,
            "product_id": product_id,
            "status": "processing",
            "current_stage": "input_received",
            "progress": 15,
            "error_message": None,
            "created_at": now,
            "updated_at": now,
        }

        MOCK_JOBS_DB[product_id] = job_record

        # Update product status to 'processing'
        product = MOCK_PRODUCTS_DB.get(product_id)
        if product:
            product["status"] = "processing"
            product["updated_at"] = now

        # Launch async task in background
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                loop.create_task(IngestionPipelineService.run_ingestion_pipeline(product_id, job_id))
            else:
                asyncio.run(IngestionPipelineService.run_ingestion_pipeline(product_id, job_id))
        except Exception as e:
            # Fallback for background execution
            asyncio.create_task(IngestionPipelineService.run_ingestion_pipeline(product_id, job_id))

        return job_record

    @staticmethod
    def get_job_status(product_id: str) -> Optional[dict]:
        stage_order = [
            ("input_validation", "Input validation"),
            ("website_extraction", "Website extraction"),
            ("pdf_extraction", "PDF extraction"),
            ("image_analysis", "Image analysis"),
            ("attribute_extraction", "Attribute extraction"),
            ("structured_storage", "Structured data storage"),
        ]

        job = MOCK_JOBS_DB.get(product_id)
        if not job:
            # Fallback default status
            job_id = str(uuid.uuid4())
            curr_stage = "input_received"
            progress = 15
            status = "completed"
        else:
            job_id = job["id"]
            curr_stage = job.get("current_stage", "input_received")
            progress = job.get("progress", 15)
            status = job.get("status", "processing")

        stages_breakdown = []
        found_current = False

        for code, name in stage_order:
            if status == "completed":
                st_status = "completed"
            elif code == curr_stage:
                st_status = "in_progress"
                found_current = True
            elif not found_current:
                st_status = "completed"
            else:
                st_status = "pending"

            stages_breakdown.append({
                "code": code,
                "name": name,
                "status": st_status
            })

        return {
            "job_id": job_id,
            "product_id": product_id,
            "status": status,
            "current_stage": curr_stage,
            "progress": progress,
            "stages_breakdown": stages_breakdown
        }
