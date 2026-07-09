import { createContext, useContext } from "react";
import type { Project } from "../data/projects";
import type { Post, Category, Upload, DashboardStats } from "../data/posts";
import type { Social } from "../data/socials";

export interface DataContextType {
  projects: Project[];
  posts: Post[];
  allPosts: Post[];
  socials: Social[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  addProject: (project: Omit<Project, "id">) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  addPost: (post: Omit<Post, "id">) => Promise<void>;
  updatePost: (post: Post) => Promise<void>;
  deletePost: (id: number) => Promise<void>;
  addSocial: (social: Omit<Social, "id">) => Promise<void>;
  updateSocial: (social: Social) => Promise<void>;
  deleteSocial: (id: number) => Promise<void>;
  reorderSocials: (orderedIds: number[]) => Promise<void>;
  addCategory: (category: Omit<Category, "id">) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  uploadFile: (file: File) => Promise<Upload>;
  uploads: Upload[];
  loadUploads: () => Promise<void>;
  deleteUpload: (id: number) => Promise<void>;
  loadDashboard: () => Promise<DashboardStats>;
  resetAll: () => Promise<void>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be inside DataProvider");
  return ctx;
}
