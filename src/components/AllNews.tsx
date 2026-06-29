import { useState } from "react";
import { useData } from "../context/data-context";
import { CommentIcon } from "./Icons";
import PostModal from "./PostModal";
import type { Post } from "../data/posts";
import "./AllNews.css";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AllNews() {
  const { posts } = useData();
  const [activePost, setActivePost] = useState<Post | null>(null);

  return (
    <section className="all-news">
      <div className="all-news__inner">
        <a href="#" className="all-news__back">&larr; На главную</a>
        <h1 className="all-news__title">Новости</h1>
        <p className="all-news__subtitle">
          Все обновления и заметки
        </p>

        <div className="all-news__grid">
          {posts.map((post) => (
            <article
              key={post.id}
              className="all-news__card all-news__card--clickable"
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
                <div className="all-news__card-image-wrap">
                  <img
                    className="all-news__card-image"
                    src={post.image}
                    alt={post.title}
                  />
                </div>
              )}
              <div className="all-news__card-body">
                <div className="all-news__card-meta">
                  <time className="all-news__card-date">
                    {formatDate(post.date)}
                  </time>
                  {post.tags && (
                    <div className="all-news__card-tags">
                      {post.tags.map((tag) => (
                        <span key={tag} className="all-news__card-tag">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <h3 className="all-news__card-title">{post.title}</h3>
                <p className="all-news__card-content">{post.content}</p>
                {post.comment && (
                  <div className="all-news__card-comment">
                    <div className="all-news__card-comment-header">
                      <CommentIcon />
                      <span>Комментарий автора</span>
                    </div>
                    <p className="all-news__card-comment-text">{post.comment}</p>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {posts.length === 0 && (
          <p className="all-news__empty">Нет новостей.</p>
        )}
      </div>

      {activePost && (
        <PostModal post={activePost} onClose={() => setActivePost(null)} />
      )}
    </section>
  );
}
