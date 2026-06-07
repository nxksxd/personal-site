import { useData } from "../context/DataContext";
import { CommentIcon } from "./Icons";
import "./NewsFeed.css";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function NewsFeed() {
  const { posts } = useData();

  return (
    <section id="news" className="news">
      <div className="news__inner">
        <h2 className="section-title">Новости</h2>
        <p className="section-subtitle">
          Последние обновления и заметки
        </p>

        <div className="news__feed">
          {posts.map((post) => (
            <article key={post.id} className="post-card">
              <div className="post-card__meta">
                <time className="post-card__date">{formatDate(post.date)}</time>
                {post.tags && (
                  <div className="post-card__tags">
                    {post.tags.map((tag) => (
                      <span key={tag} className="post-card__tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <h3 className="post-card__title">{post.title}</h3>
              <p className="post-card__content">{post.content}</p>

              {post.comment && (
                <div className="post-card__comment">
                  <div className="post-card__comment-header">
                    <CommentIcon />
                    <span>Комментарий автора</span>
                  </div>
                  <p className="post-card__comment-text">{post.comment}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
