import { useEffect, useState } from "react";
import { useData } from "../../context/data-context";
import type { DashboardStats } from "../../data/posts";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DashboardView() {
  const { loadDashboard } = useData();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const s = await loadDashboard();
        if (active) setStats(s);
      } catch {
        if (active) setError("Не удалось загрузить статистику");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [loadDashboard]);

  if (loading) return <p className="admin__empty">Загрузка...</p>;
  if (error) return <p className="admin__error">{error}</p>;
  if (!stats) return null;

  const cards = [
    { label: "Постов", value: stats.total_posts, color: "#6366f1" },
    { label: "Опубликовано", value: stats.published_posts, color: "#10b981" },
    { label: "Черновиков", value: stats.draft_posts, color: "#f59e0b" },
    { label: "Проектов", value: stats.total_projects, color: "#3b82f6" },
    { label: "Категорий", value: stats.total_categories, color: "#8b5cf6" },
    { label: "Соцсетей", value: stats.total_socials, color: "#ec4899" },
    { label: "Файлов", value: stats.total_uploads, color: "#14b8a6" },
  ];

  return (
    <div>
      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 12,
          marginBottom: 32,
        }}
      >
        {cards.map((c) => (
          <div
            key={c.label}
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "20px 16px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                color: c.color,
                lineHeight: 1,
              }}
            >
              {c.value}
            </div>
            <div
              style={{
                fontSize: "0.82rem",
                color: "var(--text-tertiary)",
                marginTop: 6,
                fontWeight: 600,
              }}
            >
              {c.label}
            </div>
          </div>
        ))}
      </div>

      {/* Recent posts */}
      <h3
        style={{
          color: "var(--text-primary)",
          fontSize: "1.1rem",
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        Последние посты
      </h3>
      {stats.recent_posts.length === 0 ? (
        <p className="admin__empty">Нет постов</p>
      ) : (
        stats.recent_posts.map((post) => (
          <div
            key={post.id}
            className="admin__card"
            style={{ padding: "14px 18px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    fontSize: "0.95rem",
                  }}
                >
                  {post.title}
                </span>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 6,
                    marginLeft: 8,
                    background:
                      post.status === "draft"
                        ? "#f59e0b22"
                        : "#10b98122",
                    color:
                      post.status === "draft" ? "#f59e0b" : "#10b981",
                  }}
                >
                  {post.status === "draft" ? "Черновик" : "Опубликован"}
                </span>
              </div>
              <time
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-tertiary)",
                }}
              >
                {formatDate(post.date)}
              </time>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
