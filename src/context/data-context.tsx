import { createContext, useContext, useState, useCallback } from "react";
import type { Post, Project, Category, Social, User, DashboardStats } from "../data/posts";

interface DataContextType {
  allPosts: Post[];
  allProjects: Project[];
  categories: Category[];
  allSocials: Social[];
  allUsers: User[];
  
  addPost: (post: Omit<Post, "id">) => Promise<void>;
  updatePost: (post: Post) => Promise<void>;
  deletePost: (id: number) => Promise<void>;
  
  addProject: (project: Omit<Project, "id">) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
  
  addCategory: (cat: Omit<Category, "id">) => Promise<void>;
  updateCategory: (cat: Category) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  
  addSocial: (social: Omit<Social, "id">) => Promise<void>;
  updateSocial: (social: Social) => Promise<void>;
  deleteSocial: (id: number) => Promise<void>;
  
  addUser: (user: Omit<User, "id">) => Promise<void>;
  updateUser: (user: User) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  
  uploadFile: (file: File) => Promise<{ url: string }>;
  loadDashboard: () => Promise<DashboardStats>;
  resetAll: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [allSocials, setAllSocials] = useState<Social[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const api = useCallback(
    (endpoint: string, method: string = "GET", body?: unknown) => {
      const opts: RequestInit = {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      };
      if (body) opts.body = JSON.stringify(body);
      return fetch(`/api${endpoint}`, opts).then((r) => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json();
      });
    },
    []
  );

  const loadPosts = useCallback(async () => {
    const posts = await api("/posts");
    setAllPosts(posts);
  }, [api]);

  const loadProjects = useCallback(async () => {
    const projects = await api("/projects");
    setAllProjects(projects);
  }, [api]);

  const loadCategories = useCallback(async () => {
    const cats = await api("/categories");
    setCategories(cats);
  }, [api]);

  const loadSocials = useCallback(async () => {
    const socials = await api("/socials");
    setAllSocials(socials);
  }, [api]);

  const loadUsers = useCallback(async () => {
    const users = await api("/users");
    setAllUsers(users);
  }, [api]);

  // Posts
  const addPost = useCallback(
    async (post: Omit<Post, "id">) => {
      await api("/posts", "POST", post);
      await loadPosts();
    },
    [api, loadPosts]
  );

  const updatePost = useCallback(
    async (post: Post) => {
      await api(`/posts/${post.id}`, "PUT", post);
      await loadPosts();
    },
    [api, loadPosts]
  );

  const deletePost = useCallback(
    async (id: number) => {
      await api(`/posts/${id}`, "DELETE");
      await loadPosts();
    },
    [api, loadPosts]
  );

  // Projects
  const addProject = useCallback(
    async (project: Omit<Project, "id">) => {
      await api("/projects", "POST", project);
      await loadProjects();
    },
    [api, loadProjects]
  );

  const updateProject = useCallback(
    async (project: Project) => {
      await api(`/projects/${project.id}`, "PUT", project);
      await loadProjects();
    },
    [api, loadProjects]
  );

  const deleteProject = useCallback(
    async (id: number) => {
      await api(`/projects/${id}`, "DELETE");
      await loadProjects();
    },
    [api, loadProjects]
  );

  // Categories
  const addCategory = useCallback(
    async (cat: Omit<Category, "id">) => {
      await api("/categories", "POST", cat);
      await loadCategories();
    },
    [api, loadCategories]
  );

  const updateCategory = useCallback(
    async (cat: Category) => {
      await api(`/categories/${cat.id}`, "PUT", cat);
      await loadCategories();
    },
    [api, loadCategories]
  );

  const deleteCategory = useCallback(
    async (id: number) => {
      await api(`/categories/${id}`, "DELETE");
      await loadCategories();
    },
    [api, loadCategories]
  );

  // Socials
  const addSocial = useCallback(
    async (social: Omit<Social, "id">) => {
      await api("/socials", "POST", social);
      await loadSocials();
    },
    [api, loadSocials]
  );

  const updateSocial = useCallback(
    async (social: Social) => {
      await api(`/socials/${social.id}`, "PUT", social);
      await loadSocials();
    },
    [api, loadSocials]
  );

  const deleteSocial = useCallback(
    async (id: number) => {
      await api(`/socials/${id}`, "DELETE");
      await loadSocials();
    },
    [api, loadSocials]
  );

  // Users
  const addUser = useCallback(
    async (user: Omit<User, "id">) => {
      await api("/users", "POST", user);
      await loadUsers();
    },
    [api, loadUsers]
  );

  const updateUser = useCallback(
    async (user: User) => {
      await api(`/users/${user.id}`, "PUT", user);
      await loadUsers();
    },
    [api, loadUsers]
  );

  const deleteUser = useCallback(
    async (id: number) => {
      await api(`/users/${id}`, "DELETE");
      await loadUsers();
    },
    [api, loadUsers]
  );

  // Upload
  const uploadFile = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/uploads", {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) throw new Error("Upload failed");
    return res.json();
  }, []);

  // Dashboard
  const loadDashboard = useCallback(async () => {
    return api("/dashboard");
  }, [api]);

  // Reset all
  const resetAll = useCallback(async () => {
    await api("/reset", "POST");
    await Promise.all([
      loadPosts(),
      loadProjects(),
      loadCategories(),
      loadSocials(),
      loadUsers(),
    ]);
  }, [api, loadPosts, loadProjects, loadCategories, loadSocials, loadUsers]);

  const value: DataContextType = {
    allPosts,
    allProjects,
    categories,
    allSocials,
    allUsers,
    addPost,
    updatePost,
    deletePost,
    addProject,
    updateProject,
    deleteProject,
    addCategory,
    updateCategory,
    deleteCategory,
    addSocial,
    updateSocial,
    deleteSocial,
    addUser,
    updateUser,
    deleteUser,
    uploadFile,
    loadDashboard,
    resetAll,
  };

  return (
    <DataContext.Provider value={value}>{children}</DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData outside DataProvider");
  return ctx;
}
