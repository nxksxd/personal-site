export interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  link: string;
  github?: string;
  image?: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: "FinAI",
    description:
      "iOS-приложение для управления личными финансами с AI-аналитикой расходов и автоматическим импортом банковских выписок.",
    tags: ["Swift", "SwiftUI", "SwiftData", "AI"],
    link: "https://github.com/nxksxd/app_finai_nxksxd",
    github: "https://github.com/nxksxd/app_finai_nxksxd",
  },
  {
    id: 2,
    title: "MTProxyMax",
    description:
      "Форк MTProxy с полной интернационализацией интерфейса (English/Русский) и расширенной конфигурацией.",
    tags: ["Python", "Telegram", "Proxy", "i18n"],
    link: "https://github.com/nxksxd/MTProxyMax",
    github: "https://github.com/nxksxd/MTProxyMax",
  },
  {
    id: 3,
    title: "Personal Blog",
    description:
      "Этот сайт — персональный блог и визитка, собранный на React + TypeScript с поддержкой тёмной и светлой тем.",
    tags: ["React", "TypeScript", "CSS"],
    link: "#",
  },
];

export default projects;
