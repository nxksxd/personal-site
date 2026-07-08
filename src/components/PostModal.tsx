import Modal from "./Modal";
import { CommentIcon } from "./Icons";
import MarkdownContent from "./MarkdownContent";
import LinksBlock from "./LinksBlock";
import type { Post } from "../data/posts";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

interface PostModalProps {
  post: Post;
  onClose: () => void;
}

export default function PostModal({ post, onClose }: PostModalProps) {
  return (
    <Modal onClose={onClose} labelledBy="post-modal-title">
      {post.image && (
        <div className="modal-detail__media">
          <img src={post.image} alt={post.title} />
        </div>
      )}
      <div className="modal-detail__body">
        <div className="modal-detail__meta">
          <time className="modal-detail__date">{formatDate(post.date)}</time>
          {post.category && (
            <span
              className="modal-detail__tag"
              style={{
                background: post.category.color + "22",
                color: post.category.color,
              }}
            >
              {post.category.name}
            </span>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="modal-detail__tags">
              {post.tags.map((tag) => (
                <span key={tag} className="modal-detail__tag">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <h2 id="post-modal-title" className="modal-detail__title">
          {post.title}
        </h2>
        <div className="modal-detail__text">
          <MarkdownContent content={post.content} className="modal-detail__markdown" />
        </div>
        {post.comment && (
          <div className="modal-detail__comment">
            <div className="modal-detail__comment-header">
              <CommentIcon />
              <span>Комментарий автора</span>
            </div>
            <p className="modal-detail__comment-text">{post.comment}</p>
          </div>
        )}
        <LinksBlock links={post.links} />
      </div>
    </Modal>
  );
}
