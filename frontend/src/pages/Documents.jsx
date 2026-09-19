import {
  ArrowRight,
  CheckSquare,
  FileText,
  Layers,
  Sparkles,
  Square,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteDocument, listDocuments, uploadDocument } from "../lib/api.js";
import ConfirmModal from "../components/ConfirmModal.jsx";

export default function Documents() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Delete",
    variant: "danger",
    onConfirm: null,
    loading: false,
  });
  const inputRef = useRef(null);

  const closeConfirmModal = () =>
    setConfirmModal((prev) => ({ ...prev, isOpen: false, loading: false }));


  const refresh = () =>
    listDocuments()
      .then((data) => {
        setDocs(data);
        setSelectedIds(new Set());
      })
      .catch(() => {});

  useEffect(() => {
    refresh();
  }, []);

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      await uploadDocument(file);
      await refresh();
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (doc) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Document?",
      message: `Are you sure you want to delete "${doc.filename}" from your saved library?`,
      confirmLabel: "Delete Document",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await deleteDocument(doc.id);
          closeConfirmModal();
          refresh();
        } catch {
          closeConfirmModal();
        }
      },
    });
  };


  const toggleSelect = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === docs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(docs.map((d) => d.id)));
    }
  };

  const getSelectedDocs = () => docs.filter((d) => selectedIds.has(d.id));

  // Reuse in Analyze as Doc 1
  const handleAnalyzeAsDoc1 = (doc) => {
    navigate("/analyze", { state: { docA: doc } });
  };

  // Reuse in Analyze as Doc 2
  const handleAnalyzeAsDoc2 = (doc) => {
    navigate("/analyze", { state: { docB: doc } });
  };

  // Reuse pair in Analyze
  const handleAnalyzePair = () => {
    const selected = getSelectedDocs();
    if (selected.length < 2) return;
    navigate("/analyze", {
      state: {
        docA: selected[0],
        docB: selected[1],
      },
    });
  };

  // Reuse in Compare
  const handleCompareDoc = (doc) => {
    navigate("/compare", { state: { prefillDocs: [doc] } });
  };

  // Reuse multiple in Compare
  const handleCompareSelected = () => {
    const selected = getSelectedDocs();
    if (selected.length < 2) return;
    navigate("/compare", { state: { prefillDocs: selected } });
  };

  const selectedCount = selectedIds.size;
  const isAllSelected = docs.length > 0 && selectedIds.size === docs.length;

  return (
    <div className="animate-fade-in pt-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-[28px] font-semibold text-cream mb-1.5">My Documents</h1>
          <p className="text-[14px] text-muted">
            Your saved document library, ready to reuse anytime in Analyze or Compare.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 bg-gold-200 hover:bg-gold-100 text-bg font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" /> {uploading ? "Uploading..." : "Upload Document"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.pdf,.docx"
            className="hidden"
            onChange={(e) => handleUpload(e.target.files?.[0])}
          />
        </div>
      </div>

      {/* Floating / Contextual Multi-Select Action Bar */}
      {selectedCount > 0 && (
        <div className="mb-4 bg-[#1f1811] border border-gold-500/40 rounded-2xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 shadow-lg animate-fade-in">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-gold-400 text-bg text-[12px] font-bold flex items-center justify-center">
              {selectedCount}
            </span>
            <span className="text-[13.5px] font-medium text-cream">
              {selectedCount === 1 ? "1 document selected" : `${selectedCount} documents selected`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedCount === 1 && (
              <>
                <button
                  type="button"
                  onClick={() => handleAnalyzeAsDoc1(getSelectedDocs()[0])}
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-xl bg-bg-card border border-bg-border hover:border-gold-500/50 text-cream transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                  <span>Use as Doc 1 in Analyze</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAnalyzeAsDoc2(getSelectedDocs()[0])}
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-xl bg-bg-card border border-bg-border hover:border-gold-500/50 text-cream transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                  <span>Use as Doc 2 in Analyze</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCompareDoc(getSelectedDocs()[0])}
                  className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-xl bg-bg-card border border-bg-border hover:border-gold-500/50 text-cream transition-colors"
                >
                  <Layers className="w-3.5 h-3.5 text-gold-400" />
                  <span>Add to Compare</span>
                </button>
              </>
            )}

            {selectedCount === 2 && (
              <button
                type="button"
                onClick={handleAnalyzePair}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold px-4 py-1.5 rounded-xl bg-gold-200 hover:bg-gold-100 text-bg transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Analyze Both in Analyze</span>
              </button>
            )}

            {selectedCount >= 2 && (
              <button
                type="button"
                onClick={handleCompareSelected}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold px-4 py-1.5 rounded-xl bg-gold-200 hover:bg-gold-100 text-bg transition-colors shadow-md"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Compare Selected ({selectedCount}) in Multi-Doc</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="text-[12px] text-muted hover:text-cream px-2 py-1"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* Documents Table */}
      <div className="bg-bg-card border border-bg-border rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 text-[11px] uppercase tracking-wide text-subtle border-b border-bg-border items-center">
          <button
            type="button"
            onClick={toggleSelectAll}
            className="text-subtle hover:text-cream transition-colors p-1"
            title={isAllSelected ? "Deselect All" : "Select All"}
          >
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4 text-gold-400" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </button>
          <span>Filename</span>
          <span>Type</span>
          <span>Uploaded</span>
          <span>Words</span>
          <span>Analyses</span>
          <span className="text-right">Actions</span>
        </div>

        {docs.length === 0 && (
          <p className="text-[13px] text-muted py-12 text-center">
            No documents saved yet. Upload one, or documents you analyze will automatically appear here.
          </p>
        )}

        {docs.map((d) => {
          const isSelected = selectedIds.has(d.id);
          return (
            <div
              key={d.id}
              className={`grid grid-cols-[auto_2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3.5 items-center border-b border-bg-border last:border-none hover:bg-bg-hover/40 transition-colors ${
                isSelected ? "bg-gold-500/10" : ""
              }`}
            >
              <button
                type="button"
                onClick={() => toggleSelect(d.id)}
                className="text-subtle hover:text-cream transition-colors p-1"
              >
                {isSelected ? (
                  <CheckSquare className="w-4 h-4 text-gold-400" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </button>

              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-bg-hover flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-gold-300" />
                </div>
                <div className="min-w-0">
                  <span className="text-[13.5px] font-medium text-cream truncate block">
                    {d.filename}
                  </span>
                  <span className="text-[11px] text-subtle md:hidden">{d.file_type}</span>
                </div>
              </div>

              <span className="text-[13px] text-muted">{d.file_type}</span>
              <span className="text-[13px] text-muted">
                {new Date(d.created_at).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="text-[13px] text-muted">{d.word_count}</span>
              <span className="text-[13px] text-muted">{d.analyses_count}</span>

              {/* Quick Actions */}
              <div className="flex items-center gap-1.5 justify-self-end">
                <button
                  type="button"
                  onClick={() => handleAnalyzeAsDoc1(d)}
                  className="text-[11.5px] font-medium px-2.5 py-1 rounded-lg border border-bg-border hover:border-gold-500/50 text-cream hover:bg-bg-hover flex items-center gap-1 transition-colors"
                  title="Use in Analyze as Document 1"
                >
                  <Sparkles className="w-3 h-3 text-gold-400" />
                  <span>Analyze</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCompareDoc(d)}
                  className="text-[11.5px] font-medium px-2.5 py-1 rounded-lg border border-bg-border hover:border-gold-500/50 text-cream hover:bg-bg-hover flex items-center gap-1 transition-colors"
                  title="Add to Compare"
                >
                  <Layers className="w-3 h-3 text-gold-400" />
                  <span>Compare</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(d)}
                  className="text-subtle hover:text-red-400 transition-colors p-1.5 ml-1"
                  title="Delete document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal {...confirmModal} onCancel={closeConfirmModal} />
    </div>
  );
}

