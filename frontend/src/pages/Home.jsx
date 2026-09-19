import {
  BarChart3,
  Clock,
  FileStack,
  FileText,
  ChevronRight,
  Percent,
  Share2,
  SquareStack,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DocOrbitIllustration from "../components/DocOrbitIllustration.jsx";
import FeatureCard from "../components/FeatureCard.jsx";
import SimilarityBadge from "../components/SimilarityBadge.jsx";
import StatItem from "../components/StatItem.jsx";
import { getHistory, getQuickStats } from "../lib/api.js";

const features = [
  {
    icon: FileText,
    title: "Multiple File Formats",
    description: "Upload text files, PDFs, or Word documents with ease.",
    tags: ["TXT", "PDF", "DOCX"],
  },
  {
    icon: Share2,
    title: "Multiple Similarity Methods",
    description: "Use TF-IDF, Jaccard and semantic similarity for richer insights.",
    tags: ["Cosine", "Jaccard", "Semantic"],
  },
  {
    icon: BarChart3,
    title: "Detailed Analysis",
    description: "Get common/unique keywords, statistics, and visual comparisons.",
    tags: ["Keywords", "Stats", "Visuals"],
  },
  {
    icon: FileStack,
    title: "Compare More Documents",
    description: "Find the most similar pair and explore similarity matrices with heatmaps.",
    tags: ["Matrix", "Heatmap", "Top Pair"],
  },
  {
    icon: Clock,
    title: "Track Your Progress",
    description: "View your past analyses and save comparisons for future reference.",
    tags: ["History", "Save", "Export"],
  },
];

const QUOTES = [
  "Sometimes, the most similar things aren't the same.",
  "Every document has a fingerprint made of words.",
  "Meaning travels even when the words don't match.",
];

export default function Home() {
  const navigate = useNavigate();
  const [recent, setRecent] = useState([]);
  const [stats, setStats] = useState({ total_analyses: 0, total_documents: 0, avg_similarity: 0, days_active: 0 });
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

  useEffect(() => {
    getHistory()
      .then((rows) => setRecent(rows.slice(0, 4)))
      .catch(() => setRecent([]));
    getQuickStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8 pt-6 pb-10 items-center">
        <div>
          <div className="text-[12px] tracking-[0.2em] font-semibold text-gold-400 mb-4">WELCOME TO</div>
          <h1 className="font-display text-[46px] leading-[1.05] font-semibold text-cream mb-5">
            Document
            <br />
            <span className="text-gold-400">Similarity</span> Analyzer
          </h1>
          <p className="text-[15px] text-muted max-w-md leading-relaxed mb-7">
            Measure how closely two or more documents relate in words and meaning using advanced similarity
            techniques.
          </p>
          <button
            onClick={() => navigate("/analyze")}
            className="inline-flex items-center gap-2 bg-gold-200 hover:bg-gold-100 text-bg font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Analyze Documents
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="w-full max-w-[380px] h-[300px]">
            <DocOrbitIllustration />
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 hidden md:flex flex-col items-end gap-1">
            <span className="text-[11px] tracking-[0.25em] font-semibold text-gold-400">COMPARE</span>
            <span className="text-[11px] tracking-[0.25em] font-semibold text-gold-400">UNDERSTAND</span>
            <span className="text-[11px] tracking-[0.25em] font-semibold text-gold-400">DISCOVER</span>
            <span className="w-6 h-[2px] bg-gold-500 mt-1" />
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {features.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </div>

      {/* Bottom section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-6">
        {/* Recent Analyses */}
        <div className="bg-bg-card border border-bg-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-[20px] font-semibold text-cream">Recent Analyses</h2>
            <button
              onClick={() => navigate("/history")}
              className="text-[13px] text-gold-400 hover:text-gold-300 font-medium flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 text-[11px] tracking-wide text-subtle uppercase pb-3 border-b border-bg-border">
            <span>Documents</span>
            <span>Similarity</span>
            <span>Date</span>
            <span />
          </div>

          {recent.length === 0 && (
            <p className="text-[13px] text-muted py-8 text-center">
              No analyses yet — run your first comparison from the Analyze tab.
            </p>
          )}

          {recent.map((r) => (
            <button
              key={r.id}
              onClick={() => navigate(`/history?open=${r.id}`)}
              className="w-full grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center py-4 border-b border-bg-border last:border-none hover:bg-bg-hover/50 -mx-2 px-2 rounded-lg transition-colors text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-bg-hover flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-gold-300" />
                </div>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-medium text-cream truncate">
                    {r.doc_a_name} vs {r.doc_b_name}
                  </div>
                  <div className="text-[12px] text-subtle">2 documents &middot; {r.file_type}</div>
                </div>
              </div>
              <SimilarityBadge score={r.overall_score} size="sm" />
              <div className="text-[13px] text-muted whitespace-nowrap">
                {new Date(r.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </div>
              <ChevronRight className="w-4 h-4 text-subtle" />
            </button>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="flex flex-col gap-6">
          <div className="bg-bg-card border border-bg-border rounded-2xl p-6">
            <h2 className="font-display text-[18px] font-semibold text-cream mb-5">Quick Stats</h2>
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <StatItem icon={FileStack} value={stats.total_analyses} label="Total Analyses" />
              <StatItem icon={FileText} value={stats.total_documents} label="Documents Uploaded" />
              <StatItem icon={Percent} value={`${stats.avg_similarity}%`} label="Avg. Similarity Score" />
              <StatItem icon={Clock} value={stats.days_active} label="Days Active" />
            </div>
          </div>

          <div className="relative bg-bg-card border border-bg-border rounded-2xl p-6 overflow-hidden">
            <SquareStack className="absolute -right-4 -bottom-4 w-28 h-28 text-bg-hover" strokeWidth={0.6} />
            <span className="text-gold-400 text-[26px] font-display leading-none">&ldquo;</span>
            <p className="font-display italic text-[15px] text-cream leading-snug relative z-10">{quote}</p>
            <div className="w-8 h-[2px] bg-gold-500 mt-4 relative z-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
