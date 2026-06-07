import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { SunIcon, MoonIcon, MenuIcon, CloseIcon } from "./Icons";
import "./Header.css";

const NAV_ITEMS = [
  { label: "Проекты", href: "#projects" },
  { label: "Новости", href: "#news" },
  { label: "Обо мне", href: "#hero" },
  { label: "Контакты", href: "#footer" },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMenuOpen(false);
    if (href === "#footer" || href === "#hero") {
      e.preventDefault();
      if (window.location.hash !== "" && window.location.hash !== "#") {
        window.location.hash = "";
        setTimeout(() => {
          const el = document.getElementById(href.slice(1));
          el?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      } else {
        const el = document.getElementById(href.slice(1));
        el?.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <header className="header">
      <div className="header__inner">
        <a
          href="#"
          className="header__logo"
          onClick={() => setMenuOpen(false)}
        >
          nxksxd<span className="header__logo-dot">.</span>
        </a>

        <nav className={`header__nav ${menuOpen ? "header__nav--open" : ""}`}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href + item.label}
              href={item.href}
              className="header__link"
              onClick={(e) => handleNavClick(e, item.href)}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header__actions">
          <button
            className="header__theme-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <button
            className="header__menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
    </header>
  );
}
