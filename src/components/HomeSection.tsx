import { useState } from "react";
import { useData } from "../context/data-context";
import MarkdownContent from "./MarkdownContent";
import PostModal from "./PostModal";
import type { Post } from "../data/posts";
import "./HomeSection.css";

export default function HomeSection() {
  const { allPosts } = useData();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const recentPosts = allPosts
    .filter((p) => p.status === "published")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <section className="home-section">
      <div className="home-section__container">
        <h2 className="home-section__title">Последние новости</h2>
        <p className="home-section__subtitle">Читай свежие посты из блога</p>

        <div className="home-section__feed">
          {recentPosts.map((post) => (
            <article
              key={post.id}
              className="home-section__post"
              onClick={() => setSelectedPost(post)}
            >
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="home-section__post-image"
                />
              )}
              <div className="home-section__post-content">
                <h3 className="home-section__post-title">{post.title}</h3>
                <div className="home-section__post-excerpt">
                  <MarkdownContent
                    content={post.content.slice(0, 150)}
                    preview={true}
                  />
                </div>
                <div className="home-section__post-meta">
                  <time>{post.date}</time>
                  {post.category && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 6,
                        background: post.category.color + "22",
                        color: post.category.color,
                      }}
                    >
                      {post.category.name}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {recentPosts.length > 0 && (
          <a href="#news" className="home-section__link">
            Все новости →
          </a>
        )}
      </div>

      {selectedPost && (
        <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </section>
  );
}
