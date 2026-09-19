import { ChevronDown, LogOut, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../lib/AuthContext.jsx";

export default function TopBar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="flex items-center justify-end px-8 pt-6 pb-2 relative z-30">
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-bg-card border border-bg-border hover:border-gold-500/40 transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-300 to-gold-600 text-bg text-[12px] font-bold flex items-center justify-center shadow-sm">
            {initials}
          </div>
          <span className="text-[13px] font-medium text-cream hidden sm:inline-block max-w-[130px] truncate">
            {user?.full_name || user?.email || "User"}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-muted transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-56 bg-bg-card border border-bg-border rounded-2xl p-2 shadow-2xl animate-fade-in z-50">
            <div className="px-3 py-2.5 border-b border-bg-border/70 mb-1">
              <p className="text-[13px] font-semibold text-cream truncate">
                {user?.full_name || "User"}
              </p>
              <p className="text-[11.5px] text-subtle truncate">{user?.email}</p>
            </div>

            <button
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-300 hover:text-red-200 hover:bg-red-950/30 rounded-xl transition-colors text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

