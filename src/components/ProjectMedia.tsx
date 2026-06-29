import { gradientFor } from "../lib/gradient";

interface ProjectMediaProps {
  title: string;
  image?: string;
}

export default function ProjectMedia({ title, image }: ProjectMediaProps) {
  if (image) {
    return (
      <div className="project-card__media">
        <img className="project-card__img" src={image} alt={title} />
      </div>
    );
  }

  return (
    <div
      className="project-card__media project-card__media--fallback"
      style={{ background: gradientFor(title) }}
      aria-hidden="true"
    >
      <span className="project-card__monogram">{title.charAt(0)}</span>
    </div>
  );
}
