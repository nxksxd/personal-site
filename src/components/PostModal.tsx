import { useEffect, useState } from "react";
import MarkdownContent from "./MarkdownContent";
import Modal from "./Modal";
import type { Post } from "../data/posts";

interface PostModalProps {
  post: Post;
  onClose: () => void;
}

export default function PostModal({ post, onClose }: PostModalProps) {
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  return (
    <Modal onClose={onClose} className="post-modal">
      <div className="post-modal__content">
        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            className="post-modal__image"
          />
        )}
        <h2 className="post-modal__title">{post.title}</h2>
        <div className="post-modal__meta">
          <time>{post.date}</time>
          {post.tags && post.tags.length > 0 && (
            <span className="post-modal__tags">
              {post.tags.map((tag, i) => (
                <span key={i} className="post-modal__tag">
                  #{tag}
                </span>
              ))}
            </span>
          )}
          {post.category && (
            <span
              className="post-modal__category"
              style={{ background: post.category.color + "22", color: post.category.color }}
            >
              {post.category.name}
            </span>
          )}
        </div>
        <MarkdownContent content={post.content} />
        {post.comment && (
          <div className="post-modal__comment">
            <em className="post-modal__comment-label">Комментарий автора:</em>
            <p>{post.comment}</p>
          </div>
        )}
        <div className="post-modal__actions">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="post-modal__share"
          >
            Поделиться
          </a>
        </div>
      </div>
    </Modal>
  );
}
