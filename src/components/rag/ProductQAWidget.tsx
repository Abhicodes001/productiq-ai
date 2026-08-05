import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, AlertCircle, FileText, Globe, ExternalLink, HelpCircle, CheckCircle2 } from 'lucide-react';
import { askProductQuestion } from '../../services/api';
import { ProductQAResponse } from '../../types/rag';

interface ProductQAWidgetProps {
  productId: string;
  productName: string;
}

export const ProductQAWidget: React.FC<ProductQAWidgetProps> = ({
  productId,
  productName,
}) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ProductQAResponse | null>(null);

  const sampleQuestions = [
    "What is the operating temperature?",
    "Where is this product used?",
    "What material is it made from?",
    "What voltage range is supported?",
  ];

  const handleAsk = async (qText?: string) => {
    const targetQ = qText || question;
    if (!targetQ.trim()) return;

    setQuestion(targetQ);
    setLoading(true);

    try {
      const res = await askProductQuestion(productId, targetQ);
      setResponse(res);
    } catch (err) {
      console.error("Error asking product question:", err);
      setResponse({
        product_id: productId,
        question: targetQ,
        answer: "I couldn't find this information in the available product sources.",
        found_evidence: false,
        citations: []
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Ask About This Product</h3>
            <p className="text-xs text-slate-400">Strict Grounded RAG Q&A with Source Citations</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[11px] font-semibold flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Vector Grounded
        </span>
      </div>

      {/* Suggested Quick Questions */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" /> Sample Technical Questions
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(q)}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 text-xs font-medium border border-slate-700/50 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Question Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={`Ask about ${productName}...`}
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-cyan-600/20"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Ask RAG</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Answer & Citations Box */}
      {response && (
        <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4 animate-fade-in">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Q: {response.question}</span>
              <p className="text-sm text-slate-200 leading-relaxed font-medium mt-1">
                {response.answer}
              </p>
            </div>
          </div>

          {!response.found_evidence ? (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Strict RAG Rule Applied: Unavailable in index context. No hallucination allowed.</span>
            </div>
          ) : (
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Source Citations ({response.citations.length})
              </span>
              
              <div className="space-y-2">
                {response.citations.map((cite, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-900 border border-slate-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="font-semibold text-cyan-400 flex items-center gap-1">
                        {cite.source_type === 'pdf' ? <FileText className="w-3.5 h-3.5 text-rose-400" /> : <Globe className="w-3.5 h-3.5 text-sky-400" />}
                        {cite.source_name}
                      </span>
                      {cite.page_number && (
                        <span className="text-[11px] text-slate-400 font-mono">Page {cite.page_number}</span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-slate-400 italic">
                      "{cite.evidence_text}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
