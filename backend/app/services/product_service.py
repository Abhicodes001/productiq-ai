import uuid
from datetime import datetime, timezone
from typing import List, Optional, Dict
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductDetailResponse
from app.database.session import get_supabase_client

# In-memory storage fallback for initial demo testing without live database connection
MOCK_PRODUCTS_DB: Dict[str, dict] = {
    "11111111-1111-1111-1111-111111111111": {
        "id": "11111111-1111-1111-1111-111111111111",
        "name": "Siemens SIMATIC S7-1500 CPU 1516-3 PN/DP",
        "manufacturer": "Siemens AG",
        "category": "Programmable Logic Controllers",
        "product_url": "https://mall.industry.siemens.com/product?id=6ES7516-3AN02-0AB0",
        "status": "verified",
        "confidence_score": 0.98,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "attributes": [
            {"id": str(uuid.uuid4()), "key": "Work Memory (Program)", "value": "1 MB", "unit": "MB", "confidence": 1.0, "verified": True},
            {"id": str(uuid.uuid4()), "key": "Work Memory (Data)", "value": "5 MB", "unit": "MB", "confidence": 0.99, "verified": True},
            {"id": str(uuid.uuid4()), "key": "Processing Time (Bit Operations)", "value": "10", "unit": "ns", "confidence": 0.96, "verified": True},
            {"id": str(uuid.uuid4()), "key": "PROFINET Interfaces", "value": "2", "unit": "ports", "confidence": 1.0, "verified": True},
        ],
        "sources_count": 3,
        "conflicts_count": 0,
    },
    "22222222-2222-2222-2222-222222222222": {
        "id": "22222222-2222-2222-2222-222222222222",
        "name": "Schneider Electric Altivar Process ATV930 45kW",
        "manufacturer": "Schneider Electric",
        "category": "Variable Frequency Drives",
        "product_url": "https://www.se.com/ww/en/product/ATV930D45N4",
        "status": "needs_review",
        "confidence_score": 0.82,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "attributes": [
            {"id": str(uuid.uuid4()), "key": "Nominal Power", "value": "45", "unit": "kW", "confidence": 0.95, "verified": True},
            {"id": str(uuid.uuid4()), "key": "Supply Voltage", "value": "380...480 V", "unit": "V", "confidence": 0.88, "verified": False},
            {"id": str(uuid.uuid4()), "key": "Continuous Output Current", "value": "88", "unit": "A", "confidence": 0.74, "verified": False},
        ],
        "sources_count": 2,
        "conflicts_count": 1,
    },
    "33333333-3333-3333-3333-333333333333": {
        "id": "33333333-3333-3333-3333-333333333333",
        "name": "ABB Industrial Drive ACS880-01-105A-4",
        "manufacturer": "ABB Drives",
        "category": "Variable Frequency Drives",
        "product_url": "https://new.abb.com/products/ACS880-01-105A-4",
        "status": "processing",
        "confidence_score": 0.45,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "attributes": [],
        "sources_count": 1,
        "conflicts_count": 0,
    },
    "44444444-4444-4444-4444-444444444444": {
        "id": "44444444-4444-4444-4444-444444444444",
        "name": "Endress+Hauser Promag P 300 Flowmeter",
        "manufacturer": "Endress+Hauser",
        "category": "Process Sensors & Instrumentation",
        "product_url": "https://www.endress.com/promag-p-300",
        "status": "verified",
        "confidence_score": 0.95,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "attributes": [
            {"id": str(uuid.uuid4()), "key": "Nominal Diameter", "value": "DN 25 to 600", "unit": "mm", "confidence": 0.98, "verified": True},
            {"id": str(uuid.uuid4()), "key": "Max Process Temperature", "value": "180", "unit": "°C", "confidence": 0.96, "verified": True},
        ],
        "sources_count": 4,
        "conflicts_count": 0,
    },
}

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
                print(f"Supabase query error: {e}, falling back to local DB")

        # Fallback to local memory DB
        products = list(MOCK_PRODUCTS_DB.values())
        if status:
            products = [p for p in products if p["status"] == status]
        if category:
            products = [p for p in products if p["category"].lower() == category.lower()]
        if search:
            query = search.lower()
            products = [p for p in products if query in p["name"].lower() or query in p["manufacturer"].lower()]
        
        return products

    @staticmethod
    def get_product_by_id(product_id: str) -> Optional[dict]:
        supabase = get_supabase_client()
        if supabase:
            try:
                response = supabase.table("products").select("*").eq("id", product_id).execute()
                if response.data:
                    return response.data[0]
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
            "product_url": product_in.product_url,
            "status": "processing",
            "confidence_score": 0.10,
            "created_at": now,
            "updated_at": now,
        }

        supabase = get_supabase_client()
        if supabase:
            try:
                res = supabase.table("products").insert({
                    **product_data,
                    "created_at": now.isoformat(),
                    "updated_at": now.isoformat()
                }).execute()
                if res.data:
                    return res.data[0]
            except Exception as e:
                print(f"Supabase insert error: {e}")

        # Store in local mock DB
        MOCK_PRODUCTS_DB[new_id] = {
            **product_data,
            "attributes": [],
            "sources_count": 1,
            "conflicts_count": 0,
        }
        return MOCK_PRODUCTS_DB[new_id]

    @staticmethod
    def update_product(product_id: str, product_in: ProductUpdate) -> Optional[dict]:
        existing = MOCK_PRODUCTS_DB.get(product_id)
        if not existing:
            return None

        update_data = product_in.model_dump(exclude_unset=True)
        update_data["updated_at"] = datetime.now(timezone.utc)

        existing.update(update_data)
        MOCK_PRODUCTS_DB[product_id] = existing
        return existing

    @staticmethod
    def delete_product(product_id: str) -> bool:
        if product_id in MOCK_PRODUCTS_DB:
            del MOCK_PRODUCTS_DB[product_id]
            return True
        return False
