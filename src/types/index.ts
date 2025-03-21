export interface BlogPost {
  id: string;
  theme: string;
  selectedTitle: string;
  titleOptions: string[];
  outline: OutlineItem[];
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface OutlineItem {
  id: string;
  title: string;
  level: number;
  children?: OutlineItem[];
}

export type GenerationStep = 'theme' | 'titles' | 'outline' | 'content';