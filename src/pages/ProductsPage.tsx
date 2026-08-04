import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  Eye,
  Boxes,
  RefreshCw,
} from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { StatusBadge } from '../components/common/StatusBadge';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/ui/Button';
import { formatDate, formatPercentage } from '../lib/utils';
import { ProductStatus } from '../types/product';

export const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const { products, loading, filters, setFilters, refreshProducts } = useProducts();

  const categories = [
    'Programmable Logic Controllers',
    'Variable Frequency Drives',
    'Process Sensors & Instrumentation',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">Products Catalog</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage, filter, and review structured product intelligence records.
          </p>
        </div>
        <Button onClick={() => navigate('/products/create')} className="gap-2">
          <Plus className="w-4 h-4" />
          <span>Create Product</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search by product name, manufacturer..."
            className="w-full bg-slate-950 border border-slate-800 rounded-md pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Filters Grid */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="bg-transparent border-none focus:outline-none text-slate-200 font-mono"
            >
              <option value="all" className="bg-slate-900 text-slate-200">Status: All</option>
              <option value="processing" className="bg-slate-900 text-slate-200">Processing</option>
              <option value="needs_review" className="bg-slate-900 text-slate-200">Needs Review</option>
              <option value="verified" className="bg-slate-900 text-slate-200">Verified</option>
              <option value="failed" className="bg-slate-900 text-slate-200">Failed</option>
              <option value="draft" className="bg-slate-900 text-slate-200">Draft</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-300">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="bg-transparent border-none focus:outline-none text-slate-200 font-mono"
            >
              <option value="all" className="bg-slate-900 text-slate-200">Category: All</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
              className="bg-transparent border-none focus:outline-none text-slate-200 font-mono"
            >
              <option value="updated_at" className="bg-slate-900 text-slate-200">Sort: Last Updated</option>
              <option value="name" className="bg-slate-900 text-slate-200">Sort: Name</option>
              <option value="confidence_score" className="bg-slate-900 text-slate-200">Sort: Confidence</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => refreshProducts()}
            className="p-2 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-xs text-slate-500 font-mono">
            Fetching product intelligence records...
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="No products found"
            description={
              filters.search || filters.status !== 'all' || filters.category !== 'all'
                ? "No product records match your current filter settings. Try adjusting your search query or filters."
                : "You haven't added any products yet. Click 'Create Product' to start building your product intelligence base."
            }
            actionLabel="Create Product"
            onAction={() => navigate('/products/create')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-mono border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">PRODUCT NAME</th>
                  <th className="px-6 py-3.5 font-semibold">MANUFACTURER</th>
                  <th className="px-6 py-3.5 font-semibold">CATEGORY</th>
                  <th className="px-6 py-3.5 font-semibold">STATUS</th>
                  <th className="px-6 py-3.5 font-semibold">CONFIDENCE</th>
                  <th className="px-6 py-3.5 font-semibold">SOURCES</th>
                  <th className="px-6 py-3.5 font-semibold">LAST UPDATED</th>
                  <th className="px-6 py-3.5 font-semibold text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <td className="px-6 py-4 font-medium text-slate-100">
                      <div className="flex flex-col">
                        <span className="group-hover:text-sky-400 transition-colors font-semibold text-xs">
                          {product.name}
                        </span>
                        {product.product_url && (
                          <span className="text-[10px] text-slate-500 font-mono truncate max-w-xs">
                            {product.product_url}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300">
                      {product.manufacturer}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 text-[11px]">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={product.status} />
                    </td>
                    <td className="px-6 py-4 font-mono">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              product.confidence_score >= 0.8
                                ? 'bg-emerald-500'
                                : product.confidence_score >= 0.5
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${product.confidence_score * 100}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-300">
                          {formatPercentage(product.confidence_score)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                      {product.sources_count || 1} sources
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                      {formatDate(product.updated_at)}
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => navigate(`/products/${product.id}`)}
                        className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
