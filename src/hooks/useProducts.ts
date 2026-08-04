import { useState, useEffect, useCallback } from 'react';
import { Product, ProductFilters, CreateProductInput } from '../types/product';
import { fetchProducts, fetchProductById, createProduct as createProductApi } from '../services/api';

export function useProducts(initialFilters?: Partial<ProductFilters>) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<ProductFilters>({
    search: initialFilters?.search || '',
    status: initialFilters?.status || 'all',
    category: initialFilters?.category || 'all',
    sortBy: initialFilters?.sortBy || 'updated_at',
    sortOrder: initialFilters?.sortOrder || 'desc',
  });

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts({
        status: filters.status,
        category: filters.category,
        search: filters.search,
      });

      // Local sorting
      const sortedData = [...data].sort((a, b) => {
        let valA: any = a[filters.sortBy];
        let valB: any = b[filters.sortBy];

        if (filters.sortBy === 'updated_at') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }

        if (filters.sortOrder === 'asc') {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });

      setProducts(sortedData);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const addProduct = async (input: CreateProductInput) => {
    const newProduct = await createProductApi(input);
    setProducts((prev) => [newProduct, ...prev]);
    return newProduct;
  };

  return {
    products,
    loading,
    error,
    filters,
    setFilters,
    refreshProducts: loadProducts,
    addProduct,
  };
}

export function useProductDetail(productId?: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProductById(productId);
      setProduct(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load product details');
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  return { product, loading, error, refreshProduct: load };
}
