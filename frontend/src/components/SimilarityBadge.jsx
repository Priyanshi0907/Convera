export default function SimilarityBadge({ score, size = "md" }) {
  // score is 0-1
  const pct = Math.round(score * 1000) / 10;
  const sizeClasses = size === "sm" ? "text-[12px] px-2.5 py-1" : "text-[13px] px-3 py-1.5";
  return (
    <span className={`inline-block rounded-lg bg-gold-400 text-bg font-semibold ${sizeClasses}`}>
      {pct.toFixed(1)}%
    </span>
  );
}

export function categoryFor(score) {
  const pct = score * 100;
  if (pct >= 80) return "Very Similar";
  if (pct >= 60) return "Similar";
  if (pct >= 40) return "Moderately Similar";
  if (pct >= 20) return "Slightly Similar";
  return "Very Different";
}
