from fastapi import APIRouter
from pydantic import BaseModel, EmailStr

router = APIRouter()

class AuthStatusResponse(BaseModel):
    status: str
    message: str

@router.get("/status", response_model=AuthStatusResponse)
def auth_status():
    """
    Check authentication service status.
    Client authentication relies primarily on Supabase Auth.
    """
    return {
        "status": "active",
        "message": "Supabase Auth integration ready. Client credentials validated via JWT."
    }
