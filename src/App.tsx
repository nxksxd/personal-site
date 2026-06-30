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
import Footer from "./components/Footer";
import Terms from "./components/Terms";
import AdminPanel from "./components/admin/AdminPanel";
import AdminLogin from "./components/admin/AdminLogin";

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => {
      setHash(window.location.hash);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return hash;
}

function Home() {
  return (
    <>
      <Header />
      <main id="main">
        <HomeSection />
        <Hero />
      </main>
      <Footer />
    </>
  );
}

function ProjectsPage() {
  return (
    <>
      <Header />
      <main id="main">
        <AllProjects />
      </main>
      <Footer />
    </>
  );
}

function NewsPage() {
  return (
    <>
      <Header />
      <main id="main">
        <AllNews />
      </main>
      <Footer />
    </>
  );
}

function TermsPage() {
  return (
    <>
      <Header />
      <main id="main">
        <Terms />
      </main>
      <Footer />
    </>
  );
}

function AdminGate({ onBack }: { onBack: () => void }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <AdminLogin onBack={onBack} />;
  }

  return <AdminPanel onBack={onBack} />;
}

export default function App() {
  const hash = useHashRoute();
  const goHome = () => (window.location.hash = "");

  const renderPage = () => {
    switch (hash) {
      case "#admin":
        return <AdminGate onBack={goHome} />;
      case "#projects":
        return <ProjectsPage />;
      case "#news":
        return <NewsPage />;
      case "#terms":
        return <TermsPage />;
      default:
        return <Home />;
    }
  };

  return (
    <ThemeProvider>
      <DataProvider>
        <AuthProvider>{renderPage()}</AuthProvider>
      </DataProvider>
    </ThemeProvider>
  );
}
