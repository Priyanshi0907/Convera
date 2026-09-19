import {
  FileStack,
  History,
  LayoutGrid,
  Search,
  Settings,
  SquareStack,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home", icon: LayoutGrid, end: true },
  { to: "/analyze", label: "Analyze", icon: Search },
  { to: "/documents", label: "Documents", icon: FileStack },
  { to: "/history", label: "History", icon: History },
  { to: "/compare", label: "Compare", icon: SquareStack },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-[260px] shrink-0 h-screen sticky top-0 bg-bg border-r border-bg-border flex flex-col">
      <div className="px-6 pt-7 pb-6 border-b border-bg-border/60 mb-2">
        <div className="flex items-center gap-2.5">
          <svg
            width="34"
            height="22"
            viewBox="0 0 54 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <ellipse
              cx="19"
              cy="16"
              rx="15"
              ry="11"
              stroke="#d4a574"
              strokeWidth="2.4"
              strokeOpacity="0.9"
            />
            <ellipse
              cx="35"
              cy="16"
              rx="15"
              ry="11"
              stroke="#d4a574"
              strokeWidth="2.4"
              strokeOpacity="0.9"
            />
          </svg>
          <div className="leading-tight">
            <div className="font-serif text-[16px] font-semibold text-cream tracking-[0.2em] uppercase">
              CONVERA
            </div>
            <div className="text-[8.5px] font-medium tracking-[0.22em] text-gold-400 uppercase -mt-0.5">
              Similarity Analyzer
            </div>
          </div>
        </div>
      </div>


      <nav className="flex-1 px-4 flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                isActive
                  ? "bg-gold-400/90 text-bg shadow-glow"
                  : "text-muted hover:text-cream hover:bg-bg-hover"
              }`
            }
          >
            <Icon className="w-[18px] h-[18px]" strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 pb-7 pt-4">
        <div className="w-8 h-[2px] bg-gold-500 mb-3" />
        <p className="text-[13px] leading-snug text-muted">
          Better insights.
          <br />
          Through comparison.
        </p>
      </div>
    </aside>
  );
}
