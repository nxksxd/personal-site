import { useData } from "../context/data-context";
import { ExternalLinkIcon, GitHubIcon } from "./Icons";
import ProjectMedia from "./ProjectMedia";
import "./ProjectPage.css";

export default function ProjectPage({ id }: { id: number }) {
  const { projects, loading } = useData();
  const project = projects.find((item) => item.id === id);

  if (loading) return <section className="project-page"><div className="project-page__inner">Загрузка…</div></section>;
  if (!project) return <section className="project-page"><div className="project-page__inner"><a href="#projects">← Все проекты</a><h1>Проект не найден</h1></div></section>;

  return (
    <section className="project-page">
      <article className="project-page__inner">
        <a href="#projects" className="project-page__back">← Все проекты</a>
        <ProjectMedia title={project.title} image={project.image} />
        <div className="project-page__body">
          <div className="project-page__tags">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
          <h1>{project.title}</h1>
          <p className="project-page__lead">{project.description}</p>
          <div className="project-page__content">{project.detail_content?.trim() || project.description}</div>
          <div className="project-page__links">
            {project.github && <a href={project.github} target="_blank" rel="noopener noreferrer"><GitHubIcon size={18} /> GitHub</a>}
            {project.link !== "#" && <a href={project.link} target="_blank" rel="noopener noreferrer"><ExternalLinkIcon size={16} /> Открыть проект</a>}
          </div>
        </div>
      </article>
    </section>
  );
}
