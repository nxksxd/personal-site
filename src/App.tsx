import { ThemeProvider } from "./context/ThemeContext";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import NewsFeed from "./components/NewsFeed";
import Footer from "./components/Footer";

export default function App() {
  return (
    <ThemeProvider>
      <Header />
      <main>
        <Hero />
        <Projects />
        <NewsFeed />
      </main>
      <Footer />
    </ThemeProvider>
  );
}
