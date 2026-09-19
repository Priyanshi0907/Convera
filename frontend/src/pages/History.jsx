import {
  ChevronDown,
  Download as DownloadIcon,
  Eye,
  FileDown,
  FileText,
  Hash,
  Layers,
  Search,
  SquareStack,
  Trash2,
  Trophy,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Heatmap from "../components/Heatmap.jsx";
import SimilarityBadge from "../components/SimilarityBadge.jsx";
import {
  clearComparisonHistory,
  clearHistory,
  deleteAnalysis,
  deleteComparison,
  exportCsvUrl,
  exportPdfUrl,
  getComparison,
  getComparisonHistory,
  getHistory,
} from "../lib/api.js";
import ConfirmModal from "../components/ConfirmModal.jsx";

export default function History() {
  const [analyses, setAnalyses] = useState([]);
  const [comparisons, setComparisons] = useState([]);
  const [tab, setTab] = useState("all"); // all | analyses | comparisons
  const [query, setQuery] = useState("");
  const [openAnalysisId, setOpenAnalysisId] = useState(null);
  const [openComparisonId, setOpenComparisonId] = useState(null);
  const [params] = useSearchParams();

  const refresh = async () => {
    try {
      const [aData, cData] = await Promise.all([getHistory(), getComparisonHistory()]);
      setAnalyses(aData || []);
      setComparisons(cData || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const openParam = params.get("open");
    if (openParam) setOpenAnalysisId(Number(openParam));
  }, [params]);

  const filteredAnalyses = useMemo(() => {
    if (!query.trim()) return analyses;
    const q = query.toLowerCase();
    return analyses.filter(
      (r) =>
        r.doc_a_name.toLowerCase().includes(q) ||
        r.doc_b_name.toLowerCase().includes(q) ||
        (r.category && r.category.toLowerCase().includes(q))
    );
  }, [analyses, query]);

  const filteredComparisons = useMemo(() => {
    if (!query.trim()) return comparisons;
    const q = query.toLowerCase();
    return comparisons.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.document_names.some((d) => d.toLowerCase().includes(q)) ||
        (c.most_similar_a && c.most_similar_a.toLowerCase().includes(q)) ||
        (c.most_similar_b && c.most_similar_b.toLowerCase().includes(q))
    );
  }, [comparisons, query]);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Delete",
    variant: "danger",
    onConfirm: null,
    loading: false,
  });

  const closeConfirmModal = () =>
    setConfirmModal((prev) => ({ ...prev, isOpen: false, loading: false }));

  const handleDeleteAnalysis = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Analysis Record?",
      message: "Are you sure you want to delete this pairwise analysis record?",
      confirmLabel: "Delete Record",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await deleteAnalysis(id);
          if (openAnalysisId === id) setOpenAnalysisId(null);
          closeConfirmModal();
          refresh();
        } catch {
          closeConfirmModal();
        }
      },
    });
  };

  const handleDeleteComparison = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Comparison Record?",
      message: "Are you sure you want to delete this multi-document comparison record?",
      confirmLabel: "Delete Record",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await deleteComparison(id);
          if (openComparisonId === id) setOpenComparisonId(null);
          closeConfirmModal();
          refresh();
        } catch {
          closeConfirmModal();
        }
      },
    });
  };

  const handleClearAll = () => {
    setConfirmModal({
      isOpen: true,
      title: "Clear All History?",
      message: "Are you sure you want to delete all single analyses and multi-document comparisons?",
      confirmLabel: "Clear Everything",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await Promise.all([clearHistory(), clearComparisonHistory()]);
          closeConfirmModal();
          refresh();
        } catch {
          closeConfirmModal();
        }
      },
    });
  };


  const showAnalyses = tab === "all" || tab === "analyses";
  const showComparisons = tab === "all" || tab === "comparisons";

  return (
    <div className="animate-fade-in pt-6 pb-12">
      <div className="flex items-center justify-between mb-7 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-[28px] font-semibold text-cream mb-1.5">
            Analysis &amp; Compare History
          </h1>
          <p className="text-[14px] text-muted">
            Every document analysis and multi-document comparison you've run, saved for later reference.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search documents..."
              className="bg-bg-card border border-bg-border rounded-xl pl-9 pr-4 py-2.5 text-[13px] text-cream placeholder:text-subtle focus:outline-none focus:border-gold-500/50 w-56"
            />
          </div>
          <button
            onClick={handleClearAll}
            className="text-[13px] text-red-300 hover:text-red-200 font-medium px-3 py-2.5 hover:bg-red-950/20 rounded-xl transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={() => setTab("all")}
          className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-colors ${
            tab === "all"
              ? "bg-gold-400 text-bg font-semibold shadow-sm"
              : "bg-bg-card border border-bg-border text-muted hover:text-cream"
          }`}
        >
          All Records ({analyses.length + comparisons.length})
        </button>
        <button
          onClick={() => setTab("analyses")}
          className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-colors flex items-center gap-2 ${
            tab === "analyses"
              ? "bg-gold-400 text-bg font-semibold shadow-sm"
              : "bg-bg-card border border-bg-border text-muted hover:text-cream"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Single Analyses ({analyses.length})</span>
        </button>
        <button
          onClick={() => setTab("comparisons")}
          className={`px-4 py-2 rounded-xl text-[13px] font-medium transition-colors flex items-center gap-2 ${
            tab === "comparisons"
              ? "bg-gold-400 text-bg font-semibold shadow-sm"
              : "bg-bg-card border border-bg-border text-muted hover:text-cream"
          }`}
        >
          <SquareStack className="w-3.5 h-3.5" />
          <span>Multi-Doc Compare ({comparisons.length})</span>
        </button>
      </div>

      {/* MULTI-DOC COMPARISONS SECTION */}
      {showComparisons && filteredComparisons.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <SquareStack className="w-4 h-4 text-gold-400" />
            <h2 className="font-display text-[18px] font-semibold text-cream">
              Multi-Document Comparisons
            </h2>
          </div>

          <div className="bg-bg-card border border-bg-border rounded-2xl overflow-hidden divide-y divide-bg-border/60">
            {filteredComparisons.map((c) => {
              const isOpen = openComparisonId === c.id;
              return (
                <div key={`comp-${c.id}`} className="transition-colors">
                  <div
                    onClick={() => setOpenComparisonId(isOpen ? null : c.id)}
                    className="flex items-center justify-between p-5 hover:bg-bg-hover/40 cursor-pointer select-none"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gold-400/15 flex items-center justify-center shrink-0 mt-0.5">
                        <SquareStack className="w-5 h-5 text-gold-300" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[14.5px] font-semibold text-cream">{c.title}</span>
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-gold-500/20 text-gold-300 border border-gold-400/30">
                            {c.document_names.length} Documents
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[12px] text-muted flex-wrap">
                          {c.most_similar_a && (
                            <span className="flex items-center gap-1 text-cream/90">
                              <Trophy className="w-3.5 h-3.5 text-gold-400" />
                              Top: {c.most_similar_a} &harr; {c.most_similar_b} (
                              {(c.most_similar_score * 100).toFixed(1)}%)
                            </span>
                          )}
                          <span>&bull;</span>
                          <span>Avg Similarity: {(c.average_similarity * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-[12px] text-subtle hidden sm:inline-block">
                        {new Date(c.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteComparison(c.id);
                        }}
                        className="text-subtle hover:text-red-400 p-1 transition-colors"
                        title="Delete Comparison"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronDown
                        className={`w-4 h-4 text-subtle transition-transform ${
                          isOpen ? "rotate-180 text-gold-300" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expanded Compare Details */}
                  {isOpen && (
                    <div className="p-6 bg-bg-panel/40 border-t border-bg-border/60 animate-fade-in flex flex-col gap-6">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Matrix Preview */}
                        {c.matrix && c.matrix.length > 0 && (
                          <div className="lg:col-span-6 bg-bg-card border border-bg-border rounded-xl p-5">
                            <p className="text-[12px] font-semibold uppercase tracking-wider text-muted mb-4">
                              Similarity Matrix
                            </p>
                            <Heatmap names={c.document_names} matrix={c.matrix} />
                          </div>
                        )}

                        {/* Top Pairs List */}
                        <div className="lg:col-span-6 bg-bg-card border border-bg-border rounded-xl p-5 flex flex-col justify-between">
                          <div>
                            <p className="text-[12px] font-semibold uppercase tracking-wider text-muted mb-3">
                              Pairwise Rankings
                            </p>
                            <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                              {c.pairs?.map((p, pIdx) => (
                                <div
                                  key={pIdx}
                                  className="flex items-center justify-between p-2.5 rounded-lg bg-bg-panel border border-bg-border text-[12.5px]"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="w-5 h-5 rounded-full bg-bg-hover text-subtle text-[10px] font-bold flex items-center justify-center">
                                      {pIdx + 1}
                                    </span>
                                    <span className="font-medium text-cream truncate">
                                      {p.a} &harr; {p.b}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 shrink-0">
                                    <span className="font-semibold text-gold-300">
                                      {(p.overall_score * 100).toFixed(1)}%
                                    </span>
                                    {p.category && (
                                      <span className="text-[10px] px-2 py-0.5 rounded bg-gold-400/20 text-gold-300">
                                        {p.category}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-4 border-t border-bg-border/60 mt-4 flex justify-between items-center text-[12px] text-subtle">
                            <span>Evaluated on {new Date(c.created_at).toLocaleString()}</span>
                            <button
                              onClick={() => setOpenComparisonId(null)}
                              className="text-muted hover:text-cream flex items-center gap-1"
                            >
                              <X className="w-3.5 h-3.5" /> Close
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SINGLE ANALYSES TABLE */}
      {showAnalyses && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-gold-400" />
            <h2 className="font-display text-[18px] font-semibold text-cream">
              Pairwise Document Analyses
            </h2>
          </div>

          <div className="bg-bg-card border border-bg-border rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-6 py-3 text-[11px] uppercase tracking-wide text-subtle border-b border-bg-border">
              <span>Documents</span>
              <span>Similarity</span>
              <span>Date</span>
              <span>Export</span>
              <span />
            </div>

            {filteredAnalyses.length === 0 && (
              <p className="text-[13px] text-muted py-10 text-center">
                No single analyses match your criteria.
              </p>
            )}

            {filteredAnalyses.map((r) => {
              const isOpen = openAnalysisId === r.id;
              return (
                <div key={`analysis-${r.id}`}>
                  <button
                    onClick={() => setOpenAnalysisId(isOpen ? null : r.id)}
                    className="w-full grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 items-center px-6 py-4 border-b border-bg-border last:border-none hover:bg-bg-hover/40 transition-colors text-left"
                  >
                    <div className="min-w-0">
                      <div className="text-[13.5px] font-medium text-cream truncate">
                        {r.doc_a_name} <span className="text-gold-400">&harr;</span> {r.doc_b_name}
                      </div>
                      <div className="text-[12px] text-subtle">{r.category}</div>
                    </div>
                    <SimilarityBadge score={r.overall_score} size="sm" />
                    <span className="text-[13px] text-muted whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={exportCsvUrl(r.id)}
                        className="text-subtle hover:text-gold-300 p-1"
                        title="Export CSV"
                      >
                        <FileDown className="w-4 h-4" />
                      </a>
                      <a
                        href={exportPdfUrl(r.id)}
                        className="text-subtle hover:text-gold-300 p-1"
                        title="Export PDF"
                      >
                        <DownloadIcon className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDeleteAnalysis(r.id)}
                        className="text-subtle hover:text-red-400 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-subtle transition-transform ${
                        isOpen ? "rotate-180 text-gold-300" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 bg-bg-panel/40 animate-fade-in border-b border-bg-border/60">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                        <div className="bg-bg-panel border border-bg-border rounded-xl p-4">
                          <div className="text-[11px] text-subtle uppercase mb-1">Cosine (TF-IDF)</div>
                          <div className="text-[18px] font-semibold text-gold-300">
                            {(r.cosine_similarity * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div className="bg-bg-panel border border-bg-border rounded-xl p-4">
                          <div className="text-[11px] text-subtle uppercase mb-1">Jaccard</div>
                          <div className="text-[18px] font-semibold text-gold-300">
                            {(r.jaccard_similarity * 100).toFixed(1)}%
                          </div>
                        </div>
                        <div className="bg-bg-panel border border-bg-border rounded-xl p-4">
                          <div className="text-[11px] text-subtle uppercase mb-1">Semantic</div>
                          <div className="text-[18px] font-semibold text-gold-300">
                            {(r.semantic_similarity * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <p className="text-[11px] text-subtle uppercase mb-2">Common Keywords</p>
                          <div className="flex flex-wrap gap-2">
                            {r.common_keywords && r.common_keywords.length > 0 ? (
                              r.common_keywords.map((w) => (
                                <span
                                  key={w}
                                  className="text-[12px] px-2 py-1 rounded-lg bg-bg-hover text-cream border border-bg-border"
                                >
                                  {w}
                                </span>
                              ))
                            ) : (
                              <span className="text-[12px] text-subtle italic">None</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-[11px] text-subtle uppercase mb-2">Topics</p>
                          <p className="text-[13px] text-muted">
                            {r.topic_a} &nbsp;&harr;&nbsp; {r.topic_b} &nbsp;
                            <span className="text-gold-300">
                              ({(r.topic_overlap * 100).toFixed(0)}% overlap)
                            </span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setOpenAnalysisId(null)}
                        className="mt-4 text-[12px] text-subtle hover:text-cream flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Close
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal {...confirmModal} onCancel={closeConfirmModal} />
    </div>
  );
}

