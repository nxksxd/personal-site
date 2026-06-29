export interface Post {
  id: number;
  date: string;
  title: string;
  content: string;
  image?: string;
  comment?: string;
  tags?: string[];
}
