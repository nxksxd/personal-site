import { useData } from "../context/DataContext";
import { ExternalLinkIcon, GitHubIcon } from "./Icons";
import "./Projects.css";

export default function Projects() {
  const { projects } = useData();

  return (
    <section id="projects" className="projects">
      <div className="projects__inner">
        <h2 className="section-title">Проекты</h2>
        <p className="section-subtitle">
          Вот несколько вещей, над которыми я работаю
        </p>

        <div className="projects__grid">
          {projects.map((p) => (
            <article key={p.id} className="project-card">
              <div className="project-card__header">
                <h3 className="project-card__title">{p.title}</h3>
                <div className="project-card__links">
                  {p.github && (
                    <a
                      href={p.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-card__icon-link"
                      title="GitHub"
                    >
                      <GitHubIcon size={18} />
                    </a>
                  )}
                  {p.link !== "#" && (
                    <a
                      href={p.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-card__icon-link"
                      title="Открыть"
                    >
                      <ExternalLinkIcon size={16} />
                    </a>
                  )}
                </div>
              </div>

              <p className="project-card__desc">{p.description}</p>

              <div className="project-card__tags">
                {p.tags.map((tag) => (
                  <span key={tag} className="project-card__tag">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
