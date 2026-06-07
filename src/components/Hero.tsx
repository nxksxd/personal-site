import { useData } from "../context/DataContext";
import { GitHubIcon, TelegramIcon, EmailIcon, ChevronDownIcon } from "./Icons";
import "./Hero.css";

const iconMap: Record<string, React.ReactNode> = {
  github: <GitHubIcon size={24} />,
  telegram: <TelegramIcon size={24} />,
  email: <EmailIcon size={24} />,
};

export default function Hero() {
  const { socials } = useData();

  return (
    <section id="hero" className="hero">
      <div className="hero__bg-blur" />
      <div className="hero__content">
        <div className="hero__avatar">N</div>
        <h1 className="hero__name">nxksxd</h1>
        <p className="hero__tagline">
          Разработчик &middot; iOS &middot; Web &middot; Open Source
        </p>
        <p className="hero__bio">
          Создаю приложения и инструменты, которые упрощают жизнь. Люблю чистый
          код, красивый дизайн и автоматизацию.
        </p>

        <div className="hero__socials">
          {socials.map((s) => (
            <a
              key={s.name}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hero__social-link"
              title={s.name}
            >
              {iconMap[s.icon] ?? <span>{s.name[0]}</span>}
            </a>
          ))}
        </div>
      </div>

      <a href="#projects" className="hero__scroll-hint" aria-label="Scroll down">
        <ChevronDownIcon size={28} />
      </a>
    </section>
  );
}
