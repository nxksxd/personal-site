import { useData } from "../context/DataContext";
import { GitHubIcon, TelegramIcon, EmailIcon } from "./Icons";
import "./Footer.css";

const iconMap: Record<string, React.ReactNode> = {
  github: <GitHubIcon size={20} />,
  telegram: <TelegramIcon size={20} />,
  email: <EmailIcon size={20} />,
};

export default function Footer() {
  const { socials } = useData();

  return (
    <footer id="footer" className="footer">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <span className="footer__logo">
              nxksxd<span className="footer__logo-dot">.</span>
            </span>
            <p className="footer__desc">
              Разработчик, который любит создавать полезные вещи.
            </p>
          </div>

          <div className="footer__socials">
            {socials.map((s) => (
              <a
                key={s.name}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
                title={s.name}
              >
                {iconMap[s.icon] ?? <span>{s.name[0]}</span>}
              </a>
            ))}
          </div>
        </div>

        <div className="footer__bottom">
          <span>&copy; {new Date().getFullYear()} nxksxd. Все права защищены.</span>
        </div>
      </div>
    </footer>
  );
}
