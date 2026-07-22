import { useState, useMemo } from "react";
import { useData } from "../context/data-context";
import PostModal from "./PostModal";
import ProjectModal from "./ProjectModal";
import type { Post } from "../data/posts";
import type { Project } from "../data/projects";
import "./HomeSection.css";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Type → emoji mapping
const TYPE_META: Record<string, { icon: string }> = {
  "Релиз": { icon: "🚀" },
  "Devlog": { icon: "🛠" },
  "Анонс": { icon: "📢" },
  "Заметка": { icon: "📝" },
};

function excerpt(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+.*$/gm, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_~`>#]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function HomeSection() {
  const { projects, posts } = useData();
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Projects: newest first.
  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => b.id - a.id).slice(0, 4),
    [projects]
  );

  // Published posts, newest first.
  const feedPosts = useMemo(
    () =>
      posts
        .filter((p) => p.status !== "draft")
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 4),
    [posts]
  );

  return (
    <section className="home-section">
      <div className="home-section__inner">
        {/* ── Колонка: Проекты ── */}
        <div className="home-col">
          <div className="home-col__head">
            <h2 className="home-col__title">Проекты</h2>
            <a href="/projects" className="home-col__all">
              Все проекты &rarr;
            </a>
          </div>

          <div className="home-col__cards">
            {sortedProjects.map((project) => (
              <article
                key={project.id}
                className="project-card"
                role="button"
                tabIndex={0}
                onClick={() => setActiveProject(project)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveProject(project);
                  }
                }}
              >
                {project.image && (
                  <div className="project-card__image-wrap">
                    <img
                      className="project-card__image"
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="project-card__body">
                  <div className="project-card__head">
                    <h3 className="project-card__title">{project.title}</h3>
                    {project.post_count ? (
                      <span
                        className="project-card__count"
                        title={`${project.post_count} обновлений`}
                      >
                        ● {project.post_count}
                      </span>
                    ) : null}
                  </div>
                  <p className="project-card__desc">
                    {project.description}
                  </p>
                  {project.tags && project.tags.length > 0 && (
                    <div className="project-card__tags">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="project-card__tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="project-card__action">Подробнее <span aria-hidden="true">→</span></span>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* ── Колонка: Новости ── */}
        <div className="home-col">
          <div className="home-col__head">
            <h2 className="home-col__title">Новости</h2>
            <a href="/news" className="home-col__all">
              Все новости &rarr;
            </a>
          </div>

          {feedPosts.length === 0 && (
            <p className="home-col__empty">Пока нет новостей.</p>
          )}

          <div className="home-col__cards">
            {feedPosts.map((post) => {
              const type = post.post_type;
              const typeMeta = type ? TYPE_META[type] : undefined;
              return (
                <article
                  key={post.id}
                  className="news-card"
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
                  {post.image && (
                    <div className="news-card__image-wrap">
                      <img
                        className="news-card__image"
                        src={post.image}
                        alt={post.title}
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="news-card__body">
                    <div className="news-card__meta">
                      {(post.category || type || post.project) && (
                        <span className="news-card__type">
                          {post.category?.name ?? (type ? `${typeMeta?.icon ?? ""} ${type}`.trim() : post.project?.title)}
                        </span>
                      )}
                      <time className="news-card__date">
                        {formatDate(post.date)}
                      </time>
                    </div>

                    <h3 className="news-card__title">{post.title}</h3>
                    <p className="news-card__content">
                      {excerpt(post.content)}
                    </p>

                    <span className="news-card__action">Читать <span aria-hidden="true">→</span></span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>

      {activePost && (
        <PostModal post={activePost} onClose={() => setActivePost(null)} />
      )}
      {activeProject && (
        <ProjectModal
          project={activeProject}
          onClose={() => setActiveProject(null)}
        />
      )}
    </section>
  );
}
