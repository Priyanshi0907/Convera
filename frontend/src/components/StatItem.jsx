export default function StatItem({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-11 h-11 rounded-full bg-bg-hover flex items-center justify-center shrink-0">
        <Icon className="w-[18px] h-[18px] text-gold-300" strokeWidth={2} />
      </div>
      <div>
        <div className="text-[20px] font-semibold text-cream leading-none">{value}</div>
        <div className="text-[12px] text-muted mt-1">{label}</div>
      </div>
    </div>
  );
}
