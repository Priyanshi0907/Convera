import { Download, FileDown, Hash, Tag } from "lucide-react";
import SimilarityBar from "./SimilarityBar.jsx";
import { exportCsvUrl, exportPdfUrl } from "../lib/api.js";

function StatRow({ label, a, b }) {
  return (
    <div className="grid grid-cols-3 items-center py-2 border-b border-bg-border last:border-none">
      <span className="text-[13px] text-muted">{label}</span>
      <span className="text-[13.5px] text-cream text-center font-medium">{a}</span>
      <span className="text-[13.5px] text-cream text-center font-medium">{b}</span>
    </div>
  );
}

function KeywordPills({ words, empty }) {
  if (!words || words.length === 0) {
    return <p className="text-[12.5px] text-subtle italic">{empty}</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {words.map((w) => (
        <span key={w} className="text-[12px] px-2.5 py-1 rounded-lg bg-bg-hover text-cream border border-bg-border">
          {w}
        </span>
      ))}
    </div>
  );
}

function HighlightedText({ tokens }) {
  return (
    <p className="text-[13px] leading-relaxed text-muted max-h-40 overflow-y-auto pr-1">
      {tokens.map((t, i) =>
        t.shared ? (
          <span key={i} className="text-bg bg-gold-300 rounded px-0.5 font-medium">
            {t.text}
          </span>
        ) : (
          <span key={i}>{t.text}</span>
        )
      )}
    </p>
  );
}

