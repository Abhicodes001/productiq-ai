from typing import Optional
from fastapi import Header, HTTPException, status

async def get_current_user_optional(authorization: Optional[str] = Header(None)):
    """
    Optional authentication dependency for Phase 1 API layer.
    """
    if authorization:
        token = authorization.replace("Bearer ", "")
        return {"id": "user-123", "email": "demo@productiq.ai", "token": token}
    return None
