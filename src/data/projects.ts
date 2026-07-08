import type { SocialLink } from "../lib/socialIcons";

export type { SocialLink };

export interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  link: string;
  github?: string;
  links?: SocialLink[];
  image?: string;
  post_count?: number;
}
