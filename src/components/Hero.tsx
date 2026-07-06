import { useData } from "../context/data-context";
import { GitHubIcon, TelegramIcon, EmailIcon } from "./Icons";
import "./Hero.css";

const iconMap: Record<string, React.ReactNode> = {
  github: <GitHubIcon size={20} />,
  telegram: <TelegramIcon size={20} />,
  email: <EmailIcon size={20} />,
};

export default function Hero() {
  const { socials } = useData();

  return (
    <section id="hero" className="hero">
      <div className="hero__bg-blur" />
      <div className="hero__content">
        <div className="hero__text">
          <h1 className="hero__name">nxksxd</h1>
          <p className="hero__tagline">
            Разработчик &middot; iOS &middot; Web &middot; Open Source
          </p>
          <p className="hero__bio">
            Создаю приложения и инструменты, которые упрощают жизнь. Люблю чистый
            код, красивый дизайн и автоматизацию.
          </p>
        </div>
        {socials.length > 0 && (
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
        )}
      </div>
    </section>
  );
}
