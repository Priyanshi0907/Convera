import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DocumentInputBox from "../components/DocumentInputBox.jsx";
import ResultsPanel from "../components/ResultsPanel.jsx";
import { analyzeFiles, analyzeText } from "../lib/api.js";

export default function Analyze() {
  const location = useLocation();
  const [nameA, setNameA] = useState("Document 1");
  const [nameB, setNameB] = useState("Document 2");
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (location.state?.docA) {
      setNameA(location.state.docA.filename || "Document 1");
      setTextA(location.state.docA.content || "");
    }
    if (location.state?.docB) {
      setNameB(location.state.docB.filename || "Document 2");
      setTextB(location.state.docB.content || "");
    }
  }, [location.state]);


  const canAnalyze = (fileA || textA.trim()) && (fileB || textB.trim());

  const handleAnalyze = async () => {
    setError("");
    setLoading(true);
    setResult(null);
    try {
      let data;
      const finalNameA = nameA.trim() || (fileA ? fileA.name : "Document 1");
      const finalNameB = nameB.trim() || (fileB ? fileB.name : "Document 2");

      if (fileA && fileB) {
        data = await analyzeFiles(fileA, fileB, true, finalNameA, finalNameB);
      } else if (!fileA && !fileB) {
        data = await analyzeText({
          text_a: textA,
          text_b: textB,
          name_a: finalNameA,
          name_b: finalNameB,
          save: true,
        });
      } else {
        setError("Please use the same input mode (both paste, or both upload) for this version.");
        setLoading(false);
        return;
      }
      setResult(data);
    } catch (e) {
      setError(e?.response?.data?.detail || "Something went wrong analyzing these documents.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileAChange = (f) => {
    setFileA(f);
    if (f && (nameA === "Document 1" || !nameA.trim())) {
      setNameA(f.name);
    }
  };

  const handleFileBChange = (f) => {
    setFileB(f);
    if (f && (nameB === "Document 2" || !nameB.trim())) {
      setNameB(f.name);
    }
  };

  return (
    <div className="animate-fade-in pt-6">
      <div className="mb-7">
        <h1 className="font-display text-[28px] font-semibold text-cream mb-1.5">Analyze Documents</h1>
        <p className="text-[14px] text-muted">
          Paste text or upload files for both documents, rename them as desired, then run the similarity analysis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DocumentInputBox
          label="Document 1"
          name={nameA}
          onNameChange={setNameA}
          value={textA}
          onChange={setTextA}
          file={fileA}
          onFileChange={handleFileAChange}
        />
        <DocumentInputBox
          label="Document 2"
          name={nameB}
          onNameChange={setNameB}
          value={textB}
          onChange={setTextB}
          file={fileB}
          onFileChange={handleFileBChange}
        />
      </div>

      {error && (
        <div className="mt-4 text-[13px] text-red-300 bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="flex justify-center mt-7">
        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze || loading}
          className="inline-flex items-center gap-2 bg-gold-200 hover:bg-gold-100 disabled:opacity-40 disabled:cursor-not-allowed text-bg font-semibold px-8 py-3.5 rounded-xl transition-colors"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "Analyzing..." : "Analyze Similarity"}
        </button>
      </div>

      <ResultsPanel result={result} />
    </div>
  );
}
