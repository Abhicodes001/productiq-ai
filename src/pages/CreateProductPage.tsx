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
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useProducts } from '../hooks/useProducts';

export const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { addProduct } = useProducts();

  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [category, setCategory] = useState('Programmable Logic Controllers');
  const [productUrl, setProductUrl] = useState('');
  
  // File upload state placeholders
  const [pdfFiles, setPdfFiles] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Programmable Logic Controllers',
    'Variable Frequency Drives',
    'Process Sensors & Instrumentation',
    'Industrial Robotics',
    'Pneumatic Actuators & Valves',
    'Human Machine Interfaces (HMI)',
  ];

  const handleSimulatePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const names = Array.from(e.target.files).map((f) => f.name);
      setPdfFiles((prev) => [...prev, ...names]);
    }
  };

  const handleSimulateImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const names = Array.from(e.target.files).map((f) => f.name);
      setImageFiles((prev) => [...prev, ...names]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !manufacturer) return;

    setIsSubmitting(true);
    try {
      const created = await addProduct({
        name,
        manufacturer,
        category,
        product_url: productUrl || undefined,
      });

      setIsSubmitting(false);
      navigate(`/products/${created.id}`);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">
          Create New Product
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Add a product record and attach technical PDF datasheets or image documentation for extraction.
        </p>
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

        {/* Technical Documents Upload Placeholder Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-6 space-y-4">
          <h2 className="text-xs font-bold text-slate-100 uppercase tracking-wider border-b border-slate-800/80 pb-2">
            2. Technical Sources & Media Uploads (Phase 1 Visual Placeholder)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* PDF Upload Box */}
            <div className="border-2 border-dashed border-slate-800 hover:border-sky-500/60 transition-colors rounded-lg p-6 text-center bg-slate-950/40 relative group">
              <input
                type="file"
                accept=".pdf"
                multiple
                onChange={handleSimulatePdfUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
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

              {pdfFiles.length > 0 && (
                <div className="mt-3 text-left space-y-1">
                  {pdfFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] text-sky-400 font-mono bg-sky-950/40 px-2 py-1 rounded border border-sky-900/50">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="truncate">{file}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Image Upload Box */}
            <div className="border-2 border-dashed border-slate-800 hover:border-sky-500/60 transition-colors rounded-lg p-6 text-center bg-slate-950/40 relative group">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleSimulateImageUpload}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
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

              {imageFiles.length > 0 && (
                <div className="mt-3 text-left space-y-1">
                  {imageFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] text-indigo-400 font-mono bg-indigo-950/40 px-2 py-1 rounded border border-indigo-900/50">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span className="truncate">{file}</span>
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
            <span>{isSubmitting ? 'Creating...' : 'Continue to Data Sources'}</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
