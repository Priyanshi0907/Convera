import { Route, Routes } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import TopBar from "./components/TopBar.jsx";
import { AuthProvider, useAuth } from "./lib/AuthContext.jsx";
import Analyze from "./pages/Analyze.jsx";
import Auth, { ConveraLogo } from "./pages/Auth.jsx";
import Compare from "./pages/Compare.jsx";
import Documents from "./pages/Documents.jsx";
import History from "./pages/History.jsx";
import Home from "./pages/Home.jsx";
import Settings from "./pages/Settings.jsx";
import { Loader2 } from "lucide-react";

function AppShell() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0a07] flex flex-col items-center justify-center gap-4 text-cream">
        <ConveraLogo size="md" centered={true} />
        <div className="flex items-center gap-2 text-[13px] text-muted mt-2">
          <Loader2 className="w-4 h-4 animate-spin text-gold-400" />
          <span>Loading Convera...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="flex min-h-screen bg-bg text-cream">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <TopBar />
        <main className="px-8 pb-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analyze" element={<Analyze />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/history" element={<History />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

