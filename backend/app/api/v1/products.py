from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductDetailResponse
from app.services.product_service import ProductService

router = APIRouter()

@router.get("", response_model=List[ProductDetailResponse])
def get_products(
    status: Optional[str] = Query(None, description="Filter by product status"),
    category: Optional[str] = Query(None, description="Filter by product category"),
    search: Optional[str] = Query(None, description="Search by product name or manufacturer")
):
    """
    Retrieve all products with optional status, category, and search filters.
    """
    return ProductService.get_products(status=status, category=category, search=search)

@router.post("", response_model=ProductDetailResponse, status_code=status.HTTP_201_CREATED)
def create_product(product_in: ProductCreate):
    """
    Create a new industrial product entry.
    """
    return ProductService.create_product(product_in)

@router.get("/{product_id}", response_model=ProductDetailResponse)
def get_product(product_id: str):
    """
    Get detailed information for a single product by ID.
    """
    product = ProductService.get_product_by_id(product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found"
        )
    return product

@router.put("/{product_id}", response_model=ProductDetailResponse)
def update_product(product_id: str, product_in: ProductUpdate):
    """
    Update an existing product by ID.
    """
    product = ProductService.update_product(product_id, product_in)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found"
        )
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: str):
    """
    Delete a product by ID.
    """
    success = ProductService.delete_product(product_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found"
        )
    return None
