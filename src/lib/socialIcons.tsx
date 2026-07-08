import type { ReactNode } from "react";
import {
  GitHubIcon,
  TelegramIcon,
  EmailIcon,
  VKIcon,
  YouTubeIcon,
  InstagramIcon,
  XIcon,
  LinkedInIcon,
  DiscordIcon,
  WebsiteIcon,
  ExternalLinkIcon,
} from "../components/Icons";

/** A single social/external link attached to a post, project, or profile. */
export interface SocialLink {
  label: string;
  url: string;
  icon: string;
}

/** Canonical list of supported platforms — drives the icon dropdown everywhere. */
export const SOCIAL_PLATFORMS: { value: string; label: string }[] = [
  { value: "github", label: "GitHub" },
  { value: "telegram", label: "Telegram" },
  { value: "email", label: "Email" },
  { value: "vk", label: "VK" },
  { value: "youtube", label: "YouTube" },
  { value: "instagram", label: "Instagram" },
  { value: "x", label: "X (Twitter)" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "discord", label: "Discord" },
  { value: "website", label: "Сайт" },
  { value: "link", label: "Другая ссылка" },
];

const ICON_MAP: Record<string, (size: number) => ReactNode> = {
  github: (s) => <GitHubIcon size={s} />,
  telegram: (s) => <TelegramIcon size={s} />,
  email: (s) => <EmailIcon size={s} />,
  vk: (s) => <VKIcon size={s} />,
  youtube: (s) => <YouTubeIcon size={s} />,
  instagram: (s) => <InstagramIcon size={s} />,
  x: (s) => <XIcon size={s} />,
  linkedin: (s) => <LinkedInIcon size={s} />,
  discord: (s) => <DiscordIcon size={s} />,
  website: (s) => <WebsiteIcon size={s} />,
  link: (s) => <ExternalLinkIcon size={s} />,
};

/** Render the icon for a platform key, falling back to a generic link icon. */
export function SocialIcon({ icon, size = 20 }: { icon: string; size?: number }) {
  const render = ICON_MAP[icon] ?? ICON_MAP.link;
  return <>{render(size)}</>;
}

/** Human-readable label for a platform key (for tooltips/aria). */
export function platformLabel(icon: string): string {
  return SOCIAL_PLATFORMS.find((p) => p.value === icon)?.label ?? "Ссылка";
}
