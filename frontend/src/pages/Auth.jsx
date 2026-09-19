import {
  ArrowRight,
  Eye,
  EyeOff,
  FileText,
  GitFork,
  BarChart2,
  Lock,
  Mail,
  User,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext.jsx";

export function ConveraLogo({ size = "md", centered = false }) {
  return (
    <div className={`flex flex-col ${centered ? "items-center text-center" : "items-start"}`}>
      <div className="flex items-center gap-2.5">
        {/* Interlocking Double Rings SVG */}
        <svg
          width={size === "sm" ? "32" : "38"}
          height={size === "sm" ? "20" : "24"}
          viewBox="0 0 54 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse
            cx="19"
            cy="16"
            rx="15"
            ry="11"
            stroke="#d4a574"
            strokeWidth="2.2"
            strokeOpacity="0.9"
          />
          <ellipse
            cx="35"
            cy="16"
            rx="15"
            ry="11"
            stroke="#d4a574"
            strokeWidth="2.2"
            strokeOpacity="0.9"
          />
        </svg>
        <span className="font-serif tracking-[0.24em] text-[16px] text-cream font-semibold uppercase">
          CONVERA
        </span>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <span className="text-[9px] tracking-[0.26em] text-gold-400/85 uppercase font-medium">
          DOCUMENT SIMILARITY ANALYZER
        </span>
      </div>
    </div>
  );
}

export default function Auth() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lock body overflow so auth page NEVER has scrollbars
  useState(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        await register(email, password, fullName);
      } else {
        await login(email, password);
      }
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.detail || "Authentication failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail("demo@convera.ai");
    setPassword("password123");
    setIsSignUp(false);
  };

  return (
    <div className="fixed inset-0 h-[100dvh] w-full max-h-[100dvh] overflow-hidden bg-[#0d0a07] text-[#efe2c9] flex flex-col md:flex-row relative font-sans selection:bg-gold-500/30 selection:text-cream">
      {/* Warm Ambient Glow Effects */}
      <div
        className="pointer-events-none absolute -bottom-24 left-1/4 w-[700px] h-[500px] rounded-full blur-[140px] opacity-25"
        style={{ background: "radial-gradient(circle, #c9925a 0%, rgba(201,146,90,0) 70%)" }}
      />
      <div
        className="pointer-events-none absolute top-10 left-10 w-[450px] h-[350px] rounded-full blur-[160px] opacity-15"
        style={{ background: "radial-gradient(circle, #8a5a2b 0%, rgba(138,90,43,0) 70%)" }}
      />

      {/* LEFT COLUMN: Brand Hero & Illustration */}
      <div className="hidden md:flex md:w-1/2 px-6 lg:px-12 py-5 lg:py-7 flex-col justify-between h-full overflow-hidden relative z-10">
        {/* Brand Logo */}
        <div>
          <ConveraLogo />

          {/* Headline */}
          <div className="mt-6 lg:mt-8">
            <h1 className="font-serif text-[38px] sm:text-[44px] lg:text-[50px] leading-[1.06] tracking-tight font-normal">
              <span className="text-cream block">Compare.</span>
              <span className="text-cream block">Understand.</span>
              <span className="text-gold-300 block">Discover.</span>
            </h1>
            <p className="text-[13.5px] text-muted max-w-md leading-relaxed mt-3">
              Analyze how closely two or more documents relate in words and meaning using advanced
              similarity techniques.
            </p>
          </div>

          {/* 3 Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 max-w-lg">
            {/* Feature 1 */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-gold-300">
                <FileText className="w-3.5 h-3.5" />
                <span className="text-[12.5px] font-semibold text-cream">Multiple File Formats</span>
              </div>
              <p className="text-[11px] text-subtle">TXT, PDF, DOCX</p>
            </div>

            {/* Feature 2 */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-gold-300">
                <GitFork className="w-3.5 h-3.5 rotate-90" />
                <span className="text-[12.5px] font-semibold text-cream">Advanced Similarity</span>
              </div>
              <p className="text-[11px] text-subtle">Cosine · Jaccard · Semantic</p>
            </div>

            {/* Feature 3 */}
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-1.5 text-gold-300">
                <BarChart2 className="w-3.5 h-3.5" />
                <span className="text-[12.5px] font-semibold text-cream">Detailed Insights</span>
              </div>
              <p className="text-[11px] text-subtle">Keywords · Stats · Visuals</p>
            </div>
          </div>
        </div>

        {/* 3D Floating Documents Artwork with Golden Orbit */}
        <div className="my-2 relative h-[190px] lg:h-[220px] max-w-lg w-full flex items-center justify-center">

          {/* Subtle Underglow */}
          <div className="absolute inset-0 bg-gradient-to-t from-gold-500/10 via-transparent to-transparent blur-xl rounded-full" />

          <svg
            viewBox="0 0 460 280"
            className="w-full h-full drop-shadow-2xl overflow-visible"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="docGradBack" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#2e241a" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#17120c" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="docGradFront" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#453322" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#1f1811" stopOpacity="0.95" />
              </linearGradient>
              <linearGradient id="orbitGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#e8cd9a" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#c9925a" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#e8cd9a" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Orbiting Elliptical Ring */}
            <ellipse
              cx="230"
              cy="145"
              rx="195"
              ry="105"
              stroke="url(#orbitGrad)"
              strokeWidth="1.4"
              transform="rotate(-16 230 145)"
            />

            {/* Orbit beads */}
            <circle cx="58" cy="180" r="4.5" fill="#d4a574" />
            <circle cx="410" cy="100" r="4.5" fill="#d4a574" />
            <circle cx="280" cy="245" r="3.5" fill="#d4a574" />

            {/* Back Document Card */}
            <g transform="translate(130, 40) rotate(-10)">
              <rect
                x="0"
                y="0"
                width="140"
                height="190"
                rx="14"
                fill="url(#docGradBack)"
                stroke="#54412c"
                strokeWidth="1.2"
              />
              {[36, 56, 76, 96, 116, 136].map((y, idx) => (
                <rect
                  key={idx}
                  x="20"
                  y={y}
                  width={idx % 2 === 0 ? 100 : 70}
                  height="5.5"
                  rx="2.75"
                  fill="#785d3c"
                  opacity="0.45"
                />
              ))}
            </g>

            {/* Front Document Card (lit with warm gold borders) */}
            <g transform="translate(180, 70) rotate(8)">
              <rect
                x="0"
                y="0"
                width="148"
                height="198"
                rx="14"
                fill="url(#docGradFront)"
                stroke="#d4a574"
                strokeWidth="1.5"
                strokeOpacity="0.75"
              />
              {[36, 56, 76, 96, 116, 136, 156].map((y, idx) => (
                <rect
                  key={idx}
                  x="22"
                  y={y}
                  width={idx % 3 === 0 ? 104 : idx % 2 === 0 ? 84 : 96}
                  height="6"
                  rx="3"
                  fill="#d4a574"
                  opacity={0.65}
                />
              ))}
            </g>
          </svg>
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-[#261d15]/80 max-w-sm">
          <p className="text-[12.5px] text-subtle">
            Smarter document analysis for deeper insights.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: Authentication Card */}
      <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 flex items-center justify-center h-full overflow-hidden relative z-10">
        <div className="w-full max-w-[420px] bg-[#17120e]/95 border border-[#2e2318] rounded-[24px] p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          {/* Card Header Logo */}
          <div className="mb-4 flex justify-center">
            <ConveraLogo size="sm" centered={true} />
          </div>

          {/* Title & Subtitle */}
          <div className="mb-5 text-center">
            <h2 className="font-serif text-[24px] font-normal text-cream">
              {isSignUp ? "Create an Account" : "Welcome Back"}
            </h2>
            <p className="text-[13px] text-muted mt-0.5">
              {isSignUp
                ? "Register to start comparing documents."
                : "Sign in to continue to your account."}
            </p>
          </div>

          {error && (
            <div className="text-[12.5px] text-red-300 bg-red-950/50 border border-red-900/60 rounded-xl px-3.5 py-2.5 mb-4">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {isSignUp && (
              <div className="relative">
                <User className="w-4 h-4 text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full bg-[#1c1611] border border-[#33261b] rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-cream placeholder:text-subtle focus:outline-none focus:border-gold-400 transition-colors"
                />
              </div>
            )}

            {/* Email Address */}
            <div className="relative">
              <Mail className="w-4 h-4 text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full bg-[#1c1611] border border-[#33261b] rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-cream placeholder:text-subtle focus:outline-none focus:border-gold-400 transition-colors"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="w-4 h-4 text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-[#1c1611] border border-[#33261b] rounded-xl pl-10 pr-10 py-2.5 text-[13px] text-cream placeholder:text-subtle focus:outline-none focus:border-gold-400 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-subtle hover:text-cream absolute right-3 top-1/2 -translate-y-1/2 p-1 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Remember Me & Forgot Password */}
            {!isSignUp && (
              <div className="flex items-center justify-between text-[12.5px] pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer text-muted select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded bg-[#1c1611] border-[#33261b] text-gold-400 focus:ring-0 focus:ring-offset-0 accent-gold-400"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="text-gold-400 hover:text-gold-300 text-[12px] font-medium"
                >
                  Quick Demo Login
                </button>
              </div>
            )}

            {/* Submit Golden Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full bg-gradient-to-r from-[#e8c79b] via-[#ddb684] to-[#ca9a6b] hover:brightness-105 active:scale-[0.99] text-[#15110d] font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_4px_24px_rgba(212,165,116,0.22)] transition-all disabled:opacity-50 text-[14px]"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? "Create Account" : "Sign In"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* OR Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t border-[#2e2318]" />
            <span className="px-3 text-[10px] font-semibold text-[#705e4f] tracking-wider uppercase">
              OR
            </span>
            <div className="flex-1 border-t border-[#2e2318]" />
          </div>

          {/* Secondary Switch Mode Button */}
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="w-full border border-[#382b1f] hover:border-gold-500/40 text-cream bg-transparent hover:bg-[#201812] py-2.5 px-4 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-gold-300" />
            <span>{isSignUp ? "Sign In to Existing Account" : "Create an account"}</span>
          </button>

          {/* Footer Toggle Text */}
          <div className="mt-4 text-center text-[12px] text-subtle">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError("");
                  }}
                  className="text-gold-300 hover:text-gold-200 font-medium ml-1"
                >
                  Sign In
                </button>
              </>
            ) : (
              <>
                Don't have an account yet?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setError("");
                  }}
                  className="text-gold-300 hover:text-gold-200 font-medium ml-1"
                >
                  Create one now
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
