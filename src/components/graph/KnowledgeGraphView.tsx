import React, { useState } from 'react';
import { 
  Share2, 
  Building2, 
  Tag, 
  SlidersHorizontal, 
  Briefcase, 
  ShieldCheck, 
  Layers, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw,
  Info,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../ui/Button';

export interface GraphNode {
  id: string;
  label: string;
  type: 'product' | 'manufacturer' | 'category' | 'specification' | 'application' | 'certification' | 'compatible_product';
  details?: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  label: string;
}

export interface KnowledgeGraphViewProps {
  productId: string;
  productName: string;
  graphData?: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({
  productId,
  productName,
  graphData
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Fallback demo graph data if graphData is empty
  const nodes: GraphNode[] = graphData?.nodes?.length ? graphData.nodes : [
    { id: `product-${productId}`, label: productName || 'Schneider Altivar ATV930 45kW', type: 'product', details: { model: 'ATV930D45N4', confidence: 0.98, status: 'commerce_ready' } },
    { id: 'mfr-schneider', label: 'Schneider Electric SE', type: 'manufacturer', details: { hq: 'Rueil-Malmaison, France', tier: 'Global Tier 1 OEM' } },
    { id: 'cat-vfd', label: 'Variable Frequency Drives (VFD)', type: 'category', details: { sector: 'Industrial Automation & Motion' } },
    { id: 'spec-power', label: 'Power Rating: 45 kW / 60 HP', type: 'specification', details: { key: 'Power', unit: 'kW', confidence: 0.99 } },
    { id: 'spec-voltage', label: 'Input Supply Voltage: 380...480 V', type: 'specification', details: { key: 'Voltage', unit: 'V', confidence: 0.96 } },
    { id: 'spec-ip', label: 'Enclosure Rating: IP21 / UL Type 1', type: 'specification', details: { key: 'IP Rating', unit: null, confidence: 0.98 } },
    { id: 'app-pumps', label: 'Heavy Duty Industrial Pump Drives', type: 'application', details: { industry: 'Water & Wastewater' } },
    { id: 'app-fans', label: 'Industrial Conveyors & HVAC Fans', type: 'application', details: { industry: 'Process Manufacturing' } },
    { id: 'cert-ce', label: 'CE Directive 2014/35/EU', type: 'certification', details: { standard: 'International Safety Standard' } },
    { id: 'cert-ul', label: 'UL 508C Industrial Control Equipment', type: 'certification', details: { standard: 'North American Standard' } },
    { id: 'comp-modbus', label: 'VW3A3600 Modbus TCP/IP Module', type: 'compatible_product', details: { category: 'Communication Card' } },
    { id: 'comp-filter', label: 'EMC Line Filter 45kW 400V', type: 'compatible_product', details: { category: 'Power Quality Accessory' } },
  ];

  const edges: GraphEdge[] = graphData?.edges?.length ? graphData.edges : [
    { id: 'e1', source: `product-${productId}`, target: 'mfr-schneider', relationship: 'MANUFACTURED_BY', label: 'Manufactured By' },
    { id: 'e2', source: `product-${productId}`, target: 'cat-vfd', relationship: 'BELONGS_TO', label: 'Belongs To Category' },
    { id: 'e3', source: `product-${productId}`, target: 'spec-power', relationship: 'HAS_SPECIFICATION', label: 'Has Specification' },
    { id: 'e4', source: `product-${productId}`, target: 'spec-voltage', relationship: 'HAS_SPECIFICATION', label: 'Has Specification' },
    { id: 'e5', source: `product-${productId}`, target: 'spec-ip', relationship: 'HAS_SPECIFICATION', label: 'Has Specification' },
    { id: 'e6', source: `product-${productId}`, target: 'app-pumps', relationship: 'USED_IN', label: 'Used In Application' },
    { id: 'e7', source: `product-${productId}`, target: 'app-fans', relationship: 'USED_IN', label: 'Used In Application' },
    { id: 'e8', source: `product-${productId}`, target: 'cert-ce', relationship: 'CERTIFIED_BY', label: 'Certified By' },
    { id: 'e9', source: `product-${productId}`, target: 'cert-ul', relationship: 'CERTIFIED_BY', label: 'Certified By' },
    { id: 'e10', source: `product-${productId}`, target: 'comp-modbus', relationship: 'COMPATIBLE_WITH', label: 'Compatible With' },
    { id: 'e11', source: `product-${productId}`, target: 'comp-filter', relationship: 'COMPATIBLE_WITH', label: 'Compatible With' },
  ];

  // Node position layout calculation (Orbital / Radial around central product)
  const centerNode = nodes.find(n => n.type === 'product') || nodes[0];
  const outerNodes = nodes.filter(n => n.id !== centerNode.id);

  const filterTypeMap: Record<string, string[]> = {
    all: ['product', 'manufacturer', 'category', 'specification', 'application', 'certification', 'compatible_product'],
    specs: ['product', 'specification'],
    apps: ['product', 'application'],
    certs: ['product', 'certification'],
    relations: ['product', 'manufacturer', 'category', 'compatible_product']
  };

  const activeTypes = filterTypeMap[selectedFilter] || filterTypeMap.all;
  const filteredNodes = nodes.filter(n => activeTypes.includes(n.type));

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'product': return 'bg-red-600 border-red-500 text-white shadow-red-500/20';
      case 'manufacturer': return 'bg-amber-500/20 border-amber-500/50 text-amber-300';
      case 'category': return 'bg-purple-500/20 border-purple-500/50 text-purple-300';
      case 'specification': return 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300';
      case 'application': return 'bg-red-950/60 border-red-800/60 text-red-300';
      case 'certification': return 'bg-teal-500/20 border-teal-500/50 text-teal-300';
      case 'compatible_product': return 'bg-rose-500/20 border-rose-500/50 text-rose-300';
      default: return 'bg-slate-800 border-slate-700 text-slate-300';
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'product': return <Share2 className="w-4 h-4 text-red-200" />;
      case 'manufacturer': return <Building2 className="w-4 h-4 text-amber-400" />;
      case 'category': return <Tag className="w-4 h-4 text-purple-400" />;
      case 'specification': return <SlidersHorizontal className="w-4 h-4 text-emerald-400" />;
      case 'application': return <Briefcase className="w-4 h-4 text-red-400" />;
      case 'certification': return <ShieldCheck className="w-4 h-4 text-teal-400" />;
      case 'compatible_product': return <Layers className="w-4 h-4 text-rose-400" />;
      default: return <Info className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-industrial-900 border border-industrial-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Header Toolbar */}
      <div className="p-4 bg-industrial-950 border-b border-industrial-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-red-400 animate-pulse" />
            <h3 className="text-sm font-semibold text-slate-100 font-mono tracking-wide">
              ProductIQ Knowledge Graph
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-950 text-red-400 border border-red-800">
              Neo4j Structured Topology
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Interactive semantic entity graph & cross-product compatibility relations.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          {[
            { id: 'all', label: 'All Entities' },
            { id: 'specs', label: 'Specs' },
            { id: 'apps', label: 'Applications' },
            { id: 'certs', label: 'Certifications' },
            { id: 'relations', label: 'Relationships' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFilter(f.id)}
              className={`px-2.5 py-1 rounded text-xs transition-all font-medium ${
                selectedFilter === f.id
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1">
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-slate-300 px-2 min-w-[40px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setZoomLevel(1); setSelectedNode(null); }}
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded"
            title="Reset View"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas View & Sidebar */}
      <div className="relative min-h-[460px] bg-slate-950 flex flex-col md:flex-row">
        {/* Visual Graph Canvas */}
        <div className="flex-1 relative overflow-hidden p-6 flex items-center justify-center min-h-[420px]">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Scale Container */}
          <div 
            className="relative w-full max-w-2xl h-[380px] flex items-center justify-center transition-transform duration-300"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            {/* Center Product Node */}
            <div
              onClick={() => setSelectedNode(centerNode)}
              className={`absolute z-20 cursor-pointer p-4 rounded-xl border-2 shadow-xl flex items-center gap-3 transition-all duration-300 hover:scale-105 ${getNodeColor('product')}`}
              style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            >
              <div className="p-2 bg-red-950/60 rounded-lg border border-red-500/40">
                {getNodeIcon('product')}
              </div>
              <div>
                <p className="text-xs font-mono font-bold text-red-100 max-w-[180px] truncate">
                  {centerNode.label}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-mono text-red-300 bg-red-950/80 px-1.5 py-0.5 rounded">
                    Root Product Node
                  </span>
                </div>
              </div>
            </div>

            {/* Orbiting Radial Nodes */}
            {filteredNodes.filter(n => n.id !== centerNode.id).map((node, index, arr) => {
              const angle = (index / arr.length) * 2 * Math.PI - Math.PI / 2;
              const radiusX = 240;
              const radiusY = 150;
              const x = Math.cos(angle) * radiusX;
              const y = Math.sin(angle) * radiusY;

              const isSelected = selectedNode?.id === node.id;

              return (
                <React.Fragment key={node.id}>
                  {/* Connector Line SVG */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <line
                      x1="50%"
                      y1="50%"
                      x2={`calc(50% + ${x}px)`}
                      y2={`calc(50% + ${y}px)`}
                      stroke={isSelected ? '#ef4444' : '#334155'}
                      strokeWidth={isSelected ? '2' : '1'}
                      strokeDasharray={node.type === 'compatible_product' ? '4 3' : 'none'}
                    />
                  </svg>

                  {/* Satellite Node */}
                  <div
                    onClick={() => setSelectedNode(node)}
                    className={`absolute z-10 cursor-pointer p-2.5 rounded-lg border shadow-md flex items-center gap-2 transition-all duration-200 hover:scale-110 hover:z-30 ${getNodeColor(node.type)} ${
                      isSelected ? 'ring-2 ring-red-400 shadow-red-500/30' : ''
                    }`}
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <div className="p-1 rounded bg-black/40">
                      {getNodeIcon(node.type)}
                    </div>
                    <span className="text-[11px] font-medium max-w-[130px] truncate">
                      {node.label}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Right Details Drawer */}
        <div className="w-full md:w-80 bg-industrial-900 border-t md:border-t-0 md:border-l border-industrial-800 p-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-200 font-mono tracking-wider uppercase border-b border-slate-800 pb-2 mb-3 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-red-400" />
              Entity Intelligence Panel
            </h4>

            {selectedNode ? (
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 mb-1">
                    {getNodeIcon(selectedNode.type)}
                    <span className="text-[10px] font-mono uppercase font-bold text-red-400">
                      {selectedNode.type.replace('_', ' ')}
                    </span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-100">
                    {selectedNode.label}
                  </h5>
                  <p className="text-[11px] font-mono text-slate-500 mt-1">
                    ID: {selectedNode.id}
                  </p>
                </div>

                {/* Details Breakdown */}
                {selectedNode.details && (
                  <div className="space-y-2 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 text-xs">
                    <p className="text-[11px] font-semibold text-slate-400 font-mono">NODE PROPERTIES</p>
                    {Object.entries(selectedNode.details).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-xs py-0.5 border-b border-slate-800/40 last:border-0">
                        <span className="text-slate-400 capitalize">{k.replace('_', ' ')}:</span>
                        <span className="text-slate-200 font-mono font-medium">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Graph Relationships for node */}
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-slate-400 font-mono">CONNECTED EDGES</p>
                  {edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).map(e => (
                    <div key={e.id} className="p-2 rounded bg-slate-950 border border-slate-800 text-[11px] flex items-center justify-between">
                      <span className="text-red-400 font-mono font-semibold">{e.label}</span>
                      <span className="text-slate-400 font-mono text-[10px]">Active Edge</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 px-4 text-slate-500 space-y-2">
                <Share2 className="w-8 h-8 mx-auto text-slate-700 animate-pulse" />
                <p className="text-xs">Click on any graph node to inspect detailed parameters and relationship bindings.</p>
              </div>
            )}
          </div>

          {/* Footer Graph Metadata */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Total Nodes: <strong className="text-slate-200">{filteredNodes.length}</strong></span>
            <span>Total Edges: <strong className="text-slate-200">{edges.length}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
