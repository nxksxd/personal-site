import { useState } from "react";
import { useData } from "../context/data-context";
import { ExternalLinkIcon, GitHubIcon } from "./Icons";
import ProjectMedia from "./ProjectMedia";
import ProjectModal from "./ProjectModal";
import type { Project } from "../data/projects";
import "./AllProjects.css";

export default function AllProjects() {
  const { projects } = useData();
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const sortedProjects = [...projects].sort((a, b) => b.id - a.id);

  return (
    <section className="all-projects">
      <div className="all-projects__inner">
        <a href="#" className="all-projects__back">&larr; На главную</a>
        <h1 className="all-projects__title">Все проекты</h1>
        <p className="all-projects__subtitle">
          Вот всё, над чем я работаю и работал
        </p>

        <div className="all-projects__grid">
          {sortedProjects.map((p) => (
            <article
              key={p.id}
              className="project-card project-card--clickable all-projects-card"
              role="button"
              tabIndex={0}
              onClick={() => setActiveProject(p)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setActiveProject(p);
                }
              }}
            >
              <ProjectMedia title={p.title} image={p.image} />
              <div className="project-card__body">
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
                        onClick={(e) => e.stopPropagation()}
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
                        onClick={(e) => e.stopPropagation()}
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
              </div>
            </article>
          ))}
        </div>

        {projects.length === 0 && (
          <p className="all-projects__empty">Нет проектов.</p>
        )}
      </div>

      {activeProject && (
        <ProjectModal
          project={activeProject}
          onClose={() => setActiveProject(null)}
        />
      )}
    </section>
  );
}
