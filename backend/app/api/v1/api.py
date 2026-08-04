from fastapi import APIRouter
from app.api.v1 import products, auth

api_router = APIRouter()
api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
