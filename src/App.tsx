import { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { DataProvider } from "./context/DataContext";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./context/auth-context";
import Header from "./components/Header";
import Hero from "./components/Hero";
import HomeSection from "./components/HomeSection";
import AllProjects from "./components/AllProjects";
import AllNews from "./components/AllNews";
import ProjectPage from "./components/ProjectPage";
import Footer from "./components/Footer";
import Terms from "./components/Terms";
import AdminPanel from "./components/admin/AdminPanel";
import AdminLogin from "./components/admin/AdminLogin";

const LEGACY_ROUTES: Record<string, string> = {
  "#projects": "/projects",
  "#news": "/news",
  "#admin": "/admin",
  "#terms": "/terms",
};

function usePathRoute() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const legacyProject = window.location.hash.match(/^#project\/(\d+)$/);
    const legacyPath = legacyProject ? `/projects/${legacyProject[1]}` : LEGACY_ROUTES[window.location.hash];
    if (legacyPath) {
      window.history.replaceState({}, "", legacyPath);
      setPath(legacyPath);
    }

    const onPopState = () => {
      setPath(window.location.pathname);
      window.scrollTo(0, 0);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return path.replace(/\/+$/, "") || "/";
}

function Home() { return <><Header /><main id="main"><Hero /><HomeSection /></main><Footer /></>; }
function ProjectsPage() { return <><Header /><main id="main"><AllProjects /></main><Footer /></>; }
function NewsPage() { return <><Header /><main id="main"><AllNews /></main><Footer /></>; }
function TermsPage() { return <><Header /><main id="main"><Terms /></main><Footer /></>; }
function ProjectDetailPage({ id }: { id: number }) { return <><Header /><main id="main"><ProjectPage id={id} /></main><Footer /></>; }

function AdminGate({ onBack }: { onBack: () => void }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AdminPanel onBack={onBack} /> : <AdminLogin onBack={onBack} />;
}

export default function App() {
  const path = usePathRoute();
  const goHome = () => window.location.assign("/");
  const projectMatch = path.match(/^\/projects\/(\d+)$/);

  const renderPage = () => {
    if (projectMatch) return <ProjectDetailPage id={Number(projectMatch[1])} />;
    switch (path) {
      case "/admin": return <AdminGate onBack={goHome} />;
      case "/projects": return <ProjectsPage />;
      case "/news": return <NewsPage />;
      case "/terms": return <TermsPage />;
      default: return <Home />;
    }
  };

  return <ThemeProvider><DataProvider><AuthProvider>{renderPage()}</AuthProvider></DataProvider></ThemeProvider>;
}
