import Modal from "./Modal";
import { gradientFor } from "../lib/gradient";
import { ExternalLinkIcon, GitHubIcon } from "./Icons";
import LinksBlock from "./LinksBlock";
import type { Project } from "../data/projects";

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectModal({ project, onClose }: ProjectModalProps) {
  return (
    <Modal onClose={onClose} labelledBy="project-modal-title">
      {project.image ? (
        <div className="modal-detail__media">
          <img src={project.image} alt={project.title} />
        </div>
      ) : (
        <div
          className="modal-detail__media modal-detail__media--fallback"
          style={{ background: gradientFor(project.title) }}
          aria-hidden="true"
        >
          <span className="modal-detail__monogram">
            {project.title.charAt(0)}
          </span>
        </div>
      )}
      <div className="modal-detail__body">
        {project.tags.length > 0 && (
          <div className="modal-detail__meta">
            <div className="modal-detail__tags">
              {project.tags.map((tag) => (
                <span key={tag} className="modal-detail__tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        <h2 id="project-modal-title" className="modal-detail__title">
          {project.title}
        </h2>
        <p className="modal-detail__text">{project.description}</p>
        <div className="modal-detail__links modal-detail__links--project">
          <a href={`#project/${project.id}`} className="modal-detail__link" onClick={onClose}>Подробнее</a>
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="modal-detail__link"
            >
              <GitHubIcon size={18} /> GitHub
            </a>
          )}
          {project.link !== "#" && (
            <a href={project.link} target="_blank" rel="noopener noreferrer" className="modal-detail__link">
              <ExternalLinkIcon size={16} /> Открыть
            </a>
          )}
          <LinksBlock links={project.links} />
        </div>
      </div>
    </Modal>
  );
}
