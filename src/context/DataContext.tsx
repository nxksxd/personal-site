import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import defaultProjects, { type Project } from "../data/projects";
import defaultPosts, { type Post } from "../data/posts";
import defaultSocials, { type Social } from "../data/socials";

interface DataContextType {
  projects: Project[];
  posts: Post[];
  socials: Social[];
  setProjects: (projects: Project[]) => void;
  setPosts: (posts: Post[]) => void;
  setSocials: (socials: Social[]) => void;
  addProject: (project: Omit<Project, "id">) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: number) => void;
  addPost: (post: Omit<Post, "id">) => void;
  updatePost: (post: Post) => void;
  deletePost: (id: number) => void;
  addSocial: (social: Omit<Social, "id">) => void;
  updateSocial: (social: Social) => void;
  deleteSocial: (id: number) => void;
  resetAll: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch {
    /* ignore */
  }
  return fallback;
}

function saveToStorage<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, _setProjects] = useState<Project[]>(() =>
    loadFromStorage("site_projects", defaultProjects)
  );
  const [posts, _setPosts] = useState<Post[]>(() =>
    loadFromStorage("site_posts", defaultPosts)
  );
  const [socials, _setSocials] = useState<Social[]>(() =>
    loadFromStorage("site_socials", defaultSocials)
  );

  const setProjects = useCallback((p: Project[]) => {
    _setProjects(p);
    saveToStorage("site_projects", p);
  }, []);

  const setPosts = useCallback((p: Post[]) => {
    _setPosts(p);
    saveToStorage("site_posts", p);
  }, []);

  const setSocials = useCallback((s: Social[]) => {
    _setSocials(s);
    saveToStorage("site_socials", s);
  }, []);

  const addProject = useCallback(
    (project: Omit<Project, "id">) => {
      const maxId = projects.reduce((m, p) => Math.max(m, p.id), 0);
      const updated = [...projects, { ...project, id: maxId + 1 }];
      setProjects(updated);
    },
    [projects, setProjects]
  );

  const updateProject = useCallback(
    (project: Project) => {
      setProjects(projects.map((p) => (p.id === project.id ? project : p)));
    },
    [projects, setProjects]
  );

  const deleteProject = useCallback(
    (id: number) => {
      setProjects(projects.filter((p) => p.id !== id));
    },
    [projects, setProjects]
  );

  const addPost = useCallback(
    (post: Omit<Post, "id">) => {
      const maxId = posts.reduce((m, p) => Math.max(m, p.id), 0);
      const updated = [{ ...post, id: maxId + 1 }, ...posts];
      setPosts(updated);
    },
    [posts, setPosts]
  );

  const updatePost = useCallback(
    (post: Post) => {
      setPosts(posts.map((p) => (p.id === post.id ? post : p)));
    },
    [posts, setPosts]
  );

  const deletePost = useCallback(
    (id: number) => {
      setPosts(posts.filter((p) => p.id !== id));
    },
    [posts, setPosts]
  );

  const addSocial = useCallback(
    (social: Omit<Social, "id">) => {
      const maxId = socials.reduce((m, s) => Math.max(m, s.id), 0);
      setSocials([...socials, { ...social, id: maxId + 1 }]);
    },
    [socials, setSocials]
  );

  const updateSocial = useCallback(
    (social: Social) => {
      setSocials(socials.map((s) => (s.id === social.id ? social : s)));
    },
    [socials, setSocials]
  );

  const deleteSocial = useCallback(
    (id: number) => {
      setSocials(socials.filter((s) => s.id !== id));
    },
    [socials, setSocials]
  );

  const resetAll = useCallback(() => {
    setProjects(defaultProjects);
    setPosts(defaultPosts);
    setSocials(defaultSocials);
  }, [setProjects, setPosts, setSocials]);

  return (
    <DataContext.Provider
      value={{
        projects,
        posts,
        socials,
        setProjects,
        setPosts,
        setSocials,
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

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be inside DataProvider");
  return ctx;
}
