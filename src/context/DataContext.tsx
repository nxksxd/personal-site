import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { Project } from "../data/projects";
import type { Post, Category, Upload, DashboardStats } from "../data/posts";
import type { Social } from "../data/socials";
import { api, getToken } from "../lib/api";
import { DataContext } from "./data-context";

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [allPosts, setAllPosts] = useState<Post[]>([]);
  const [socials, setSocials] = useState<Social[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const [p, n, s, c] = await Promise.all([
        api.get<Project[]>("/api/projects"),
        api.get<Post[]>("/api/posts"),
        api.get<Social[]>("/api/socials"),
        api.get<Category[]>("/api/categories"),
      ]);
      setProjects(p);
      setPosts(n);
      setSocials(s);
      setCategories(c);
      setError(null);

      // Load all posts (including drafts) if authenticated
      if (getToken()) {
        try {
          const all = await api.get<Post[]>("/api/posts/all", true);
          setAllPosts(all);
        } catch {
          setAllPosts(n);
        }
      } else {
        setAllPosts(n);
      }
    } catch {
      setError("Не удалось загрузить данные с сервера");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [p, n, s, c] = await Promise.all([
          api.get<Project[]>("/api/projects"),
          api.get<Post[]>("/api/posts"),
          api.get<Social[]>("/api/socials"),
          api.get<Category[]>("/api/categories"),
        ]);
        if (!active) return;
        setProjects(p);
        setPosts(n);
        setSocials(s);
        setCategories(c);
        setError(null);

        if (getToken()) {
          try {
            const all = await api.get<Post[]>("/api/posts/all", true);
            if (active) setAllPosts(all);
          } catch {
            if (active) setAllPosts(n);
          }
        } else {
          setAllPosts(n);
        }
      } catch {
        if (active) setError("Не удалось загрузить данные с сервера");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // --- Projects ---
  const addProject = useCallback(async (project: Omit<Project, "id">) => {
    const created = await api.post<Project>("/api/projects", project, true);
    setProjects((prev) => [...prev, created]);
  }, []);

  const updateProject = useCallback(async (project: Project) => {
    const updated = await api.put<Project>(`/api/projects/${project.id}`, project, true);
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  const deleteProject = useCallback(async (id: number) => {
    await api.del(`/api/projects/${id}`, true);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // --- Posts ---
  const addPost = useCallback(async (post: Omit<Post, "id">) => {
    const created = await api.post<Post>("/api/posts", post, true);
    if (created.status === "published") {
      setPosts((prev) => [created, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
    }
    setAllPosts((prev) => [created, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
  }, []);

  const updatePost = useCallback(async (post: Post) => {
    const updated = await api.put<Post>(`/api/posts/${post.id}`, post, true);
    setPosts((prev) =>
      updated.status === "published"
        ? prev.map((p) => (p.id === updated.id ? updated : p)).filter((p) => p.status === "published").sort((a, b) => b.date.localeCompare(a.date))
        : prev.filter((p) => p.id !== updated.id)
    );
    setAllPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)).sort((a, b) => b.date.localeCompare(a.date)));
  }, []);

  const deletePost = useCallback(async (id: number) => {
    await api.del(`/api/posts/${id}`, true);
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setAllPosts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // --- Socials ---
  const addSocial = useCallback(async (social: Omit<Social, "id">) => {
    const created = await api.post<Social>("/api/socials", social, true);
    setSocials((prev) => [...prev, created]);
  }, []);

  const updateSocial = useCallback(async (social: Social) => {
    const updated = await api.put<Social>(`/api/socials/${social.id}`, social, true);
    setSocials((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }, []);

  const deleteSocial = useCallback(async (id: number) => {
    await api.del(`/api/socials/${id}`, true);
    setSocials((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // --- Categories ---
  const addCategory = useCallback(async (category: Omit<Category, "id">) => {
    const created = await api.post<Category>("/api/categories", category, true);
    setCategories((prev) => [...prev, created]);
  }, []);

  const updateCategory = useCallback(async (category: Category) => {
    const updated = await api.put<Category>(`/api/categories/${category.id}`, category, true);
    setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }, []);

  const deleteCategory = useCallback(async (id: number) => {
    await api.del(`/api/categories/${id}`, true);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // --- Uploads ---
  const uploadFile = useCallback(async (file: File): Promise<Upload> => {
    const formData = new FormData();
    formData.append("file", file);

    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const API_BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ?? "http://localhost:8000";
    const res = await fetch(`${API_BASE}/api/uploads`, {
      method: "POST",
      headers,
      body: formData,
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Upload failed");
    }
    const upload = await res.json() as Upload;
    setUploads((prev) => [upload, ...prev]);
    return upload;
  }, []);

  const loadUploads = useCallback(async () => {
    try {
      const list = await api.get<Upload[]>("/api/uploads", true);
      setUploads(list);
    } catch { /* not authorized */ }
  }, []);

  const deleteUpload = useCallback(async (id: number) => {
    await api.del(`/api/uploads/${id}`, true);
    setUploads((prev) => prev.filter((u) => u.id !== id));
  }, []);

  // --- Dashboard ---
  const loadDashboard = useCallback(async (): Promise<DashboardStats> => {
    return api.get<DashboardStats>("/api/dashboard/stats", true);
  }, []);

  // --- Reset ---
  const resetAll = useCallback(async () => {
    await api.post("/api/reset", undefined, true);
    await reload();
  }, [reload]);

  return (
    <DataContext.Provider
      value={{
        projects,
        posts,
        allPosts,
        socials,
        categories,
        loading,
        error,
        reload,
        addProject,
        updateProject,
        deleteProject,
        addPost,
        updatePost,
        deletePost,
        addSocial,
        updateSocial,
        deleteSocial,
        addCategory,
        updateCategory,
        deleteCategory,
        uploadFile,
        uploads,
        loadUploads,
        deleteUpload,
        loadDashboard,
        resetAll,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
