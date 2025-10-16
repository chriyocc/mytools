export interface Project {
  id?: number;
  slug: string;
  title: string;
  date: string;
  description: string;
  markdown_content?: string;
  image: string;
  tool_icon1: string;
  tool_icon2?: string;
  created_at?: string;
  updated_at?: string;
}
