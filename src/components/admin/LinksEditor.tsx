import { SOCIAL_PLATFORMS } from "../../lib/socialIcons";
import type { SocialLink } from "../../lib/socialIcons";

interface LinksEditorProps {
  links: SocialLink[];
  onChange: (links: SocialLink[]) => void;
}

const emptyLink: SocialLink = { label: "", url: "", icon: "github" };

/** Reusable editor for a list of {label, url, icon} social links. */
export default function LinksEditor({ links, onChange }: LinksEditorProps) {
  const update = (i: number, field: keyof SocialLink, value: string) => {
    onChange(links.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  };

  const add = () => onChange([...links, { ...emptyLink }]);
  const remove = (i: number) => onChange(links.filter((_, idx) => idx !== i));

  return (
    <div className="admin__field">
      <label className="admin__label">Ссылки на соцсети</label>
      {links.length === 0 && (
        <p
          style={{
            color: "var(--text-tertiary)",
            fontSize: "0.85rem",
            margin: "0 0 8px",
          }}
        >
          Ссылок пока нет.
        </p>
      )}
      {links.map((link, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 8,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <select
            className="admin__input"
            style={{ flex: "0 0 130px" }}
            value={link.icon}
            onChange={(e) => update(i, "icon", e.target.value)}
          >
            {SOCIAL_PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <input
            className="admin__input"
            style={{ flex: "0 0 120px" }}
            value={link.label}
            onChange={(e) => update(i, "label", e.target.value)}
            placeholder="Подпись"
          />
          <input
            className="admin__input"
            style={{ flex: 1, minWidth: 160 }}
            value={link.url}
            onChange={(e) => update(i, "url", e.target.value)}
            placeholder="https://... или mailto:..."
          />
          <button
            type="button"
            className="admin__btn admin__btn--danger admin__btn--small"
            onClick={() => remove(i)}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        className="admin__btn admin__btn--secondary admin__btn--small"
        onClick={add}
      >
        + Добавить ссылку
      </button>
    </div>
  );
}
