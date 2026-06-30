import { useState } from "react";
import { useData } from "../context/data-context";
import MarkdownContent from "./MarkdownContent";
import PostModal from "./PostModal";
import type { Post } from "../data/posts";
import "./AllNews.css";

export default function AllNews() {
  const { allPosts, categories } = useData();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const publishedPosts = allPosts.filter((p) => p.status === "published");
  const filtered = selectedCategory
    ? publishedPosts.filter((p) => p.category_id === selectedCategory)
    : publishedPosts;

  return (
    <div className="all-news">
      <div className="all-news__header">
        <h1 className="all-news__title">Все новости</h1>
        <p className="all-news__subtitle">Блог разработчика</p>
      </div>

      {categories.length > 0 && (
        <div className="all-news__filters">
          <button
            className={`all-news__filter ${selectedCategory === null ? "all-news__filter--active" : ""}`}
            onClick={() => setSelectedCategory(null)}
          >
            Все ({publishedPosts.length})
          </button>
          {categories.map((cat) => {
            const count = publishedPosts.filter((p) => p.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                className={`all-news__filter ${selectedCategory === cat.id ? "all-news__filter--active" : ""}`}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  borderColor: selectedCategory === cat.id ? cat.color : undefined,
                  color: selectedCategory === cat.id ? cat.color : undefined,
                }}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      )}

      <div className="all-news__grid">
        {filtered.length === 0 ? (
          <p className="all-news__empty">Нет постов в этой категории</p>
        ) : (
          filtered.map((post) => (
            <article
              key={post.id}
              className="all-news__card all-news__card--clickable"
              onClick={() => setSelectedPost(post)}
            >
              {post.image && (
                <div className="all-news__card-image-wrap">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="all-news__card-image"
                  />
                </div>
              )}
              <div className="all-news__card-body">
                <div className="all-news__card-meta">
                  <time className="all-news__card-date">{post.date}</time>
                  {post.category && (
                    <span
                      className="all-news__card-category"
                      style={{
                        background: post.category.color + "22",
                        color: post.category.color,
                      }}
                    >
                      {post.category.name}
                    </span>
                  )}
                </div>
                <h3 className="all-news__card-title">{post.title}</h3>
                <div className="all-news__card-content">
                  <MarkdownContent
                    content={post.content.slice(0, 200)}
                    preview={true}
                  />
                </div>
                {post.comment && (
                  <div className="all-news__card-comment">
                    <div className="all-news__card-comment-header">
                      💬 Комментарий автора
                    </div>
                    <p className="all-news__card-comment-text">{post.comment}</p>
                  </div>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      {selectedPost && (
        <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
}
