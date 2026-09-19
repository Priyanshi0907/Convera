export default function SimilarityBar({ label, value, unavailable }) {
  const pct = Math.round(value * 1000) / 10;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[13px] font-medium text-cream">{label}</span>
        <span className="text-[13px] font-semibold text-gold-300">
          {unavailable ? "N/A" : `${pct.toFixed(1)}%`}
        </span>
      </div>
      <div className="h-2 rounded-full bg-bg-hover overflow-hidden">
        <div
          className="bar-fill h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-300"
          style={{ width: unavailable ? "0%" : `${pct}%` }}
        />
      </div>
      {unavailable && (
        <p className="text-[11px] text-subtle mt-1">
          Semantic model not downloaded yet (needs one-time internet access on first run).
        </p>
      )}
    </div>
  );
}
