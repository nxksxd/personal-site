export interface Social {
  id: number;
  name: string;
  url: string;
  icon: string;
}

const socials: Social[] = [
  {
    id: 1,
    name: "GitHub",
    url: "https://github.com/nxksxd",
    icon: "github",
  },
  {
    id: 2,
    name: "Telegram",
    url: "https://t.me/nxksxd",
    icon: "telegram",
  },
  {
    id: 3,
    name: "Email",
    url: "mailto:12455nikita.nd@gmail.com",
    icon: "email",
  },
];

export default socials;
