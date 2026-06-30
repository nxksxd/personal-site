import { useMemo } from "react";
import "./MarkdownContent.css";

interface MarkdownContentProps {
  content: string;
  className?: string;
  preview?: boolean;
}

// Simple markdown renderer
function renderMarkdown(md: string): string {
  let html = md
    // Headers
    .replace(/^### (.*?)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*?)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*?)$/gm, "<h1>$1</h1>")
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Code
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Line breaks
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br />");
  
  return `<p>${html}</p>`;
}

export default function MarkdownContent({
  content,
  className,
  preview,
}: MarkdownContentProps) {
  const html = useMemo(() => renderMarkdown(content), [content]);

  return (
    <div
      className={`markdown-content ${className || ""} ${preview ? "markdown-content--preview" : ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
