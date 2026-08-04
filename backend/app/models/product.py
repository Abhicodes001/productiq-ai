# Data models representation
from pydantic import BaseModel

class ProductModel(BaseModel):
    id: str
    name: str
    manufacturer: str
    category: str
    product_url: str | None = None
    status: str
    confidence_score: float
