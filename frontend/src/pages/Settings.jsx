import {
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  Sliders,
  Sparkles,
  Trash2,
  User,
  AlertTriangle,
  Camera,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../lib/AuthContext.jsx";
import {
  changePasswordApi,
  clearComparisonHistory,
  clearHistory,
  deleteAllDocuments,
  deleteAccountApi,
  updateProfileApi,
} from "../lib/api.js";
import ConfirmModal from "../components/ConfirmModal.jsx";


const METHODS = [
  {
    id: "combined",
    title: "Combined Analysis",
    subtitle: "Recommended · Weighted Multi-Model Ensemble (Semantic + Lexical)",
    badge: "Default",
  },
  {
    id: "semantic",
    title: "Semantic Similarity",
    subtitle: "Deep neural SentenceTransformer embeddings for conceptual meaning",
  },
  {
    id: "cosine",
    title: "Cosine Similarity",
    subtitle: "TF-IDF vector space frequency comparison",
  },
  {
    id: "jaccard",
    title: "Jaccard Similarity",
    subtitle: "Set-theoretic unique word overlap coefficient",
  },
];

export default function Settings() {
  const { user, updateUser, logout } = useAuth();

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || "Priyanshi Choudhary");
  const [email, setEmail] = useState(user?.email || "priyanshi@email.com");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  // Change Password Modal/State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Analysis Preferences
  const [defaultMethod, setDefaultMethod] = useState(
    () => localStorage.getItem("convera_default_method") || "combined"
  );

  // Notifications
  const [notifAnalysis, setNotifAnalysis] = useState(() => {
    const s = localStorage.getItem("convera_notif_analysis");
    return s !== null ? JSON.parse(s) : true;
  });
  const [notifReport, setNotifReport] = useState(() => {
    const s = localStorage.getItem("convera_notif_report");
    return s !== null ? JSON.parse(s) : true;
  });
  const [notifUpdates, setNotifUpdates] = useState(() => {
    const s = localStorage.getItem("convera_notif_updates");
    return s !== null ? JSON.parse(s) : false;
  });

  // Data & Privacy
  const [saveHistory, setSaveHistory] = useState(() => {
    const s = localStorage.getItem("convera_save_history");
    return s !== null ? JSON.parse(s) : true;
  });
  const [saveDocs, setSaveDocs] = useState(() => {
    const s = localStorage.getItem("convera_save_docs");
    return s !== null ? JSON.parse(s) : true;
  });
  const [autoDeleteTemp, setAutoDeleteTemp] = useState(() => {
    const s = localStorage.getItem("convera_auto_delete_temp");
    return s !== null ? JSON.parse(s) : true;
  });

  // Action status feedbacks
  const [statusFeedback, setStatusFeedback] = useState({ type: "", text: "" });

  // Custom Modal Pop-up state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    variant: "danger",
    onConfirm: null,
    loading: false,
  });

  const closeConfirmModal = () =>
    setConfirmModal((prev) => ({ ...prev, isOpen: false, loading: false }));

  const notifyFeedback = (type, text) => {
    setStatusFeedback({ type, text });
    setTimeout(() => setStatusFeedback({ type: "", text: "" }), 4000);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileMessage("");
    setProfileSaving(true);
    try {
      const updated = await updateProfileApi(fullName, email);
      updateUser(updated);
      setIsEditingProfile(false);
      setProfileMessage("Profile updated successfully.");
      setTimeout(() => setProfileMessage(""), 3000);
    } catch (err) {
      setProfileError(err?.response?.data?.detail || "Failed to update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordMessage("");
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 4) {
      setPasswordError("New password must be at least 4 characters long.");
      return;
    }
    setPasswordSaving(true);
    try {
      await changePasswordApi(currentPassword, newPassword);
      setPasswordMessage("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordMessage("");
      }, 2000);
    } catch (err) {
      setPasswordError(err?.response?.data?.detail || "Failed to change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleMethodSelect = (id) => {
    setDefaultMethod(id);
    localStorage.setItem("convera_default_method", id);
    notifyFeedback("success", `Default similarity method set to ${id.toUpperCase()}`);
  };

  const handleToggleNotif = (key, value, setter) => {
    setter(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  const handleTogglePrivacy = (key, value, setter) => {
    setter(value);
    localStorage.setItem(key, JSON.stringify(value));
  };


  const handleClearHistory = () => {
    setConfirmModal({
      isOpen: true,
      title: "Clear Analysis History?",
      message:
        "Are you sure you want to clear all single and multi-document comparison history? This action cannot be undone.",
      confirmLabel: "Clear History",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await clearHistory();
          await clearComparisonHistory();
          closeConfirmModal();
          notifyFeedback("success", "Analysis and comparison history cleared.");
        } catch {
          closeConfirmModal();
          notifyFeedback("error", "Failed to clear history.");
        }
      },
    });
  };

  const handleDeleteAllDocuments = () => {
    setConfirmModal({
      isOpen: true,
      title: "Delete All Documents?",
      message:
        "Are you sure you want to delete all saved documents from your library? This action cannot be undone.",
      confirmLabel: "Delete All Documents",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await deleteAllDocuments();
          closeConfirmModal();
          notifyFeedback("success", "All saved documents have been deleted.");
        } catch {
          closeConfirmModal();
          notifyFeedback("error", "Failed to delete documents.");
        }
      },
    });
  };

  const handleDeleteAccount = () => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Account Permanently?",
      message:
        "CAUTION: Are you sure you want to permanently delete your account? All your analyses, saved documents, and preferences will be permanently wiped.",
      confirmLabel: "Delete Account",
      variant: "danger",
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, loading: true }));
        try {
          await deleteAccountApi();
          closeConfirmModal();
          logout();
        } catch {
          closeConfirmModal();
          notifyFeedback("error", "Failed to delete account.");
        }
      },
    });
  };


  const initials = (user?.full_name || fullName || "User")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="animate-fade-in pt-6 pb-16 max-w-3xl">
      {/* Header */}
      <div className="mb-7">
        <h1 className="font-display text-[28px] font-semibold text-cream mb-1.5 flex items-center gap-2">
          <span>Settings</span>
        </h1>
        <p className="text-[14px] text-muted">
          Manage your account profile, analysis preferences, notification settings, and data privacy.
        </p>
      </div>

      {statusFeedback.text && (
        <div
          className={`mb-6 px-4 py-3 rounded-xl text-[13px] border flex items-center gap-2.5 transition-all ${
            statusFeedback.type === "success"
              ? "bg-gold-500/15 text-gold-200 border-gold-500/30"
              : "bg-red-950/40 text-red-200 border-red-900/50"
          }`}
        >
          {statusFeedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-gold-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{statusFeedback.text}</span>
        </div>
      )}

      <div className="flex flex-col gap-7">
        {/* ========================================================= */}
        {/* SECTION 1: PROFILE */}
        {/* ========================================================= */}
        <section className="bg-bg-card border border-bg-border rounded-2xl p-6 sm:p-7">
          <div className="flex items-center justify-between pb-4 border-b border-bg-border/70 mb-5">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gold-400" />
              <h2 className="text-[12px] font-semibold text-gold-400 tracking-[0.16em] uppercase">
                1. Profile
              </h2>
            </div>
            {!isEditingProfile && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(!isChangingPassword)}
                  className="text-[12.5px] px-3 py-1.5 rounded-lg border border-bg-border text-cream hover:bg-bg-hover transition-colors font-medium flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-gold-300" />
                  <span>Change Password</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(true)}
                  className="text-[12.5px] px-3 py-1.5 rounded-lg bg-gold-200 hover:bg-gold-100 text-bg font-semibold transition-colors"
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>

          {profileMessage && (
            <div className="mb-4 text-[12.5px] text-gold-200 bg-gold-500/15 border border-gold-500/30 rounded-xl px-3.5 py-2">
              {profileMessage}
            </div>
          )}

          {/* Profile Details Layout */}
          {!isEditingProfile ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              {/* Profile Picture Avatar */}
              <div className="relative group">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-300 via-gold-500 to-amber-700 text-bg text-[22px] font-bold flex items-center justify-center shadow-lg border border-gold-400/40">
                  {initials}
                </div>
                <div className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                  <Camera className="w-5 h-5 text-cream" />
                </div>
              </div>

              {/* Name & Email */}
              <div className="flex-1 min-w-0 space-y-3">
                <div>
                  <label className="text-[11px] text-subtle uppercase tracking-wider font-semibold block mb-0.5">
                    Full Name
                  </label>
                  <p className="text-[16px] font-medium text-cream truncate">
                    {user?.full_name || fullName}
                  </p>
                </div>
                <div>
                  <label className="text-[11px] text-subtle uppercase tracking-wider font-semibold block mb-0.5">
                    Email Address
                  </label>
                  <p className="text-[14px] text-muted truncate">{user?.email || email}</p>
                </div>
              </div>
            </div>
          ) : (
            /* Inline Profile Edit Form */
            <form onSubmit={handleSaveProfile} className="space-y-4">
              {profileError && (
                <div className="text-[12.5px] text-red-300 bg-red-950/40 border border-red-900/50 rounded-xl px-3.5 py-2">
                  {profileError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[12px] text-muted block mb-1.5 font-medium">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-bg-panel border border-bg-border rounded-xl pl-10 pr-3.5 py-2.5 text-[13.5px] text-cream focus:outline-none focus:border-gold-500/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[12px] text-muted block mb-1.5 font-medium">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-bg-panel border border-bg-border rounded-xl pl-10 pr-3.5 py-2.5 text-[13.5px] text-cream focus:outline-none focus:border-gold-500/60"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="text-[13px] px-4 py-2 rounded-xl border border-bg-border text-muted hover:text-cream transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="inline-flex items-center gap-2 bg-gold-200 hover:bg-gold-100 text-bg font-semibold text-[13px] px-5 py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  {profileSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* Change Password Collapsible Section */}
          {isChangingPassword && (
            <div className="mt-6 pt-5 border-t border-bg-border/60">
              <h3 className="text-[13.5px] font-semibold text-cream mb-1 flex items-center gap-2">
                <Lock className="w-4 h-4 text-gold-400" />
                <span>Change Password</span>
              </h3>
              <p className="text-[12px] text-subtle mb-4">
                Enter your current password followed by your desired new password.
              </p>

              {passwordError && (
                <div className="text-[12.5px] text-red-300 bg-red-950/40 border border-red-900/50 rounded-xl px-3.5 py-2 mb-3">
                  {passwordError}
                </div>
              )}
              {passwordMessage && (
                <div className="text-[12.5px] text-gold-200 bg-gold-500/15 border border-gold-500/30 rounded-xl px-3.5 py-2 mb-3">
                  {passwordMessage}
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3.5 max-w-md">
                <div>
                  <label className="text-[11.5px] text-muted block mb-1">Current Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-bg-panel border border-bg-border rounded-xl px-3.5 py-2 text-[13px] text-cream focus:outline-none focus:border-gold-500/60"
                  />
                </div>

                <div>
                  <label className="text-[11.5px] text-muted block mb-1">New Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-bg-panel border border-bg-border rounded-xl px-3.5 py-2 text-[13px] text-cream focus:outline-none focus:border-gold-500/60"
                  />
                </div>

                <div>
                  <label className="text-[11.5px] text-muted block mb-1">Confirm New Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-bg-panel border border-bg-border rounded-xl px-3.5 py-2 text-[13px] text-cream focus:outline-none focus:border-gold-500/60"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[12px] text-subtle hover:text-cream flex items-center gap-1.5"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? "Hide passwords" : "Show passwords"}</span>
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsChangingPassword(false)}
                      className="text-[12.5px] px-3 py-1.5 rounded-lg border border-bg-border text-muted hover:text-cream"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="text-[12.5px] px-4 py-1.5 rounded-lg bg-gold-200 hover:bg-gold-100 text-bg font-semibold disabled:opacity-50"
                    >
                      {passwordSaving ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: ANALYSIS PREFERENCES ⭐ */}
        {/* ========================================================= */}
        <section className="bg-bg-card border border-bg-border rounded-2xl p-6 sm:p-7">
          <div className="flex items-center justify-between pb-4 border-b border-bg-border/70 mb-5">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-gold-400" />
              <h2 className="text-[12px] font-semibold text-gold-400 tracking-[0.16em] uppercase">
                2. Analysis Preferences
              </h2>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-gold-500/15 text-gold-300 border border-gold-500/30">
              CONVERA Core
            </span>
          </div>

          <div>
            <p className="text-[14px] font-medium text-cream mb-1">Default Similarity Method</p>
            <p className="text-[12.5px] text-muted mb-4">
              Select which algorithm is featured as the headline comparison metric across analysis runs.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {METHODS.map((m) => {
                const isSelected = defaultMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleMethodSelect(m.id)}
                    className={`text-left p-4 rounded-xl border transition-all relative flex flex-col justify-between ${
                      isSelected
                        ? "bg-[#241c14] border-gold-400/80 shadow-[0_0_15px_rgba(212,165,116,0.15)]"
                        : "bg-bg-panel border-bg-border hover:border-gold-500/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-semibold text-cream">{m.title}</span>
                        {m.badge && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-gold-400 text-bg">
                            {m.badge}
                          </span>
                        )}
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected
                            ? "border-gold-400 bg-gold-400 text-bg"
                            : "border-bg-border bg-transparent"
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-[11.5px] text-subtle leading-relaxed">{m.subtitle}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: NOTIFICATIONS */}
        {/* ========================================================= */}
        <section className="bg-bg-card border border-bg-border rounded-2xl p-6 sm:p-7">
          <div className="flex items-center gap-2 pb-4 border-b border-bg-border/70 mb-5">
            <Bell className="w-4 h-4 text-gold-400" />
            <h2 className="text-[12px] font-semibold text-gold-400 tracking-[0.16em] uppercase">
              3. Notifications
            </h2>
          </div>

          <div className="divide-y divide-bg-border/60">
            {/* Analysis Completed */}
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium text-cream">Analysis completed</p>
                <p className="text-[12px] text-subtle">
                  Notify when a multi-document or large batch analysis has concluded
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggleNotif(
                    "convera_notif_analysis",
                    !notifAnalysis,
                    setNotifAnalysis
                  )
                }
                className={`w-14 h-7 rounded-full transition-colors relative flex items-center px-1 font-semibold text-[10px] ${
                  notifAnalysis ? "bg-gold-400 text-bg" : "bg-bg-panel border border-bg-border text-muted"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full transition-transform shadow-md flex items-center justify-center font-bold ${
                    notifAnalysis ? "translate-x-7 bg-bg text-gold-400" : "translate-x-0 bg-stone-400 text-bg"
                  }`}
                />
                <span
                  className={`absolute ${
                    notifAnalysis ? "left-2 text-bg font-bold" : "right-2 text-muted"
                  }`}
                >
                  {notifAnalysis ? "ON" : "OFF"}
                </span>
              </button>
            </div>

            {/* Report ready */}
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium text-cream">Report ready</p>
                <p className="text-[12px] text-subtle">
                  Alert when PDF / CSV export generation is ready for download
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggleNotif("convera_notif_report", !notifReport, setNotifReport)
                }
                className={`w-14 h-7 rounded-full transition-colors relative flex items-center px-1 font-semibold text-[10px] ${
                  notifReport ? "bg-gold-400 text-bg" : "bg-bg-panel border border-bg-border text-muted"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full transition-transform shadow-md flex items-center justify-center font-bold ${
                    notifReport ? "translate-x-7 bg-bg text-gold-400" : "translate-x-0 bg-stone-400 text-bg"
                  }`}
                />
                <span
                  className={`absolute ${
                    notifReport ? "left-2 text-bg font-bold" : "right-2 text-muted"
                  }`}
                >
                  {notifReport ? "ON" : "OFF"}
                </span>
              </button>
            </div>

            {/* Product updates */}
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium text-cream">Product updates</p>
                <p className="text-[12px] text-subtle">
                  Hear about new similarity algorithms, features, and model upgrades
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleToggleNotif(
                    "convera_notif_updates",
                    !notifUpdates,
                    setNotifUpdates
                  )
                }
                className={`w-14 h-7 rounded-full transition-colors relative flex items-center px-1 font-semibold text-[10px] ${
                  notifUpdates ? "bg-gold-400 text-bg" : "bg-bg-panel border border-bg-border text-muted"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full transition-transform shadow-md flex items-center justify-center font-bold ${
                    notifUpdates ? "translate-x-7 bg-bg text-gold-400" : "translate-x-0 bg-stone-400 text-bg"
                  }`}
                />
                <span
                  className={`absolute ${
                    notifUpdates ? "left-2 text-bg font-bold" : "right-2 text-muted"
                  }`}
                >
                  {notifUpdates ? "ON" : "OFF"}
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: DATA & PRIVACY ⭐ */}
        {/* ========================================================= */}
        <section className="bg-bg-card border border-bg-border rounded-2xl p-6 sm:p-7">
          <div className="flex items-center justify-between pb-4 border-b border-bg-border/70 mb-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-gold-400" />
              <h2 className="text-[12px] font-semibold text-gold-400 tracking-[0.16em] uppercase">
                4. Data &amp; Privacy
              </h2>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-800 text-stone-300">
              User Control
            </span>
          </div>

          {/* Privacy Toggles */}
          <div className="divide-y divide-bg-border/60 mb-6">
            {/* Save analysis history */}
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium text-cream">Save analysis history</p>
                <p className="text-[12px] text-subtle">
                  Store pairwise similarity records and matrices for historical review
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleTogglePrivacy(
                    "convera_save_history",
                    !saveHistory,
                    setSaveHistory
                  )
                }
                className={`w-14 h-7 rounded-full transition-colors relative flex items-center px-1 font-semibold text-[10px] ${
                  saveHistory ? "bg-gold-400 text-bg" : "bg-bg-panel border border-bg-border text-muted"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full transition-transform shadow-md flex items-center justify-center font-bold ${
                    saveHistory ? "translate-x-7 bg-bg text-gold-400" : "translate-x-0 bg-stone-400 text-bg"
                  }`}
                />
                <span
                  className={`absolute ${
                    saveHistory ? "left-2 text-bg font-bold" : "right-2 text-muted"
                  }`}
                >
                  {saveHistory ? "ON" : "OFF"}
                </span>
              </button>
            </div>

            {/* Save uploaded documents */}
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium text-cream">Save uploaded documents</p>
                <p className="text-[12px] text-subtle">
                  Retain files in My Documents library so they can be reused across comparisons
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleTogglePrivacy("convera_save_docs", !saveDocs, setSaveDocs)
                }
                className={`w-14 h-7 rounded-full transition-colors relative flex items-center px-1 font-semibold text-[10px] ${
                  saveDocs ? "bg-gold-400 text-bg" : "bg-bg-panel border border-bg-border text-muted"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full transition-transform shadow-md flex items-center justify-center font-bold ${
                    saveDocs ? "translate-x-7 bg-bg text-gold-400" : "translate-x-0 bg-stone-400 text-bg"
                  }`}
                />
                <span
                  className={`absolute ${
                    saveDocs ? "left-2 text-bg font-bold" : "right-2 text-muted"
                  }`}
                >
                  {saveDocs ? "ON" : "OFF"}
                </span>
              </button>
            </div>

            {/* Automatically delete temporary files */}
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium text-cream">
                  Automatically delete temporary files
                </p>
                <p className="text-[12px] text-subtle">
                  Purge in-memory scratch buffers immediately after similarity scores are returned
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleTogglePrivacy(
                    "convera_auto_delete_temp",
                    !autoDeleteTemp,
                    setAutoDeleteTemp
                  )
                }
                className={`w-14 h-7 rounded-full transition-colors relative flex items-center px-1 font-semibold text-[10px] ${
                  autoDeleteTemp ? "bg-gold-400 text-bg" : "bg-bg-panel border border-bg-border text-muted"
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full transition-transform shadow-md flex items-center justify-center font-bold ${
                    autoDeleteTemp ? "translate-x-7 bg-bg text-gold-400" : "translate-x-0 bg-stone-400 text-bg"
                  }`}
                />
                <span
                  className={`absolute ${
                    autoDeleteTemp ? "left-2 text-bg font-bold" : "right-2 text-muted"
                  }`}
                >
                  {autoDeleteTemp ? "ON" : "OFF"}
                </span>
              </button>
            </div>
          </div>

          <div className="border-t border-bg-border/80 my-5" />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleClearHistory}
              className="flex-1 text-[13px] font-medium px-4 py-2.5 rounded-xl border border-red-900/40 text-red-300 hover:bg-red-950/30 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Analysis History</span>
            </button>

            <button
              type="button"
              onClick={handleDeleteAllDocuments}
              className="flex-1 text-[13px] font-medium px-4 py-2.5 rounded-xl border border-red-900/40 text-red-300 hover:bg-red-950/30 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete All Documents</span>
            </button>

            <button
              type="button"
              onClick={handleDeleteAccount}
              className="flex-1 text-[13px] font-medium px-4 py-2.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-200 hover:bg-red-900/50 transition-colors flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Delete Account</span>
            </button>
          </div>

          {/* Privacy Note Reassurance */}
          <div className="mt-5 pt-4 border-t border-bg-border/60 flex items-start gap-2.5 text-subtle text-[12px] leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
            <p>
              Your documents are used only for analysis and are not shared with other users.
            </p>
          </div>
        </section>
      </div>

      {/* Luxury Confirmation Modal Pop-up */}
      <ConfirmModal {...confirmModal} onCancel={closeConfirmModal} />
    </div>
  );
}

