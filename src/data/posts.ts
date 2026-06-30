export interface Post {
  id: number;
  title: string;
  date: string;
  content: string;
  image?: string;
  comment?: string;
  tags?: string[];
  status?: "published" | "draft";
  slug?: string;
  meta_description?: string;
  og_image?: string;
  category_id?: number;
  category?: Category;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  link?: string;
  github?: string;
  status?: "active" | "archived";
  tags?: string[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
}

export interface Social {
  id: number;
  name: string;
  url: string;
  icon?: string;
}

export interface User {
  id: number;
  username: string;
  password?: string;
}

export interface Upload {
  id: number;
  filename: string;
  url: string;
  size: number;
  mime_type: string;
  uploaded_at: string;
}

export interface DashboardStats {
  total_posts: number;
  published_posts: number;
  draft_posts: number;
  total_projects: number;
  total_categories: number;
  total_socials: number;
  total_uploads: number;
  recent_posts: Array<{
    id: number;
    title: string;
    date: string;
    status: string;
  }>;
}
