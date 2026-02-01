// Database layer - Currently using JSON files, can be migrated to Supabase
import fs from 'fs';
import path from 'path';

// Re-export admin form types from central types so services can import from lib/database
export type { ArtistFormData, AlbumFormData, SingleFormData, TrackFormData, BlogFormData } from '@/types/database';

// Types
export interface Album {
  id: string;
  slug: string;
  title: string;
  artist: string;
  artistSlug: string;
  genre: string;
  year: number;
  duration: string;
  digitalPrice: number;
  physicalPrice: number;
  catalog: string;
  image: string;
  description: string;
  digitalBuyLink: string;
  physicalBuyLink: string;
  accentColor: 'purple' | 'pink' | 'red' | 'indigo';
  featured: boolean;
  tracklist: Track[];
  createdAt: string;
  updatedAt: string;
}

export interface Track {
  number: number;
  title: string;
  duration: string;
  featured?: boolean;
  previewUrl?: string;
  purchaseUrl?: string;
}

export interface Single {
  id: string;
  slug: string;
  title: string;
  artist: string;
  artistSlug: string;
  album?: string;
  albumSlug?: string;
  genre: string;
  year: number;
  duration: string;
  price: number;
  catalog: string;
  description: string;
  quote?: string;
  buyLink: string;
  image?: string;
  previewUrl?: string;
  youtubeId?: string;
  accentColor: 'purple' | 'pink' | 'red' | 'indigo';
  featured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  image?: string;
  featured: boolean;
  published: boolean;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Artist {
  id: string;
  slug: string;
  name: string;
  genre: string;
  bio: string;
  image: string;
  accentColor: 'purple' | 'pink' | 'red' | 'indigo';
  createdAt: string;
  updatedAt: string;
}

// Database paths
const DATA_DIR = path.join(process.cwd(), 'data');
const ALBUMS_FILE = path.join(DATA_DIR, 'albums.json');
const SINGLES_FILE = path.join(DATA_DIR, 'singles.json');
const BLOGS_FILE = path.join(DATA_DIR, 'blogs.json');
const ARTISTS_FILE = path.join(DATA_DIR, 'artists.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Generic read/write functions
function readJsonFile<T>(filePath: string): T[] {
  ensureDataDir();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, '[]', 'utf-8');
    return [];
  }
  const data = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(data);
}

