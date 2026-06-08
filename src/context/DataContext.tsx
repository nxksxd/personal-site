import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { Project } from "../data/projects";
import type { Post } from "../data/posts";
import type { Social } from "../data/socials";
import { api } from "../lib/api";
import { DataContext } from "./data-context";

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [socials, setSocials] = useState<Social[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const [p, n, s] = await Promise.all([
        api.get<Project[]>("/api/projects"),
        api.get<Post[]>("/api/posts"),
        api.get<Social[]>("/api/socials"),
      ]);
      setProjects(p);
      setPosts(n);
      setSocials(s);
      setError(null);
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
        const [p, n, s] = await Promise.all([
          api.get<Project[]>("/api/projects"),
          api.get<Post[]>("/api/posts"),
          api.get<Social[]>("/api/socials"),
        ]);
        if (!active) return;
        setProjects(p);
        setPosts(n);
        setSocials(s);
        setError(null);
      } catch {
        if (active) setError("Не удалось загрузить данные с сервера");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const addProject = useCallback(async (project: Omit<Project, "id">) => {
    const created = await api.post<Project>("/api/projects", project, true);
    setProjects((prev) => [...prev, created]);
  }, []);

  const updateProject = useCallback(async (project: Project) => {
    const updated = await api.put<Project>(
      `/api/projects/${project.id}`,
      project,
      true
    );
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }, []);

  const deleteProject = useCallback(async (id: number) => {
    await api.del(`/api/projects/${id}`, true);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addPost = useCallback(async (post: Omit<Post, "id">) => {
    const created = await api.post<Post>("/api/posts", post, true);
    setPosts((prev) =>
      [created, ...prev].sort((a, b) => b.date.localeCompare(a.date))
    );
  }, []);

  const updatePost = useCallback(async (post: Post) => {
    const updated = await api.put<Post>(`/api/posts/${post.id}`, post, true);
    setPosts((prev) =>
      prev
        .map((p) => (p.id === updated.id ? updated : p))
        .sort((a, b) => b.date.localeCompare(a.date))
    );
  }, []);

  const deletePost = useCallback(async (id: number) => {
    await api.del(`/api/posts/${id}`, true);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const addSocial = useCallback(async (social: Omit<Social, "id">) => {
    const created = await api.post<Social>("/api/socials", social, true);
    setSocials((prev) => [...prev, created]);
  }, []);

  const updateSocial = useCallback(async (social: Social) => {
    const updated = await api.put<Social>(
      `/api/socials/${social.id}`,
      social,
      true
    );
    setSocials((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  }, []);

  const deleteSocial = useCallback(async (id: number) => {
    await api.del(`/api/socials/${id}`, true);
    setSocials((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const resetAll = useCallback(async () => {
    await api.post("/api/reset", undefined, true);
    await reload();
  }, [reload]);

  return (
    <DataContext.Provider
      value={{
        projects,
        posts,
        socials,
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
        resetAll,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