export default function ResultsPanel({ result }) {
  if (!result) return null;
  const pct = Math.round(result.overall_score * 1000) / 10;

  return (
    <div className="animate-fade-in flex flex-col gap-6 mt-8">
      {/* Headline score */}
      <div className="bg-bg-card border border-bg-border rounded-2xl p-8 text-center relative overflow-hidden">
        <p className="text-[12px] tracking-[0.2em] text-subtle uppercase mb-2">Similarity Result</p>
        <div className="font-display text-[56px] leading-none font-semibold text-gold-300 mb-2">
          {pct.toFixed(1)}%
        </div>
        <div className="text-[15px] font-semibold tracking-wide text-cream mb-6">{result.category}</div>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          <a
            href={result.id ? exportCsvUrl(result.id) : undefined}
            className={`inline-flex items-center gap-2 text-[13px] font-medium px-4 py-2 rounded-lg border border-bg-border text-cream hover:bg-bg-hover transition-colors ${
              !result.id && "pointer-events-none opacity-40"
            }`}
          >
            <FileDown className="w-4 h-4" /> Export CSV
          </a>
          <a
            href={result.id ? exportPdfUrl(result.id) : undefined}
            className={`inline-flex items-center gap-2 text-[13px] font-medium px-4 py-2 rounded-lg bg-gold-400 text-bg hover:bg-gold-300 transition-colors ${
              !result.id && "pointer-events-none opacity-40"
            }`}
          >
            <Download className="w-4 h-4" /> Export PDF Report
          </a>
        </div>
      </div>

      {/* Comparison dashboard grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-card border border-bg-border rounded-2xl p-6">
          <h3 className="font-display text-[17px] font-semibold text-cream mb-5">Similarity Breakdown</h3>
          <div className="flex flex-col gap-5">
            <SimilarityBar label="Cosine Similarity (TF-IDF)" value={result.cosine_similarity} />
            <SimilarityBar label="Jaccard Similarity" value={result.jaccard_similarity} />
            <SimilarityBar
              label="Semantic Similarity"
              value={result.semantic_similarity}
              unavailable={!result.semantic_available}
            />
          </div>
        </div>

        <div className="bg-bg-card border border-bg-border rounded-2xl p-6">
          <h3 className="font-display text-[17px] font-semibold text-cream mb-5">Comparison Dashboard</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-bg-panel border border-bg-border rounded-xl p-4">
              <div className="text-[11px] text-subtle uppercase tracking-wide mb-1">Cosine</div>
              <div className="text-[20px] font-semibold text-gold-300">
                {(result.cosine_similarity * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-bg-panel border border-bg-border rounded-xl p-4">
              <div className="text-[11px] text-subtle uppercase tracking-wide mb-1">Jaccard</div>
              <div className="text-[20px] font-semibold text-gold-300">
                {(result.jaccard_similarity * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-bg-panel border border-bg-border rounded-xl p-4">
              <div className="text-[11px] text-subtle uppercase tracking-wide mb-1">Semantic</div>
              <div className="text-[20px] font-semibold text-gold-300">
                {result.semantic_available ? `${(result.semantic_similarity * 100).toFixed(1)}%` : "N/A"}
              </div>
            </div>
            <div className="bg-bg-panel border border-bg-border rounded-xl p-4">
              <div className="text-[11px] text-subtle uppercase tracking-wide mb-1">Common Keywords</div>
              <div className="text-[20px] font-semibold text-gold-300">{result.common_keywords.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Keywords */}
      <div className="bg-bg-card border border-bg-border rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Hash className="w-4 h-4 text-gold-400" />
          <h3 className="font-display text-[17px] font-semibold text-cream">Common &amp; Unique Keywords</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-[12px] font-semibold text-muted uppercase tracking-wide mb-3">
              {result.doc_a_name} Only
            </p>
            <KeywordPills words={result.unique_a} empty="No unique terms" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-gold-400 uppercase tracking-wide mb-3">Common</p>
            <KeywordPills words={result.common_keywords} empty="No shared terms" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-muted uppercase tracking-wide mb-3">
              {result.doc_b_name} Only
            </p>
            <KeywordPills words={result.unique_b} empty="No unique terms" />
          </div>
        </div>
      </div>

      {/* Word level highlight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-card border border-bg-border rounded-2xl p-6">
          <p className="text-[12px] font-semibold text-muted uppercase tracking-wide mb-3 truncate">
            {result.doc_a_name}
          </p>
          <HighlightedText tokens={result.highlighted_a} />
        </div>
        <div className="bg-bg-card border border-bg-border rounded-2xl p-6">
          <p className="text-[12px] font-semibold text-muted uppercase tracking-wide mb-3 truncate">
            {result.doc_b_name}
          </p>
          <HighlightedText tokens={result.highlighted_b} />
        </div>
      </div>

      {/* Stats + Topic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-card border border-bg-border rounded-2xl p-6">
          <h3 className="font-display text-[17px] font-semibold text-cream mb-4">Document Statistics</h3>
          <div className="grid grid-cols-3 text-[11px] text-subtle uppercase tracking-wide pb-2 border-b border-bg-border mb-1">
            <span></span>
            <span className="text-center truncate">A</span>
            <span className="text-center truncate">B</span>
          </div>
          <StatRow label="Words" a={result.stats_a.words} b={result.stats_b.words} />
          <StatRow label="Characters" a={result.stats_a.characters.toLocaleString()} b={result.stats_b.characters.toLocaleString()} />
          <StatRow label="Sentences" a={result.stats_a.sentences} b={result.stats_b.sentences} />
          <StatRow label="Unique Words" a={result.stats_a.unique_words} b={result.stats_b.unique_words} />
        </div>

        <div className="bg-bg-card border border-bg-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-gold-400" />
            <h3 className="font-display text-[17px] font-semibold text-cream">Topic Analysis</h3>
          </div>
          <div className="flex flex-col gap-3 text-[13.5px]">
            <div className="flex items-center justify-between">
              <span className="text-muted">{result.doc_a_name} primary topic</span>
              <span className="font-semibold text-cream">{result.topic_a}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted">{result.doc_b_name} primary topic</span>
              <span className="font-semibold text-cream">{result.topic_b}</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-bg-border">
              <span className="text-muted">Topic Overlap</span>
              <span className="font-semibold text-gold-300">{(result.topic_overlap * 100).toFixed(1)}%</span>
            </div>
          </div>
          <p className="text-[11.5px] text-subtle mt-4 leading-relaxed">
            Note: this score reflects word-vector / term overlap between the two documents — it is not an
            "accuracy" metric.
          </p>
        </div>
      </div>
    </div>
  );
}
