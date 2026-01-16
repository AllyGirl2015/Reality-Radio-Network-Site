export interface Database {
  public: {
    Tables: {
      artists: {
        Row: Artist;
        Insert: Omit<Artist, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Artist, 'id'>>;
      };
      albums: {
        Row: Album;
        Insert: Omit<Album, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Album, 'id'>>;
      };
      singles: {
        Row: Single;
        Insert: Omit<Single, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Single, 'id'>>;
      };
      tracks: {
        Row: Track;
        Insert: Omit<Track, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Track, 'id'>>;
      };
      blogs: {
        Row: BlogPost;
        Insert: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<BlogPost, 'id'>>;
      };
    };
  };
}

// === ARTIST ===
export interface Artist {
  id: string;
  slug: string;
  name: string;
  genre: string;
  bio: string;
  image: string;
  accent_color: string;
  social_links?: SocialLinks;
  created_at: string;
  updated_at: string;
}

export interface SocialLinks {
  spotify?: string;
  apple_music?: string;
  youtube?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
}

// === ALBUM ===
export interface Album {
  id: string;
  slug: string;
  title: string;
  artist_id: string;
  artist_name: string;
  artist_slug: string;
  genre: string;
  year: number;
  duration: string;
  digital_price: number;
  physical_price: number;
  catalog: string;
  image: string;
  description: string;
  digital_buy_link: string;
  physical_buy_link: string;
  accent_color: string;
  featured: boolean;
  streaming_links?: StreamingLinks;
  created_at: string;
  updated_at: string;
}

export interface StreamingLinks {
  spotify?: string;
  apple_music?: string;
  youtube_music?: string;
  amazon_music?: string;
}

// === SINGLE ===
export interface Single {
  id: string;
  slug: string;
  title: string;
  artist_id: string;
  artist_name: string;
  artist_slug: string;
  album_id?: string;
  album_title?: string;
  album_slug?: string;
  genre: string;
  year: number;
  duration: string;
  price: number;
  catalog: string;
  description: string;
  buy_link: string;
  preview_url?: string;
  image?: string;
  accent_color: string;
  featured: boolean;
  streaming_links?: StreamingLinks;
  created_at: string;
  updated_at: string;
}

// === TRACK (for album tracklists) ===
export interface Track {
  id: string;
  album_id: string;
  track_number: number;
  title: string;
  duration: string;
  preview_url?: string;
  purchase_url?: string;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

// === BLOG POST ===
export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  image?: string;
  tags: string[];
  published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

// === FORM TYPES FOR ADMIN ===
export interface ArtistFormData {
  slug: string;
  name: string;
  genre: string;
  bio: string;
  image: string;
  accent_color: string;
  social_links?: SocialLinks;
}

export interface AlbumFormData {
  slug: string;
  title: string;
  artist_id: string;
  genre: string;
  year: number;
  duration: string;
  digital_price: number;
  physical_price: number;
  catalog: string;
  image: string;
  description: string;
  digital_buy_link: string;
  physical_buy_link: string;
  accent_color: string;
  featured: boolean;
  streaming_links?: StreamingLinks;
}

export interface SingleFormData {
  slug: string;
  title: string;
  artist_id: string;
  album_id?: string;
  genre: string;
  year: number;
  duration: string;
  price: number;
  catalog: string;
  description: string;
  buy_link: string;
  preview_url?: string;
  image?: string;
  accent_color: string;
  featured: boolean;
  streaming_links?: StreamingLinks;
}

export interface TrackFormData {
  album_id: string;
  track_number: number;
  title: string;
  duration: string;
  preview_url?: string;
  purchase_url?: string;
  featured: boolean;
}

export interface BlogFormData {
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  image?: string;
  tags: string[];
  published: boolean;
  published_at?: string;
}
