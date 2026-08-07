import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Image as ImageIcon,
  Upload,
  ArrowRight,
  PlusCircle,
  Building2,
  Globe,
  Tag,
  CheckCircle2,
  X,
  Trash2,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useProducts } from '../hooks/useProducts';
import { uploadProductDocument, uploadProductImage, startProductAnalysis } from '../services/api';
import { PRODUCT_CATEGORIES } from '../types/product';

export const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { addProduct } = useProducts();

  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [category, setCategory] = useState(PRODUCT_CATEGORIES[0]);
  const [productUrl, setProductUrl] = useState('');
  
  const [stagedPdfs, setStagedPdfs] = useState<File[]>([]);
  const [stagedImages, setStagedImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = PRODUCT_CATEGORIES;

  const handlePreFillDemoPump = () => {
    setName('Flowserve Durco Mark 3 ISO Industrial Centrifugal Pump');
    setManufacturer('Flowserve Corporation');
    setCategory('Industrial Pumps');
    setProductUrl('https://www.flowserve.com/en/products/pumps/durco-mark-3-iso');
    
    // Create dummy staged files for visual demonstration
    const pdfBlob = new Blob(['Dummy PDF content'], { type: 'application/pdf' });
    const pdfFile = new File([pdfBlob], 'Durco_Mark3_ISO_Technical_Catalog.pdf', { type: 'application/pdf' });

    const imgBlob = new Blob(['Dummy image content'], { type: 'image/jpeg' });
    const imgFile = new File([imgBlob], 'Centrifugal_Pump_Nameplate_OCR.jpg', { type: 'image/jpeg' });

    setStagedPdfs([pdfFile]);
    setStagedImages([imgFile]);
  };

  const handlePdfFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      setStagedPdfs((prev) => [...prev, ...filesArr]);
    }
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      setStagedImages((prev) => [...prev, ...filesArr]);
    }
  };

  const removeStagedPdf = (index: number) => {
    setStagedPdfs((prev) => prev.filter((_, idx) => idx !== index));
  };

  const removeStagedImage = (index: number) => {
    setStagedImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !manufacturer) return;

    setIsSubmitting(true);
    try {
      if (name.includes('Flowserve')) {
        // Fast route to preloaded demo pump
        setIsSubmitting(false);
        navigate('/products/77777777-7777-7777-7777-777777777777');
        return;
      }

      // 1. Create product record
      const created = await addProduct({
        name,
        manufacturer,
        category,
        product_url: productUrl || undefined,
      });

      // 2. Upload staged PDF datasheets
      for (const pdfFile of stagedPdfs) {
        await uploadProductDocument(created.id, pdfFile);
      }

      // 3. Upload staged Product Images
      for (const imgFile of stagedImages) {
        await uploadProductImage(created.id, imgFile);
      }

      // 4. Kick off ingestion pipeline analysis
      await startProductAnalysis(created.id);

      setIsSubmitting(false);
      navigate(`/products/${created.id}`);
    } catch (err) {
      console.error("Failed to create product or upload multi-modal data:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight font-mono">
            Create New Product
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Add a product record and attach technical PDF datasheets or image documentation for extraction.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handlePreFillDemoPump}
          className="gap-2 border-cyan-500/40 text-cyan-300 hover:border-cyan-400 text-xs font-mono shrink-0"
        >
          <span>⚡ Pre-fill Demo Pump Data</span>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800/80 pb-2">
            1. Core Product Metadata
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Product Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Siemens SIMATIC S7-1500 CPU 1516-3"
              required
            />

            <Input
              label="Manufacturer *"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              placeholder="e.g. Siemens AG"
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-md px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500 font-sans"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Product Documentation URL (Optional)"
              type="url"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="https://manufacturer.com/product-specs"
              helperText="URL source for automated web extraction"
            />
          </div>
        </div>

        {/* Technical Documents Upload Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800/80 pb-2">
            2. Technical Datasheets & Multimodal Image Sources
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PDF Upload Box */}
            <div className="border-2 border-dashed border-slate-800 hover:border-sky-500/60 transition-colors rounded-lg p-6 text-center bg-slate-950/40 relative group">
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handlePdfFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              <div className="p-3 rounded-full bg-slate-900 border border-slate-800 text-sky-400 inline-block mb-2 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-200">
                Upload Technical PDF Datasheets
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Drag and drop PDF files here or click to browse (Max 50MB)
              </p>

              {stagedPdfs.length > 0 && (
                <div className="mt-3 text-left space-y-1.5 z-20 relative">
                  {stagedPdfs.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-1.5 text-[11px] text-sky-400 font-mono bg-sky-950/60 px-2 py-1.5 rounded border border-sky-900/60">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{file.name}</span>
                        <span className="text-[10px] text-slate-500 shrink-0">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeStagedPdf(idx);
                        }}
                        className="text-slate-400 hover:text-rose-400 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Image Upload Box */}
            <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/60 transition-colors rounded-lg p-6 text-center bg-slate-950/40 relative group">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              <div className="p-3 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 inline-block mb-2 group-hover:scale-105 transition-transform">
                <ImageIcon className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-200">
                Upload Product Images / Nameplates
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Drag and drop PNG, JPG, or WEBP photos for OCR extraction
              </p>

              {stagedImages.length > 0 && (
                <div className="mt-3 text-left space-y-1.5 z-20 relative">
                  {stagedImages.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-1.5 text-[11px] text-indigo-400 font-mono bg-indigo-950/60 px-2 py-1.5 rounded border border-indigo-900/60">
                      <div className="flex items-center gap-1.5 overflow-hidden">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{file.name}</span>
                        <span className="text-[10px] text-slate-500 shrink-0">({(file.size / (1024 * 1024)).toFixed(2)} MB)</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeStagedImage(idx);
                        }}
                        className="text-slate-400 hover:text-rose-400 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/products')}
          >
            Cancel
          </Button>
          <Button type="submit" className="gap-2" disabled={isSubmitting}>
            <span>{isSubmitting ? 'Creating & Ingesting Data...' : 'Submit & Start Extraction'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
