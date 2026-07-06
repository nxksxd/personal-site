import { useState } from "react";
import { useData } from "../context/data-context";
import { ExternalLinkIcon, GitHubIcon, CommentIcon } from "./Icons";
import ProjectMedia from "./ProjectMedia";
import PostModal from "./PostModal";
import ProjectModal from "./ProjectModal";
import type { Post } from "../data/posts";
import type { Project } from "../data/projects";
import "./Projects.css";
import "./HomeSection.css";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function HomeSection() {
  const { projects, posts } = useData();
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const displayProjects = [...projects]
    .sort((a, b) => b.id - a.id)
    .slice(0, 3);
  const displayPosts = posts
    .filter((p) => p.status !== "draft")
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  return (
    <section className="home-section">
      <div className="home-section__inner">
        <div className="home-section__col">
          <h2 className="home-section__title">Проекты</h2>
          <p className="home-section__subtitle">Над чем я работаю</p>

          <div className="home-section__cards">
            {displayProjects.map((p, i) => (
              <article
                key={p.id}
                className={`project-card project-card--clickable${
                  i === 0 ? " project-card--featured" : ""
                }`}
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
                      {p.link && p.link !== "#" && (
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
                    {(p.tags ?? []).map((tag) => (
                      <span key={tag} className="project-card__tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <a href="#projects" className="home-section__more-btn">
            Ещё проекты &rarr;
          </a>
        </div>

        <div className="home-section__col">
          <h2 className="home-section__title">Новости</h2>
          <p className="home-section__subtitle">Последние обновления</p>

          <div className="home-section__cards">
            {displayPosts.map((post) => (
              <article
                key={post.id}
                className="news-preview-card news-preview-card--clickable"
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
                  <div className="news-preview-card__image-wrap">
                    <img
                      className="news-preview-card__image"
                      src={post.image}
                      alt={post.title}
                    />
                  </div>
                )}
                <div className="news-preview-card__body">
                  <div className="news-preview-card__meta">
                    <time className="news-preview-card__date">
                      {formatDate(post.date)}
                    </time>
                    {post.tags && (
                      <div className="news-preview-card__tags">
                        {post.tags.map((tag) => (
                          <span key={tag} className="news-preview-card__tag">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <h3 className="news-preview-card__title">{post.title}</h3>
                  <p className="news-preview-card__content">
                    {post.content.length > 120
                      ? post.content.slice(0, 120) + "..."
                      : post.content}
                  </p>
                  {post.comment && (
                    <div className="news-preview-card__comment">
                      <CommentIcon />
                      <span>
                        {post.comment.length > 80
                          ? post.comment.slice(0, 80) + "..."
                          : post.comment}
                      </span>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>

          <a href="#news" className="home-section__more-btn">
            Все новости &rarr;
          </a>
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
