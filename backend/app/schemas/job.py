from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from uuid import UUID

JobStatus = Literal['pending', 'processing', 'completed', 'failed']
JobStage = Literal[
    'input_received',
    'website_processing',
    'documents_processing',
    'images_processing',
    'ai_extraction',
    'validation',
    'finalization'
]

class JobCreate(BaseModel):
    product_id: UUID

class JobResponse(BaseModel):
    id: UUID
    product_id: UUID
    status: JobStatus
    current_stage: str
    progress: int = Field(..., ge=0, le=100)
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class JobStatusResponse(BaseModel):
    job_id: UUID
    product_id: UUID
    status: JobStatus
    current_stage: str
    progress: int
    stages_breakdown: list[dict]
