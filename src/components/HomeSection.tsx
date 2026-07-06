import { useState, useMemo } from "react";
import { useData } from "../context/data-context";
import { CommentIcon } from "./Icons";
import PostModal from "./PostModal";
import type { Post } from "../data/posts";
import "./HomeSection.css";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function timeAgo(dateStr: string): string {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  const days = Math.floor((now - then) / 86400000);
  if (days < 0) return "";
  if (days === 0) return "сегодня";
  if (days === 1) return "вчера";
  if (days < 7) return `${days} дн. назад`;
  if (days < 30) {
    const w = Math.floor(days / 7);
    return `${w} нед. назад`;
  }
  const m = Math.floor(days / 30);
  if (m < 12) return `${m} мес. назад`;
  const y = Math.floor(days / 365);
  return `${y} г. назад`;
}

function monthLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const s = d.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Type → emoji + color mapping
const TYPE_META: Record<string, { icon: string }> = {
  "Релиз": { icon: "🚀" },
  "Devlog": { icon: "🛠" },
  "Анонс": { icon: "📢" },
  "Заметка": { icon: "📝" },
};

export default function HomeSection() {
  const { projects, posts } = useData();
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [filterProject, setFilterProject] = useState<number | null>(null);

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => b.id - a.id),
    [projects]
  );

  // Published posts, newest first, optionally filtered by project.
  const feedPosts = useMemo(() => {
    let list = posts.filter((p) => p.status !== "draft");
    if (filterProject !== null) {
      list = list.filter((p) => p.project_id === filterProject);
    }
    return list.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12);
  }, [posts, filterProject]);

  // Group feed by month for the timeline look.
  const grouped = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const p of feedPosts) {
      const key = monthLabel(p.date);
      const arr = map.get(key) ?? [];
      arr.push(p);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [feedPosts]);

  const activeFilterName =
    filterProject !== null
      ? projects.find((p) => p.id === filterProject)?.title ?? null
      : null;

  return (
    <section className="home-section">
      <div className="home-section__inner">
        {/* ── Проекты: узкая витрина-чипы ── */}
        <div className="devlog-projects">
          <div className="devlog-projects__head">
            <h2 className="devlog-projects__title">Проекты</h2>
            <a href="#projects" className="devlog-projects__all">
              Все &rarr;
            </a>
          </div>
          <div className="devlog-projects__chips">
            {sortedProjects.map((p) => (
              <button
                key={p.id}
                className={`project-chip${
                  filterProject === p.id ? " project-chip--active" : ""
                }`}
                onClick={() =>
                  setFilterProject(filterProject === p.id ? null : p.id)
                }
                title={
                  filterProject === p.id
                    ? "Показать все обновления"
                    : `Обновления по проекту ${p.title}`
                }
              >
                <span className="project-chip__name">{p.title}</span>
                {p.post_count ? (
                  <span className="project-chip__count">
                    ● {p.post_count}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        {/* ── Devlog: лента обновлений ── */}
        <div className="devlog-feed">
          <div className="devlog-feed__head">
            <div>
              <h2 className="devlog-feed__title">Devlog</h2>
              <p className="devlog-feed__subtitle">
                {activeFilterName
                  ? `Обновления · ${activeFilterName}`
                  : "Что нового по проектам"}
              </p>
            </div>
            {filterProject !== null && (
              <button
                className="devlog-feed__clear"
                onClick={() => setFilterProject(null)}
              >
                ✕ Сбросить фильтр
              </button>
            )}
            {filterProject === null && (
              <a href="#news" className="devlog-feed__all">
                Весь devlog &rarr;
              </a>
            )}
          </div>

          {feedPosts.length === 0 && (
            <p className="devlog-feed__empty">
              {activeFilterName
                ? `Пока нет обновлений по проекту ${activeFilterName}.`
                : "Пока нет обновлений."}
            </p>
          )}

          {grouped.map(([month, monthPosts]) => (
            <div key={month} className="devlog-month">
              <div className="devlog-month__label">
                <span>{month}</span>
                <span className="devlog-month__line" />
              </div>

              {monthPosts.map((post) => {
                const type = post.post_type;
                const typeMeta = type ? TYPE_META[type] : undefined;
                return (
                  <article
                    key={post.id}
                    className="devlog-entry"
                    role="button"
                    tabIndex={0}
                    onClick={() => setActivePost(post)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActivePost(post);
                      }
                    }}
                  >
                    <div className="devlog-entry__meta">
                      {post.project && (
                        <span
                          className="devlog-entry__project"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFilterProject(post.project!.id);
                          }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.stopPropagation();
                              setFilterProject(post.project!.id);
                            }
                          }}
                        >
                          {post.project.title}
                        </span>
                      )}
                      {type && (
                        <span className="devlog-entry__type">
                          {typeMeta?.icon} {type}
                        </span>
                      )}
                      <time className="devlog-entry__date">
                        {formatDate(post.date)} · {timeAgo(post.date)}
                      </time>
                    </div>

                    <h3 className="devlog-entry__title">{post.title}</h3>
                    <p className="devlog-entry__excerpt">
                      {post.content.length > 160
                        ? post.content.slice(0, 160) + "…"
                        : post.content}
                    </p>

                    {post.comment && (
                      <div className="devlog-entry__comment">
                        <CommentIcon />
                        <span>
                          {post.comment.length > 90
                            ? post.comment.slice(0, 90) + "…"
                            : post.comment}
                        </span>
                      </div>
                    )}

                    <span className="devlog-entry__read">Читать &rarr;</span>
                  </article>
                );
              })}
            </div>
          ))}

          {feedPosts.length > 0 && (
            <a href="#news" className="devlog-feed__more">
              Весь devlog &rarr;
            </a>
          )}
        </div>
      </div>

      {activePost && (
        <PostModal post={activePost} onClose={() => setActivePost(null)} />
      )}
    </section>
  );
}
