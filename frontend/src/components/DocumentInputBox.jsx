import { BookOpen, FileUp, Pencil, X } from "lucide-react";
import { useRef, useState } from "react";
import DocumentLibraryModal from "./DocumentLibraryModal.jsx";

export default function DocumentInputBox({
  label,
  name,
  onNameChange,
  value,
  onChange,
  file,
  onFileChange,
}) {
  const inputRef = useRef(null);
  const [mode, setMode] = useState("paste"); // paste | file
  const [dragOver, setDragOver] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    onFileChange(f);
    setMode("file");
  };

  const handleLibrarySelect = (doc) => {
    if (!doc) return;
    onChange(doc.content || "");
    if (onNameChange) onNameChange(doc.filename);
    onFileChange(null);
    setMode("paste");
  };

  return (
    <div className="bg-bg-card border border-bg-border rounded-2xl p-5 flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 max-w-[220px] group">
          <input
            value={name !== undefined ? name : label}
            onChange={(e) => onNameChange && onNameChange(e.target.value)}
            className="bg-transparent text-[13px] font-semibold tracking-wide text-cream uppercase border-b border-transparent group-hover:border-bg-border focus:border-gold-500/70 focus:outline-none transition-colors w-full truncate py-0.5"
            title="Click to rename document"
            placeholder={label}
          />
          <Pencil className="w-3 h-3 text-subtle/50 group-hover:text-gold-400 shrink-0 pointer-events-none transition-colors" />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setLibraryOpen(true)}
            className="text-[11px] px-2.5 py-1 rounded-md font-medium text-gold-300 hover:bg-gold-500/15 border border-gold-500/30 flex items-center gap-1 transition-colors"
            title="Select a saved document from My Documents"
          >
            <BookOpen className="w-3 h-3" />
            <span>Library</span>
          </button>

          <div className="flex gap-1 bg-bg-hover rounded-lg p-1">
            <button
              onClick={() => setMode("paste")}
              className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${
                mode === "paste" ? "bg-gold-400 text-bg" : "text-muted"
              }`}
            >
              Paste
            </button>
            <button
              onClick={() => setMode("file")}
              className={`text-[11px] px-2.5 py-1 rounded-md font-medium transition-colors ${
                mode === "file" ? "bg-gold-400 text-bg" : "text-muted"
              }`}
            >
              Upload
            </button>
          </div>
        </div>
      </div>

      <DocumentLibraryModal
        isOpen={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onSelect={handleLibrarySelect}
        multiSelect={false}
        title={`Choose Document for ${name || label}`}
      />

      {mode === "paste" ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Paste text here or select from Library..."

          className="flex-1 min-h-[180px] w-full bg-bg-panel border border-bg-border rounded-xl p-4 text-[13.5px] text-cream placeholder:text-subtle resize-none focus:outline-none focus:border-gold-500/50"
        />
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className={`flex-1 min-h-[180px] w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
            dragOver ? "border-gold-400 bg-bg-hover" : "border-bg-border bg-bg-panel hover:border-gold-500/40"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.pdf,.docx"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {file ? (
            <div className="flex items-center gap-2 text-cream text-[13px] px-3">
              <FileUp className="w-4 h-4 text-gold-300" />
              <span className="truncate max-w-[180px]">{file.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFileChange(null);
                }}
                className="text-subtle hover:text-cream"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <>
              <FileUp className="w-6 h-6 text-gold-400" />
              <p className="text-[12.5px] text-muted">Drop a file or click to upload</p>
              <p className="text-[11px] text-subtle">TXT &middot; PDF &middot; DOCX</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
