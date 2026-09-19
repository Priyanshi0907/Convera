import { ArrowRight } from "lucide-react";

export default function FeatureCard({ icon: Icon, title, description, tags }) {
  return (
    <div className="bg-bg-card border border-bg-border rounded-2xl p-5 flex flex-col gap-4 hover:border-gold-500/40 transition-colors">
      <div className="w-11 h-11 rounded-full bg-bg-hover flex items-center justify-center">
        <Icon className="w-5 h-5 text-gold-300" strokeWidth={2} />
      </div>
      <div>
        <h3 className="text-[15px] font-semibold text-cream mb-1.5">{title}</h3>
        <p className="text-[13px] leading-relaxed text-muted">{description}</p>
      </div>
      <div className="flex items-center justify-between mt-auto pt-1">
        <span className="text-[12px] text-subtle">
          {tags.map((t, i) => (
            <span key={t}>
              {t}
              {i < tags.length - 1 && <span className="mx-1.5 text-subtle">&middot;</span>}
            </span>
          ))}
        </span>
        <ArrowRight className="w-4 h-4 text-gold-400 shrink-0" />
      </div>
    </div>
  );
}
