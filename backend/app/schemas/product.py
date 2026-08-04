from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, List, Literal
from datetime import datetime
from uuid import UUID

ProductStatus = Literal['processing', 'needs_review', 'verified', 'failed', 'draft']

class ProductBase(BaseModel):
    name: str = Field(..., example="Siemens S7-1500 PLC Controller")
    manufacturer: str = Field(..., example="Siemens AG")
    category: str = Field(..., example="Industrial Automation")
    product_url: Optional[str] = Field(None, example="https://www.siemens.com/s7-1500")

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    manufacturer: Optional[str] = None
    category: Optional[str] = None
    product_url: Optional[str] = None
    status: Optional[ProductStatus] = None
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)

class ProductAttribute(BaseModel):
    id: UUID
    key: str
    value: str
    unit: Optional[str] = None
    confidence: float
    verified: bool

class ProductResponse(ProductBase):
    id: UUID
    status: ProductStatus
    confidence_score: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProductDetailResponse(ProductResponse):
    attributes: List[ProductAttribute] = []
    sources_count: int = 0
    conflicts_count: int = 0
