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
    model_number: input.model_number,
    description: input.description,
    product_url: input.product_url,
    status: 'processing',
    confidence_score: 0.85,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sources_count: input.product_url ? 1 : 0,
    conflicts_count: 0,
    sources: input.product_url ? [
      {
        id: crypto.randomUUID(),
        product_id: '',
        source_type: 'website',
        source_name: `Web Spec Source (${input.name})`,
        source_url: input.product_url,
        status: 'processed',
        reliability_score: 0.95,
        created_at: new Date().toISOString(),
      }
    ] : [],
    documents: [],
    attributes: [
      { id: 'p1', key: 'Nominal Operating Voltage', value: '230 V AC', unit: 'V', confidence: 0.95, verified: true },
      { id: 'p2', key: 'Enclosure Rating', value: 'IP67 / NEMA 4X', confidence: 0.98, verified: true },
      { id: 'p3', key: 'Operating Temperature', value: '-25°C to +60°C', unit: '°C', confidence: 0.90, verified: true },
    ],
  };

  localProductsStore.unshift(newProduct);
  return newProduct;
}

export async function uploadProductDocument(productId: string, file: File): Promise<any> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/products/${productId}/documents`, {
      method: 'POST',
      body: formData,
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Backend API offline, recording PDF document upload locally:', error);
  }

  const prod = localProductsStore.find((p) => p.id === productId);
  const docRecord = {
    id: crypto.randomUUID(),
    product_id: productId,
    file_name: file.name,
    file_type: file.type || 'application/pdf',
    file_path: `/storage/documents/${productId}/${file.name}`,
    file_size: file.size,
    upload_status: 'uploaded',
    created_at: new Date().toISOString(),
  };

  if (prod) {
    if (!prod.documents) prod.documents = [];
    prod.documents.push(docRecord);
    if (!prod.sources) prod.sources = [];
    prod.sources.push({
      id: crypto.randomUUID(),
      product_id: productId,
      source_type: 'pdf',
      source_name: file.name,
      storage_path: docRecord.file_path,
      status: 'processed',
      reliability_score: 0.98,
      created_at: new Date().toISOString(),
    });
    prod.sources_count = prod.sources.length;
  }

  return docRecord;
}

export async function uploadProductImage(productId: string, file: File): Promise<any> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE_URL}/products/${productId}/images`, {
      method: 'POST',
      body: formData,
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Backend API offline, recording product image upload locally:', error);
  }

  const prod = localProductsStore.find((p) => p.id === productId);
  const docRecord = {
    id: crypto.randomUUID(),
    product_id: productId,
    file_name: file.name,
    file_type: file.type || 'image/png',
    file_path: `/storage/images/${productId}/${file.name}`,
    file_size: file.size,
    upload_status: 'uploaded',
    created_at: new Date().toISOString(),
  };

  if (prod) {
    if (!prod.documents) prod.documents = [];
    prod.documents.push(docRecord);
    if (!prod.sources) prod.sources = [];
    prod.sources.push({
      id: crypto.randomUUID(),
      product_id: productId,
      source_type: 'image',
      source_name: file.name,
      storage_path: docRecord.file_path,
      status: 'processed',
      reliability_score: 0.92,
      created_at: new Date().toISOString(),
    });
    prod.sources_count = prod.sources.length;
  }

  return docRecord;
}

export async function startProductAnalysis(productId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/analyze`, {
      method: 'POST',
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('Backend API offline, starting simulated analysis job:', error);
  }

  const prod = localProductsStore.find((p) => p.id === productId);
  if (prod) prod.status = 'processing';

  return {
    id: crypto.randomUUID(),
    product_id: productId,
    status: 'processing',
    current_stage: 'input_received',
    progress: 20,
  };
}

export async function fetchJobStatus(productId: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${productId}/status`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    // Offline simulation mode fallback
  }

  const prod = localProductsStore.find((p) => p.id === productId);

  return {
    job_id: 'job-' + productId.substring(0, 8),
    product_id: productId,
    status: prod?.status === 'processing' ? 'processing' : 'completed',
    current_stage: prod?.status === 'processing' ? 'documents_processing' : 'finalization',
    progress: prod?.status === 'processing' ? 65 : 100,
    stages_breakdown: [
      { code: 'input_received', name: 'Input received', status: 'completed' },
      { code: 'website_processing', name: 'Website processing', status: 'completed' },
      { code: 'documents_processing', name: 'Documents processing', status: prod?.status === 'processing' ? 'in_progress' : 'completed' },
      { code: 'images_processing', name: 'Images processing', status: prod?.status === 'processing' ? 'pending' : 'completed' },
      { code: 'ai_extraction', name: 'AI extraction', status: prod?.status === 'processing' ? 'pending' : 'completed' },
      { code: 'validation', name: 'Validation', status: prod?.status === 'processing' ? 'pending' : 'completed' },
      { code: 'finalization', name: 'Finalization', status: prod?.status === 'processing' ? 'pending' : 'completed' },
    ]
  };
}
