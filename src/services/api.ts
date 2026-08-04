import { Product, CreateProductInput } from '../types/product';

const API_BASE_URL = '/api';

export const mockProducts: Product[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Siemens SIMATIC S7-1500 CPU 1516-3 PN/DP',
    manufacturer: 'Siemens AG',
    category: 'Programmable Logic Controllers',
    product_url: 'https://mall.industry.siemens.com/product?id=6ES7516-3AN02-0AB0',
    status: 'verified',
    confidence_score: 0.98,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    sources_count: 3,
    conflicts_count: 0,
    attributes: [
      { id: 'a1', key: 'Work Memory (Program)', value: '1 MB', unit: 'MB', confidence: 1.0, verified: true },
      { id: 'a2', key: 'Work Memory (Data)', value: '5 MB', unit: 'MB', confidence: 0.99, verified: true },
      { id: 'a3', key: 'Processing Time (Bit Operations)', value: '10', unit: 'ns', confidence: 0.96, verified: true },
      { id: 'a4', key: 'PROFINET Interfaces', value: '2', unit: 'ports', confidence: 1.0, verified: true },
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Schneider Electric Altivar Process ATV930 45kW',
    manufacturer: 'Schneider Electric',
    category: 'Variable Frequency Drives',
    product_url: 'https://www.se.com/ww/en/product/ATV930D45N4',
    status: 'needs_review',
    confidence_score: 0.82,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    sources_count: 2,
    conflicts_count: 1,
    attributes: [
      { id: 'b1', key: 'Nominal Power', value: '45', unit: 'kW', confidence: 0.95, verified: true },
      { id: 'b2', key: 'Supply Voltage', value: '380...480 V', unit: 'V', confidence: 0.88, verified: false },
      { id: 'b3', key: 'Continuous Output Current', value: '88', unit: 'A', confidence: 0.74, verified: false },
    ],
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'ABB Industrial Drive ACS880-01-105A-4',
    manufacturer: 'ABB Drives',
    category: 'Variable Frequency Drives',
    product_url: 'https://new.abb.com/products/ACS880-01-105A-4',
    status: 'processing',
    confidence_score: 0.45,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString(),
    sources_count: 1,
    conflicts_count: 0,
    attributes: [],
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Endress+Hauser Promag P 300 Flowmeter',
    manufacturer: 'Endress+Hauser',
    category: 'Process Sensors & Instrumentation',
    product_url: 'https://www.endress.com/promag-p-300',
    status: 'verified',
    confidence_score: 0.95,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    sources_count: 4,
    conflicts_count: 0,
    attributes: [
      { id: 'c1', key: 'Nominal Diameter', value: 'DN 25 to 600', unit: 'mm', confidence: 0.98, verified: true },
      { id: 'c2', key: 'Max Process Temperature', value: '180', unit: '°C', confidence: 0.96, verified: true },
    ],
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Rockwell Allen-Bradley GuardLogix 5580',
    manufacturer: 'Rockwell Automation',
    category: 'Programmable Logic Controllers',
    product_url: 'https://www.rockwellautomation.com/guardlogix-5580',
    status: 'failed',
    confidence_score: 0.30,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    sources_count: 1,
    conflicts_count: 2,
    attributes: [],
  },
];

let localProductsStore = [...mockProducts];

export async function fetchProducts(params?: {
  status?: string;
  category?: string;
  search?: string;
}): Promise<Product[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.status && params.status !== 'all') searchParams.append('status', params.status);
    if (params?.category && params.category !== 'all') searchParams.append('category', params.category);
    if (params?.search) searchParams.append('search', params.search);

    const response = await fetch(`${API_BASE_URL}/products?${searchParams.toString()}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Backend API connection offline, using client store:', error);
  }

  // Local fallback filtering logic
  let filtered = [...localProductsStore];
  if (params?.status && params.status !== 'all') {
    filtered = filtered.filter((p) => p.status === params.status);
  }
  if (params?.category && params.category !== 'all') {
    filtered = filtered.filter(
      (p) => p.category.toLowerCase() === params.category!.toLowerCase()
    );
  }
  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(q) || p.manufacturer.toLowerCase().includes(q)
    );
  }
  return filtered;
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Backend API offline, checking client store:', error);
  }

  return localProductsStore.find((p) => p.id === id) || null;
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (response.ok) {
      const created = await response.json();
      localProductsStore.unshift(created);
      return created;
    }
  } catch (error) {
    console.warn('Backend API offline, writing to local client store:', error);
  }

  const newProduct: Product = {
    id: crypto.randomUUID(),
    name: input.name,
    manufacturer: input.manufacturer,
    category: input.category,
    product_url: input.product_url,
    status: 'processing',
    confidence_score: 0.15,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sources_count: 1,
    conflicts_count: 0,
    attributes: [],
  };

  localProductsStore.unshift(newProduct);
  return newProduct;
}
