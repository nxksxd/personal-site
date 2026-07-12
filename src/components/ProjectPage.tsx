import { useState } from "react";
import { useData } from "../context/data-context";
import { ExternalLinkIcon, GitHubIcon } from "./Icons";
import ProjectMedia from "./ProjectMedia";
import PostModal from "./PostModal";
import type { Post } from "../data/posts";
import "./ProjectPage.css";

export default function ProjectPage({ id }: { id: number }) {
  const { projects, allPosts, loading } = useData();
  const [activePost, setActivePost] = useState<Post | null>(null);
  const project = projects.find((item) => item.id === id);
  const posts = allPosts
    .filter((post) => post.project_id === id && post.status !== "draft")
    .sort((a, b) => b.date.localeCompare(a.date));

  if (loading) return <section className="project-page"><div className="project-page__inner">Загрузка…</div></section>;
  if (!project) return <section className="project-page"><div className="project-page__inner"><a href="/projects">← Все проекты</a><h1>Проект не найден</h1></div></section>;

  return (
    <section className="project-page">
      <article className="project-page__inner">
        <a href="/projects" className="project-page__back">← Все проекты</a>
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

      <section className="project-page__updates">
        <h2>Новости проекта</h2>
        {posts.length === 0 ? <p className="project-page__empty">Новостей проекта пока нет.</p> : posts.map((post) => (
          <article key={post.id} className="project-page__update" role="button" tabIndex={0} onClick={() => setActivePost(post)} onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setActivePost(post); }
          }}>
            <div className="project-page__update-meta">
              <time>{new Date(post.date).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</time>
              {post.post_type && <span>{post.post_type}</span>}
            </div>
            <h3>{post.title}</h3>
            <p>{post.content.length > 240 ? post.content.slice(0, 240) + "…" : post.content}</p>
          </article>
        ))}
      </section>
      {activePost && <PostModal post={activePost} onClose={() => setActivePost(null)} />}
    </section>
  );
}
