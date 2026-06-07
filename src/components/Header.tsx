import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { SunIcon, MoonIcon, MenuIcon, CloseIcon } from "./Icons";
import "./Header.css";

const NAV_ITEMS = [
  { label: "Обо мне", href: "#hero" },
  { label: "Проекты", href: "#projects" },
  { label: "Новости", href: "#news" },
  { label: "Контакты", href: "#footer" },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header__inner">
        <a href="#hero" className="header__logo">
          nxksxd<span className="header__logo-dot">.</span>
        </a>

        <nav className={`header__nav ${menuOpen ? "header__nav--open" : ""}`}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="header__link"
              onClick={() => setMenuOpen(false)}
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
