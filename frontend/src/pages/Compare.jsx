import {
  BarChart2,
  BookOpen,
  CheckCircle2,
  Eye,
  FileText,
  FileUp,
  Hash,
  Layers,
  Loader2,
  Plus,
  Sparkles,
  Split,
  Trophy,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DocumentLibraryModal from "../components/DocumentLibraryModal.jsx";
import Heatmap from "../components/Heatmap.jsx";
import SimilarityBar from "../components/SimilarityBar.jsx";
import { analyzeMulti } from "../lib/api.js";
import { extractClientSideText } from "../lib/fileText.js";

function categoryBadgeClass(category) {
  switch (category) {
    case "Very Similar":
      return "bg-gold-400 text-bg font-semibold";
    case "Similar":
      return "bg-gold-500/25 text-gold-200 border border-gold-400/50";
    case "Moderately Similar":
      return "bg-amber-950/70 text-amber-200 border border-amber-800/60";
    case "Slightly Similar":
      return "bg-stone-800 text-stone-300 border border-stone-700";
    default:
      return "bg-stone-900 text-stone-400 border border-stone-800";
  }
}

export default function Compare() {
  const location = useLocation();
  const [docs, setDocs] = useState([
    { name: "Document 1", text: "" },
    { name: "Document 2", text: "" },
    { name: "Document 3", text: "" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [selectedPair, setSelectedPair] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [singlePickIndex, setSinglePickIndex] = useState(null);

  useEffect(() => {
    if (location.state?.prefillDocs && Array.isArray(location.state.prefillDocs)) {
      const incoming = location.state.prefillDocs.map((d, idx) => ({
        name: d.filename || d.name || `Document ${idx + 1}`,
        text: d.content || d.text || "",
      }));
      if (incoming.length >= 2) {
        setDocs(incoming);
      } else if (incoming.length === 1) {
        setDocs((prev) => [incoming[0], ...prev.slice(1)]);
      }
    }
  }, [location.state]);

  const updateDoc = (i, patch) => {
    setDocs((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));
  };

  const addDoc = () =>
    setDocs((prev) => [...prev, { name: `Document ${prev.length + 1}`, text: "" }]);
  const removeDoc = (i) => setDocs((prev) => prev.filter((_, idx) => idx !== i));

  const handleFile = async (i, file) => {
    if (!file) return;
    try {
      const text = await extractClientSideText(file);
      updateDoc(i, { text, name: file.name });
    } catch {
      setError(
        `Could not read ${file.name} in-browser — for PDF/DOCX, paste the text instead here, or use Analyze for two-document uploads.`
      );
    }
  };

  const handleSingleDocSelect = (doc) => {
    if (singlePickIndex !== null && doc) {
      updateDoc(singlePickIndex, { name: doc.filename, text: doc.content || "" });
      setSinglePickIndex(null);
    }
  };

  const handleMultiImport = (selectedDocs) => {
    if (!selectedDocs || selectedDocs.length === 0) return;
    const newItems = selectedDocs.map((d) => ({
      name: d.filename,
      text: d.content || "",
    }));

    // Replace empty placeholder docs or append
    const existingNonEmpty = docs.filter((d) => d.text.trim().length > 0);
    if (existingNonEmpty.length === 0) {
      setDocs(newItems);
    } else {
      setDocs([...existingNonEmpty, ...newItems]);
    }
  };

  const canCompare = docs.filter((d) => d.text.trim()).length >= 2;

  const handleCompare = async () => {
    setError("");
    setLoading(true);
    setResult(null);
    try {
      const valid = docs.filter((d) => d.text.trim());
      const data = await analyzeMulti(valid);
      setResult(data);
      if (data.pairs && data.pairs.length > 0) {
        setSelectedPair({ i: data.pairs[0].index_a, j: data.pairs[0].index_b });
      } else if (data.names && data.names.length >= 2) {
        setSelectedPair({ i: 0, j: 1 });
      }
    } catch (e) {
      setError(e?.response?.data?.detail || "Something went wrong comparing these documents.");
    } finally {
      setLoading(false);
    }
  };

  // Find active pair detail matching selectedPair
  const activePair =
    result?.pairs?.find(
      (p) =>
        (p.index_a === selectedPair?.i && p.index_b === selectedPair?.j) ||
        (p.index_a === selectedPair?.j && p.index_b === selectedPair?.i)
    ) ||
    result?.pairs?.[0] ||
    null;

  return (
    <div className="animate-fade-in pt-6 pb-12">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-semibold text-cream mb-1.5">
            Compare Multiple Documents
          </h1>
          <p className="text-[14px] text-muted">
            Add 2 or more documents from your library or paste text to generate a full pairwise similarity matrix.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setImportModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-bg-card border border-bg-border hover:border-gold-500/40 text-cream text-[13px] font-medium transition-colors"
        >
          <BookOpen className="w-4 h-4 text-gold-300" />
          <span>Import from My Documents</span>
        </button>
      </div>

      <DocumentLibraryModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSelect={handleMultiImport}
        multiSelect={true}
        title="Import Documents to Compare"
      />

      <DocumentLibraryModal
        isOpen={singlePickIndex !== null}
        onClose={() => setSinglePickIndex(null)}
        onSelect={handleSingleDocSelect}
        multiSelect={false}
        title="Choose Document from Library"
      />

      {/* Input boxes grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        {docs.map((d, i) => (
          <div key={i} className="bg-bg-card border border-bg-border rounded-2xl p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <input
                value={d.name}
                onChange={(e) => updateDoc(i, { name: e.target.value })}
                className="bg-transparent text-[13px] font-semibold text-cream focus:outline-none border-b border-transparent focus:border-gold-500/50 w-2/3"
                placeholder={`Document ${i + 1}`}
              />
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSinglePickIndex(i)}
                  className="text-subtle hover:text-gold-300 p-1"
                  title="Choose from My Documents"
                >
                  <BookOpen className="w-4 h-4" />
                </button>
                <label className="text-subtle hover:text-gold-300 cursor-pointer p-1" title="Upload .txt">
                  <FileUp className="w-4 h-4" />
                  <input
                    type="file"
                    accept=".txt"
                    className="hidden"
                    onChange={(e) => handleFile(i, e.target.files?.[0])}
                  />
                </label>
                {docs.length > 2 && (
                  <button onClick={() => removeDoc(i)} className="text-subtle hover:text-red-400 p-1">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            <textarea
              value={d.text}
              onChange={(e) => updateDoc(i, { text: e.target.value })}
              placeholder="Paste document text or import from My Documents..."
              className="w-full min-h-[120px] bg-bg-panel border border-bg-border rounded-xl p-3 text-[13px] text-cream placeholder:text-subtle resize-none focus:outline-none focus:border-gold-500/50"
            />
            <div className="flex justify-between items-center mt-2 text-[11px] text-subtle">
              <span>{d.text.trim().length} chars</span>
              <span>{d.text.trim() ? d.text.trim().split(/\s+/).length : 0} words</span>
            </div>
          </div>
        ))}

        <div className="grid grid-cols-1 gap-3 min-h-[160px]">
          <button
            onClick={addDoc}
            className="border-2 border-dashed border-bg-border hover:border-gold-500/40 rounded-2xl flex flex-col items-center justify-center gap-2 text-muted hover:text-cream text-[13px] font-medium transition-colors p-4"
          >
            <div className="w-8 h-8 rounded-full bg-bg-hover flex items-center justify-center text-gold-300">
              <Plus className="w-4 h-4" />
            </div>
            <span>Add Another Document</span>
          </button>
        </div>
      </div>


      {error && (
        <div className="text-[13px] text-red-300 bg-red-950/40 border border-red-900/50 rounded-xl px-4 py-3 mb-5">
          {error}
        </div>
      )}

      <div className="flex justify-center mb-8">
        <button
          onClick={handleCompare}
          disabled={!canCompare || loading}
          className="inline-flex items-center gap-2 bg-gold-200 hover:bg-gold-100 disabled:opacity-40 disabled:cursor-not-allowed text-bg font-semibold px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-gold-500/10"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {loading ? "Analyzing Corpus..." : "Compare Documents"}
        </button>
      </div>

      {/* Results Dashboard */}
      {result && (
        <div className="animate-fade-in flex flex-col gap-6">
          {/* Top KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Most Similar Pair */}
            <div className="bg-bg-card border border-bg-border rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-subtle uppercase tracking-wider font-semibold">
                  Most Similar Pair
                </span>
                <div className="w-7 h-7 rounded-lg bg-gold-400/15 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-gold-300" />
                </div>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-cream truncate mb-1" title={`${result.most_similar?.a} ↔ ${result.most_similar?.b}`}>
                  {result.most_similar?.a} <span className="text-gold-400">&harr;</span> {result.most_similar?.b}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[26px] font-semibold text-gold-300 leading-tight">
                    {((result.most_similar?.score || 0) * 100).toFixed(1)}%
                  </span>
                  {result.most_similar?.category && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-md ${categoryBadgeClass(result.most_similar.category)}`}>
                      {result.most_similar.category}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Average Similarity */}
            <div className="bg-bg-card border border-bg-border rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-subtle uppercase tracking-wider font-semibold">
                  Corpus Average
                </span>
                <div className="w-7 h-7 rounded-lg bg-gold-400/15 flex items-center justify-center">
                  <BarChart2 className="w-4 h-4 text-gold-300" />
                </div>
              </div>
              <div>
                <p className="text-[12px] text-muted mb-1">Mean Pairwise Affinity</p>
                <div className="font-display text-[26px] font-semibold text-cream leading-tight">
                  {((result.average_similarity || 0) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Most Divergent Pair */}
            <div className="bg-bg-card border border-bg-border rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-subtle uppercase tracking-wider font-semibold">
                  Most Distinct Pair
                </span>
                <div className="w-7 h-7 rounded-lg bg-gold-400/15 flex items-center justify-center">
                  <Split className="w-4 h-4 text-gold-300" />
                </div>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-cream truncate mb-1" title={`${result.least_similar?.a} ↔ ${result.least_similar?.b}`}>
                  {result.least_similar?.a || "N/A"} <span className="text-gold-400">&harr;</span> {result.least_similar?.b || ""}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[26px] font-semibold text-cream/90 leading-tight">
                    {((result.least_similar?.score || 0) * 100).toFixed(1)}%
                  </span>
                  {result.least_similar?.category && (
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-800 text-stone-300">
                      {result.least_similar.category}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Corpus Scope */}
            <div className="bg-bg-card border border-bg-border rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-subtle uppercase tracking-wider font-semibold">
                  Comparison Scope
                </span>
                <div className="w-7 h-7 rounded-lg bg-gold-400/15 flex items-center justify-center">
                  <Layers className="w-4 h-4 text-gold-300" />
                </div>
              </div>
              <div>
                <p className="text-[12px] text-muted mb-1">Evaluated Pairs</p>
                <div className="font-display text-[26px] font-semibold text-cream leading-tight">
                  {result.pairs?.length || 0}{" "}
                  <span className="text-[14px] font-sans font-normal text-muted">
                    ({result.names?.length} docs)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid: Interactive Matrix (Left) + Pair Deep-Dive Inspector (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Heatmap Matrix */}
            <div className="lg:col-span-6 bg-bg-card border border-bg-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-display text-[18px] font-semibold text-cream">
                    Similarity Matrix
                  </h3>
                  <p className="text-[12.5px] text-subtle">
                    Color intensity represents multi-metric similarity
                  </p>
                </div>
                <span className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-bg-hover text-gold-300 border border-bg-border">
                  Interactive
                </span>
              </div>

              <Heatmap
                names={result.names}
                matrix={result.matrix}
                selectedPair={selectedPair}
                onSelectPair={(i, j) => setSelectedPair({ i, j })}
              />
            </div>

            {/* Right: Pair Deep-Dive Inspector */}
            <div className="lg:col-span-6 bg-bg-card border border-bg-border rounded-2xl p-6 flex flex-col gap-5">
              <div className="flex items-center justify-between pb-4 border-b border-bg-border/70">
                <div>
                  <span className="text-[11px] text-subtle uppercase tracking-wider font-semibold">
                    Pair Deep-Dive Inspector
                  </span>
                  <h3 className="text-[17px] font-semibold text-cream mt-0.5">
                    {activePair ? (
                      <>
                        {activePair.a} <span className="text-gold-400">&harr;</span> {activePair.b}
                      </>
                    ) : (
                      "Select a pair to inspect"
                    )}
                  </h3>
                </div>
                {activePair && (
                  <span
                    className={`text-[12px] px-3 py-1 rounded-lg ${categoryBadgeClass(
                      activePair.category
                    )}`}
                  >
                    {activePair.category}
                  </span>
                )}
              </div>

              {activePair ? (
                <>
                  {/* Headline score gauge */}
                  <div className="bg-bg-panel border border-bg-border rounded-xl p-5 flex items-center justify-between">
                    <div>
                      <div className="text-[12px] text-subtle mb-1">
                        Composite Similarity Score
                      </div>
                      <div className="font-display text-[38px] font-bold text-gold-300 leading-none">
                        {(activePair.overall_score * 100).toFixed(1)}%
                      </div>
                      <p className="text-[11.5px] text-muted mt-1.5">
                        Weighted semantic meaning (SentenceTransformer) + lexical TF-IDF/Jaccard
                      </p>
                    </div>
                  </div>

                  {/* Method Breakdown Bars */}
                  <div className="flex flex-col gap-3.5">
                    <span className="text-[12px] font-semibold text-muted uppercase tracking-wider">
                      Metric Breakdown
                    </span>
                    <SimilarityBar
                      label="Semantic Similarity (Neural Meaning & Context)"
                      value={activePair.semantic_similarity}
                      unavailable={!activePair.semantic_available}
                    />
                    <SimilarityBar
                      label="Cosine Similarity (Lexical TF-IDF Vector)"
                      value={activePair.cosine_similarity}
                    />
                    <SimilarityBar
                      label="Jaccard Index (Set-Theoretic Word Overlap)"
                      value={activePair.jaccard_similarity}
                    />
                  </div>

                  {/* Common Keywords for this pair */}
                  {activePair.common_keywords && activePair.common_keywords.length > 0 && (
                    <div className="pt-3 border-t border-bg-border/60">
                      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-muted uppercase tracking-wider mb-2.5">
                        <Hash className="w-3.5 h-3.5 text-gold-400" />
                        <span>Shared Terms &amp; Vocabulary</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {activePair.common_keywords.map((word) => (
                          <span
                            key={word}
                            className="text-[11.5px] px-2.5 py-1 rounded-lg bg-bg-hover text-cream border border-bg-border font-medium"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Document Size Comparison */}
                  {activePair.stats_a && activePair.stats_b && (
                    <div className="pt-3 border-t border-bg-border/60 grid grid-cols-3 text-center text-[12px] py-1 bg-bg-panel/50 rounded-xl px-2">
                      <div className="text-left font-medium text-muted pl-2">Metric</div>
                      <div className="font-semibold text-cream truncate">{activePair.a}</div>
                      <div className="font-semibold text-cream truncate">{activePair.b}</div>
                      
                      <div className="text-left text-subtle py-1 pl-2">Words</div>
                      <div className="text-cream py-1">{activePair.stats_a.words}</div>
                      <div className="text-cream py-1">{activePair.stats_b.words}</div>

                      <div className="text-left text-subtle py-1 pl-2">Characters</div>
                      <div className="text-cream py-1">{activePair.stats_a.characters}</div>
                      <div className="text-cream py-1">{activePair.stats_b.characters}</div>

                      <div className="text-left text-subtle py-1 pl-2">Sentences</div>
                      <div className="text-cream py-1">{activePair.stats_a.sentences}</div>
                      <div className="text-cream py-1">{activePair.stats_b.sentences}</div>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12 text-center text-subtle text-[13px]">
                  Click any cell on the matrix to view the deep-dive analysis.
                </div>
              )}
            </div>
          </div>

          {/* Ranked Pairwise Breakdown Table */}
          {result.pairs && result.pairs.length > 0 && (
            <div className="bg-bg-card border border-bg-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-display text-[18px] font-semibold text-cream">
                    Pairwise Comparison Rankings
                  </h3>
                  <p className="text-[12.5px] text-subtle">
                    All document combinations ordered by composite similarity
                  </p>
                </div>
                <span className="text-[12px] text-muted">
                  {result.pairs.length} {result.pairs.length === 1 ? "Pair" : "Pairs"} evaluated
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[13px]">
                  <thead>
                    <tr className="border-b border-bg-border text-[11px] uppercase tracking-wider text-subtle">
                      <th className="pb-3 pl-3 font-semibold w-12">#</th>
                      <th className="pb-3 font-semibold">Document Pair</th>
                      <th className="pb-3 font-semibold w-44">Similarity</th>
                      <th className="pb-3 font-semibold w-36">Category</th>
                      <th className="pb-3 font-semibold hidden md:table-cell">Semantic</th>
                      <th className="pb-3 font-semibold hidden md:table-cell">Cosine</th>
                      <th className="pb-3 font-semibold hidden lg:table-cell">Shared Terms</th>
                      <th className="pb-3 pr-3 font-semibold text-right w-24">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bg-border/60">
                    {result.pairs.map((pair, idx) => {
                      const isCurrent =
                        selectedPair &&
                        ((selectedPair.i === pair.index_a && selectedPair.j === pair.index_b) ||
                          (selectedPair.i === pair.index_b && selectedPair.j === pair.index_a));

                      return (
                        <tr
                          key={`${pair.index_a}-${pair.index_b}`}
                          className={`hover:bg-bg-hover/50 transition-colors ${
                            isCurrent ? "bg-gold-500/10" : ""
                          }`}
                        >
                          <td className="py-3.5 pl-3 font-medium text-subtle">
                            {idx === 0 ? (
                              <span className="w-5 h-5 rounded-full bg-gold-400 text-bg text-[10px] font-bold inline-flex items-center justify-center">
                                1
                              </span>
                            ) : (
                              idx + 1
                            )}
                          </td>
                          <td className="py-3.5 font-medium text-cream">
                            <span className="text-cream">{pair.a}</span>
                            <span className="text-gold-400 mx-2">&harr;</span>
                            <span className="text-cream">{pair.b}</span>
                          </td>
                          <td className="py-3.5">
                            <div className="flex items-center gap-2.5">
                              <span className="font-semibold text-gold-300 w-12">
                                {(pair.overall_score * 100).toFixed(1)}%
                              </span>
                              <div className="w-20 h-1.5 rounded-full bg-bg-hover overflow-hidden hidden sm:block">
                                <div
                                  className="h-full rounded-full bg-gold-400"
                                  style={{ width: `${pair.overall_score * 100}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5">
                            <span
                              className={`text-[11px] px-2.5 py-0.5 rounded-md inline-block ${categoryBadgeClass(
                                pair.category
                              )}`}
                            >
                              {pair.category}
                            </span>
                          </td>
                          <td className="py-3.5 text-muted hidden md:table-cell">
                            {(pair.semantic_similarity * 100).toFixed(1)}%
                          </td>
                          <td className="py-3.5 text-muted hidden md:table-cell">
                            {(pair.cosine_similarity * 100).toFixed(1)}%
                          </td>
                          <td className="py-3.5 text-subtle hidden lg:table-cell">
                            {pair.common_keywords?.length > 0 ? (
                              <span title={pair.common_keywords.join(", ")}>
                                {pair.common_keywords.slice(0, 3).join(", ")}
                                {pair.common_keywords.length > 3 && ` +${pair.common_keywords.length - 3}`}
                              </span>
                            ) : (
                              <span className="italic">None</span>
                            )}
                          </td>
                          <td className="py-3.5 pr-3 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedPair({ i: pair.index_a, j: pair.index_b })
                              }
                              className={`inline-flex items-center gap-1 text-[11.5px] font-medium px-2.5 py-1 rounded-lg transition-colors ${
                                isCurrent
                                  ? "bg-gold-400 text-bg"
                                  : "border border-bg-border text-cream hover:bg-bg-hover"
                              }`}
                            >
                              <Eye className="w-3.5 h-3.5" />
                              {isCurrent ? "Active" : "Inspect"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Corpus Keywords Card */}
          {result.corpus_keywords && result.corpus_keywords.length > 0 && (
            <div className="bg-bg-card border border-bg-border rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <Hash className="w-4 h-4 text-gold-400" />
                <h3 className="font-display text-[17px] font-semibold text-cream">
                  Key Corpus Concepts &amp; Vocabulary
                </h3>
              </div>
              <p className="text-[12.5px] text-subtle mb-4">
                High-frequency keywords across all documents in this comparison set:
              </p>
              <div className="flex flex-wrap gap-2">
                {result.corpus_keywords.map((term) => (
                  <span
                    key={term}
                    className="text-[12px] px-3 py-1.5 rounded-xl bg-bg-panel border border-bg-border text-cream font-medium"
                  >
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
