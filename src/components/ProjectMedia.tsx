interface ProjectMediaProps {
  title: string;
  image?: string;
}

// Deterministic gradient based on the title so each project keeps a stable
// look even without an uploaded image.
function gradientFor(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash * 31 + title.charCodeAt(i)) % 360;
  }
  const h1 = hash;
  const h2 = (hash + 48) % 360;
  return `linear-gradient(135deg, hsl(${h1} 70% 55%), hsl(${h2} 70% 45%))`;
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
