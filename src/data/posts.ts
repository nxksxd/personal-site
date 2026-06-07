export interface Post {
  id: number;
  date: string;
  title: string;
  content: string;
  image?: string;
  comment?: string;
  tags?: string[];
}

const posts: Post[] = [
  {
    id: 1,
    date: "2026-06-07",
    title: "Запуск личного сайта",
    content:
      "Наконец-то собрал свой персональный сайт! Здесь буду делиться новостями о проектах, мыслями и полезными ссылками. Сайт поддерживает тёмную и светлую тему — переключайте в шапке.",
    image: "/images/placeholder-launch.svg",
    comment:
      "Давно хотел сделать что-то подобное. Теперь есть единое место для всех обновлений.",
    tags: ["анонс", "сайт"],
  },
  {
    id: 2,
    date: "2026-06-05",
    title: "FinAI v1.8 — новый импорт с дедупликацией",
    content:
      "Выпустил обновление FinAI с секцией «Дубликаты» при импорте выписок. Теперь можно включать и выключать проверку на дубли, а MerchantClassifier стал точнее распознавать категории.",
    image: "/images/placeholder-finai.svg",
    comment:
      "Импорт был одной из самых сложных фич. Рад, что удалось реализовать красиво.",
    tags: ["FinAI", "релиз"],
  },
  {
    id: 3,
    date: "2026-06-01",
    title: "MTProxyMax — полная интернационализация",
    content:
      "Добавил полный перевод интерфейса MTProxyMax на русский и английский языки. Теперь при первом запуске можно выбрать язык.",
    image: "/images/placeholder-proxy.svg",
    tags: ["MTProxyMax", "i18n"],
  },
];

export default posts;
