import { Check, FileText, Loader2, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { listDocuments } from "../lib/api.js";

export default function DocumentLibraryModal({
  isOpen,
  onClose,
  onSelect,
  multiSelect = false,
  title = "Select from My Documents",
}) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      setLoading(true);
      listDocuments()
        .then((data) => setDocs(data || []))
        .catch(() => setDocs([]))
        .finally(() => setLoading(false));
      setSelectedIds(new Set());
      setSearch("");

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;


  const filtered = docs.filter((d) =>
    d.filename.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (d) => {
    if (!multiSelect) {
      onSelect(d);
      onClose();
      return;
    }
    const next = new Set(selectedIds);
    if (next.has(d.id)) next.delete(d.id);
    else next.add(d.id);
    setSelectedIds(next);
  };

  const handleConfirmMulti = () => {
    const selectedDocs = docs.filter((d) => selectedIds.has(d.id));
    onSelect(selectedDocs);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-xl bg-bg-card border border-bg-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bg-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gold-400/15 flex items-center justify-center">
              <FileText className="w-4 h-4 text-gold-300" />
            </div>
            <div>
              <h3 className="text-[16px] font-semibold text-cream">{title}</h3>
              <p className="text-[11.5px] text-subtle">
                {multiSelect
                  ? "Select one or more documents to add"
                  : "Pick a saved document from your library"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-subtle hover:text-cream p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-6 py-3 border-b border-bg-border/60 bg-bg-panel/50">
          <div className="relative">
            <Search className="w-4 h-4 text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents by name..."
              className="w-full bg-bg-card border border-bg-border rounded-xl pl-9 pr-4 py-2 text-[13px] text-cream placeholder:text-subtle focus:outline-none focus:border-gold-500/50"
            />
          </div>
        </div>

        {/* Document List */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 min-h-[220px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-gold-400" />
              <span className="text-[13px]">Loading your document library...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-subtle text-[13px]">
              {docs.length === 0 ? (
                <div>
                  <p className="text-cream mb-1">No saved documents found in your library.</p>
                  <p className="text-[12px]">Upload documents in the "Documents" tab first.</p>
                </div>
              ) : (
                "No documents match your search query."
              )}
            </div>
          ) : (
            filtered.map((d) => {
              const isChecked = selectedIds.has(d.id);
              return (
                <div
                  key={d.id}
                  onClick={() => toggleSelect(d)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isChecked
                      ? "bg-gold-500/10 border-gold-400/60 shadow-sm"
                      : "bg-bg-panel border-bg-border hover:border-gold-500/30 hover:bg-bg-hover"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {multiSelect && (
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                          isChecked
                            ? "bg-gold-400 border-gold-400 text-bg"
                            : "border-[#4a3a2a] bg-bg-card"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    )}
                    <div className="w-8 h-8 rounded-lg bg-bg-card border border-bg-border flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-gold-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13.5px] font-medium text-cream truncate">{d.filename}</p>
                      <div className="flex items-center gap-2 text-[11px] text-subtle">
                        <span className="uppercase">{d.file_type}</span>
                        <span>&bull;</span>
                        <span>{d.word_count || 0} words</span>
                        <span>&bull;</span>
                        <span>{new Date(d.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {!multiSelect && (
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg bg-gold-400 text-bg text-[12px] font-semibold hover:bg-gold-300 shrink-0 ml-3"
                    >
                      Use
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {multiSelect && (
          <div className="px-6 py-4 border-t border-bg-border flex items-center justify-between bg-bg-panel/40">
            <span className="text-[12.5px] text-muted">
              {selectedIds.size} {selectedIds.size === 1 ? "document" : "documents"} selected
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-[13px] text-muted hover:text-cream font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={selectedIds.size === 0}
                onClick={handleConfirmMulti}
                className="px-5 py-2 rounded-xl bg-gold-400 text-bg text-[13px] font-semibold hover:bg-gold-300 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add Selected Documents
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

