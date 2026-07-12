import { useData } from "../context/data-context";
import { SocialIcon } from "../lib/socialIcons";
import "./Footer.css";

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
                {s.icon ? <SocialIcon icon={s.icon} size={20} /> : <span>{s.name[0]}</span>}
              </a>
            ))}
          </div>
        </div>

        <div className="footer__bottom">
          <span>&copy; 2024–{new Date().getFullYear()} Nikita Syromyatnikov. Все права защищены.</span>
          <a href="/terms" className="footer__terms-link">Условия использования</a>
        </div>
      </div>
    </footer>
  );
}
