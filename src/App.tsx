import { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { DataProvider } from "./context/DataContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import NewsFeed from "./components/NewsFeed";
import Footer from "./components/Footer";
import AdminPanel from "./components/admin/AdminPanel";
import AdminLogin from "./components/admin/AdminLogin";

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return hash;
}

function Site() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Projects />
        <NewsFeed />
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
  const isAdmin = hash === "#admin";
  const goBack = () => (window.location.hash = "");

  return (
    <ThemeProvider>
      <DataProvider>
        <AuthProvider>
          {isAdmin ? <AdminGate onBack={goBack} /> : <Site />}
        </AuthProvider>
      </DataProvider>
    </ThemeProvider>
  );
}
