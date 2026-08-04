from pydantic import BaseModel, HttpUrl, Field
from typing import Optional, Literal
from datetime import datetime
from uuid import UUID

SourceType = Literal['website', 'pdf', 'image', 'manual']
SourceStatus = Literal['pending', 'processing', 'processed', 'failed']

class SourceCreate(BaseModel):
    source_type: SourceType
    source_name: str
    source_url: Optional[str] = None
    storage_path: Optional[str] = None

class SourceResponse(BaseModel):
    id: UUID
    product_id: UUID
    source_type: SourceType
    source_name: str
    source_url: Optional[str] = None
    storage_path: Optional[str] = None
    status: SourceStatus
    reliability_score: float
    created_at: datetime

    class Config:
        from_attributes = True

class DocumentResponse(BaseModel):
    id: UUID
    product_id: UUID
    file_name: str
    file_type: str
    file_path: str
    file_size: int
    upload_status: str
    created_at: datetime

    class Config:
        from_attributes = True
