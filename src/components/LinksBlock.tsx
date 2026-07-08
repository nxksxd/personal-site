import { SocialIcon, platformLabel } from "../lib/socialIcons";
import type { SocialLink } from "../lib/socialIcons";
import "./LinksBlock.css";

interface LinksBlockProps {
  links?: SocialLink[];
}

/** Renders a row of social/external links in post & project modals. */
export default function LinksBlock({ links }: LinksBlockProps) {
  if (!links || links.length === 0) return null;
  return (
    <div className="links-block">
      {links.map((l, i) => (
        <a
          key={`${l.url}-${i}`}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          className="links-block__link"
          title={l.label || platformLabel(l.icon)}
        >
          <SocialIcon icon={l.icon} size={18} />
          <span>{l.label || platformLabel(l.icon)}</span>
        </a>
      ))}
    </div>
  );
}