function writeJsonFile<T>(filePath: string, data: T[]): void {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// Helper to generate slug
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Helper to generate ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ============ ALBUMS ============
export function getAllAlbums(): Album[] {
  return readJsonFile<Album>(ALBUMS_FILE);
}

export function getAlbumBySlug(slug: string): Album | undefined {
  const albums = getAllAlbums();
  return albums.find(album => album.slug === slug);
}

export function getAlbumById(id: string): Album | undefined {
  const albums = getAllAlbums();
  return albums.find(album => album.id === id);
}

export function getFeaturedAlbums(): Album[] {
  const albums = getAllAlbums();
  return albums.filter(album => album.featured);
}

export function createAlbum(album: Omit<Album, 'id' | 'slug' | 'createdAt' | 'updatedAt'>): Album {
  const albums = getAllAlbums();
  const newAlbum: Album = {
    ...album,
    id: generateId(),
    slug: generateSlug(album.title),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  albums.push(newAlbum);
  writeJsonFile(ALBUMS_FILE, albums);
  return newAlbum;
}

export function updateAlbum(id: string, updates: Partial<Album>): Album | null {
  const albums = getAllAlbums();
  const index = albums.findIndex(album => album.id === id);
  if (index === -1) return null;
  
  albums[index] = {
    ...albums[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  // Update slug if title changed
  if (updates.title) {
    albums[index].slug = generateSlug(updates.title);
  }
  
  writeJsonFile(ALBUMS_FILE, albums);
  return albums[index];
}

export function deleteAlbum(id: string): boolean {
  const albums = getAllAlbums();
  const index = albums.findIndex(album => album.id === id);
  if (index === -1) return false;
  
  albums.splice(index, 1);
  writeJsonFile(ALBUMS_FILE, albums);
  return true;
}

// ============ SINGLES ============
export function getAllSingles(): Single[] {
  return readJsonFile<Single>(SINGLES_FILE);
}

export function getSingleBySlug(slug: string): Single | undefined {
  const singles = getAllSingles();
  return singles.find(single => single.slug === slug);
}

export function getSingleById(id: string): Single | undefined {
  const singles = getAllSingles();
  return singles.find(single => single.id === id);
}

export function getFeaturedSingles(): Single[] {
  const singles = getAllSingles();
  return singles.filter(single => single.featured);
}

export function createSingle(single: Omit<Single, 'id' | 'slug' | 'createdAt' | 'updatedAt'>): Single {
  const singles = getAllSingles();
  const newSingle: Single = {
    ...single,
    id: generateId(),
    slug: generateSlug(single.title),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  singles.push(newSingle);
  writeJsonFile(SINGLES_FILE, singles);
  return newSingle;
}

export function updateSingle(id: string, updates: Partial<Single>): Single | null {
  const singles = getAllSingles();
  const index = singles.findIndex(single => single.id === id);
  if (index === -1) return null;
  
  singles[index] = {
    ...singles[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  if (updates.title) {
    singles[index].slug = generateSlug(updates.title);
  }
  
  writeJsonFile(SINGLES_FILE, singles);
  return singles[index];
}

export function deleteSingle(id: string): boolean {
  const singles = getAllSingles();
  const index = singles.findIndex(single => single.id === id);
  if (index === -1) return false;
  
  singles.splice(index, 1);
  writeJsonFile(SINGLES_FILE, singles);
  return true;
}

// ============ BLOG POSTS ============
export function getAllBlogPosts(): BlogPost[] {
  return readJsonFile<BlogPost>(BLOGS_FILE);
}

export function getPublishedBlogPosts(): BlogPost[] {
  const posts = getAllBlogPosts();
  return posts.filter(post => post.published).sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  const posts = getAllBlogPosts();
  return posts.find(post => post.slug === slug);
}

export function getBlogPostById(id: string): BlogPost | undefined {
  const posts = getAllBlogPosts();
  return posts.find(post => post.id === id);
}

export function createBlogPost(post: Omit<BlogPost, 'id' | 'slug' | 'createdAt' | 'updatedAt'>): BlogPost {
  const posts = getAllBlogPosts();
  const newPost: BlogPost = {
    ...post,
    id: generateId(),
    slug: generateSlug(post.title),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  posts.push(newPost);
  writeJsonFile(BLOGS_FILE, posts);
  return newPost;
}

export function updateBlogPost(id: string, updates: Partial<BlogPost>): BlogPost | null {
  const posts = getAllBlogPosts();
  const index = posts.findIndex(post => post.id === id);
  if (index === -1) return null;
  
  posts[index] = {
    ...posts[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  if (updates.title) {
    posts[index].slug = generateSlug(updates.title);
  }
  
  writeJsonFile(BLOGS_FILE, posts);
  return posts[index];
}

export function deleteBlogPost(id: string): boolean {
  const posts = getAllBlogPosts();
  const index = posts.findIndex(post => post.id === id);
  if (index === -1) return false;
  
  posts.splice(index, 1);
  writeJsonFile(BLOGS_FILE, posts);
  return true;
}

// ============ ARTISTS ============
export function getAllArtists(): Artist[] {
  return readJsonFile<Artist>(ARTISTS_FILE);
}

export function getArtistBySlug(slug: string): Artist | undefined {
  const artists = getAllArtists();
  return artists.find(artist => artist.slug === slug);
}

export function getArtistById(id: string): Artist | undefined {
  const artists = getAllArtists();
  return artists.find(artist => artist.id === id);
}

// ============ SEARCH DATA ============
export interface SearchItem {
  type: 'album' | 'single' | 'artist' | 'blog';
  title: string;
  slug: string;
  artist?: string;
  href: string;
}

export function getSearchData(): SearchItem[] {
  const albums = getAllAlbums();
  const singles = getAllSingles();
  const artists = getAllArtists();
  const blogs = getPublishedBlogPosts();
  
  const searchData: SearchItem[] = [];
  
  // Add albums
  albums.forEach(album => {
    searchData.push({
      type: 'album',
      title: album.title,
      slug: album.slug,
      artist: album.artist,
      href: `/store/albums/${album.slug}`,
    });
  });
  
  // Add singles
  singles.forEach(single => {
    searchData.push({
      type: 'single',
      title: single.title,
      slug: single.slug,
      artist: single.artist,
      href: `/store/singles/${single.slug}`,
    });
  });
  
  // Add artists
  artists.forEach(artist => {
    searchData.push({
      type: 'artist',
      title: artist.name,
      slug: artist.slug,
      href: `/talent/${artist.slug}`,
    });
  });
  
  // Add blogs
  blogs.forEach(blog => {
    searchData.push({
      type: 'blog',
      title: blog.title,
      slug: blog.slug,
      href: `/blog/${blog.slug}`,
    });
  });
  
  return searchData;
}
