export interface Project {
  id?: string;
  slug: string;
  title: string;
  date: string;
  description: string;
  markdown_file: string;
  markdown_content: string;
  image_file: string;
  image: string;
  tool_icon1: string;
  tool_icon2?: string;
  created_at?: string;
  updated_at?: string;
}
