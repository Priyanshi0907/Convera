import { AlertTriangle, Trash2, X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function ConfirmModal({
  isOpen,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger", // danger | warning | info
  onConfirm,
  onCancel,
  loading = false,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const isDanger = variant === "danger";

  // Use createPortal to mount on document.body so transformed parents
  // (like .animate-fade-in or max-w-3xl) don't trap fixed positioning
  return createPortal(
    <div
      className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onCancel}
      style={{ margin: 0 }}
    >
      <div
        className="w-full max-w-[420px] bg-[#18130e] border border-[#382b1f] rounded-2xl p-6 shadow-[0_25px_70px_rgba(0,0,0,0.9)] relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 text-subtle hover:text-cream transition-colors p-1 rounded-lg"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-start gap-4 mb-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              isDanger
                ? "bg-red-950/70 border border-red-800/60 text-red-300"
                : "bg-gold-500/15 border border-gold-500/30 text-gold-300"
            }`}
          >
            {isDanger ? (
              <Trash2 className="w-5 h-5 text-red-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-gold-400" />
            )}
          </div>
          <div className="pr-6">
            <h3 className="text-[17px] font-semibold text-cream leading-snug">{title}</h3>
            <p className="text-[13px] text-muted mt-1.5 leading-relaxed">{message}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-bg-border/60">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-bg-border text-cream hover:bg-bg-hover transition-colors text-[13px] font-medium"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl text-[13px] font-semibold transition-all shadow-md ${
              isDanger
                ? "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-red-950/50"
                : "bg-gold-200 hover:bg-gold-100 text-bg"
            } disabled:opacity-50`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
