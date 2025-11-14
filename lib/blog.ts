import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const contentDirectory = path.join(process.cwd(), 'content/blog');

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  featuredImage: string;
  excerpt?: string;
  tags?: string[];
  author: string;
  published: boolean;
  content: string;
}

export function getAllPosts(): BlogPost[] {
  // Verifica se o diretório existe
  if (!fs.existsSync(contentDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(contentDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(contentDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title,
        date: data.date,
        featuredImage: data.featuredImage,
        excerpt: data.excerpt || '',
        tags: data.tags || [],
        author: data.author || 'Reality Radio Network',
        published: data.published ?? true,
        content,
      } as BlogPost;
    })
    .filter((post) => post.published)
    .sort((a, b) => {
      if (new Date(a.date) < new Date(b.date)) {
        return 1;
      } else {
        return -1;
      }
    });

  return allPostsData;
}

export function getPostBySlug(slug: string): BlogPost | null {
  try {
    const fullPath = path.join(contentDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug,
      title: data.title,
      date: data.date,
      featuredImage: data.featuredImage,
      excerpt: data.excerpt || '',
      tags: data.tags || [],
      author: data.author || 'Reality Radio Network',
      published: data.published ?? true,
      content,
    } as BlogPost;
  } catch {
    return null;
  }
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(contentDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(contentDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => fileName.replace(/\.md$/, ''));
}
