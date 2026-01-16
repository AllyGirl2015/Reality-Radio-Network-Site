-- =============================================
-- REALITY RADIO NETWORK - DATABASE SCHEMA
-- Execute este SQL no Supabase SQL Editor
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ARTISTS TABLE
-- =============================================
CREATE TABLE artists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  genre VARCHAR(255) NOT NULL,
  bio TEXT NOT NULL,
  image VARCHAR(500) NOT NULL,
  accent_color VARCHAR(50) DEFAULT 'purple',
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index para buscas por slug
CREATE INDEX idx_artists_slug ON artists(slug);

-- =============================================
-- ALBUMS TABLE
-- =============================================
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  artist_name VARCHAR(255) NOT NULL,
  artist_slug VARCHAR(255) NOT NULL,
  genre VARCHAR(255) NOT NULL,
  year INTEGER NOT NULL,
  duration VARCHAR(50) NOT NULL,
  digital_price DECIMAL(10, 2) NOT NULL,
  physical_price DECIMAL(10, 2) NOT NULL,
  catalog VARCHAR(100) NOT NULL,
  image VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  digital_buy_link VARCHAR(500) NOT NULL,
  physical_buy_link VARCHAR(500) NOT NULL,
  accent_color VARCHAR(50) DEFAULT 'purple',
  featured BOOLEAN DEFAULT false,
  streaming_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes para albums
CREATE INDEX idx_albums_slug ON albums(slug);
CREATE INDEX idx_albums_artist_id ON albums(artist_id);
CREATE INDEX idx_albums_featured ON albums(featured);
CREATE INDEX idx_albums_year ON albums(year DESC);

-- =============================================
-- TRACKS TABLE (para tracklist de albums)
-- =============================================
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  track_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  duration VARCHAR(20) NOT NULL,
  preview_url VARCHAR(500),
  purchase_url VARCHAR(500),
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(album_id, track_number)
);

-- Index para tracks
CREATE INDEX idx_tracks_album_id ON tracks(album_id);

-- =============================================
-- SINGLES TABLE
-- =============================================
CREATE TABLE singles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  artist_name VARCHAR(255) NOT NULL,
  artist_slug VARCHAR(255) NOT NULL,
  album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
  album_title VARCHAR(255),
  album_slug VARCHAR(255),
  genre VARCHAR(255) NOT NULL,
  year INTEGER NOT NULL,
  duration VARCHAR(20) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  catalog VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  buy_link VARCHAR(500) NOT NULL,
  preview_url VARCHAR(500),
  image VARCHAR(500),
  accent_color VARCHAR(50) DEFAULT 'purple',
  featured BOOLEAN DEFAULT false,
  streaming_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes para singles
CREATE INDEX idx_singles_slug ON singles(slug);
CREATE INDEX idx_singles_artist_id ON singles(artist_id);
CREATE INDEX idx_singles_album_id ON singles(album_id);
CREATE INDEX idx_singles_featured ON singles(featured);
CREATE INDEX idx_singles_year ON singles(year DESC);

-- =============================================
-- BLOGS TABLE
-- =============================================
CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  author VARCHAR(255) NOT NULL,
  image VARCHAR(500),
  tags TEXT[] DEFAULT '{}',
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes para blogs
CREATE INDEX idx_blogs_slug ON blogs(slug);
CREATE INDEX idx_blogs_published ON blogs(published);
CREATE INDEX idx_blogs_published_at ON blogs(published_at DESC);

-- =============================================
-- UPDATED_AT TRIGGER FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables
CREATE TRIGGER update_artists_updated_at
  BEFORE UPDATE ON artists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_albums_updated_at
  BEFORE UPDATE ON albums
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracks_updated_at
  BEFORE UPDATE ON tracks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_singles_updated_at
  BEFORE UPDATE ON singles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE singles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Public read access" ON artists FOR SELECT USING (true);
CREATE POLICY "Public read access" ON albums FOR SELECT USING (true);
CREATE POLICY "Public read access" ON tracks FOR SELECT USING (true);
CREATE POLICY "Public read access" ON singles FOR SELECT USING (true);
CREATE POLICY "Public read access for published" ON blogs FOR SELECT USING (published = true);

-- Service role has full access (for admin operations)
CREATE POLICY "Service role full access" ON artists FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON albums FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON tracks FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON singles FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access" ON blogs FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- VIEWS FOR EASIER QUERYING
-- =============================================

-- View de albums com artista
CREATE OR REPLACE VIEW albums_with_artist AS
SELECT 
  a.*,
  ar.name as artist_display_name,
  ar.image as artist_image
FROM albums a
JOIN artists ar ON a.artist_id = ar.id;

-- View de singles com artista e album
CREATE OR REPLACE VIEW singles_with_relations AS
SELECT 
  s.*,
  ar.name as artist_display_name,
  ar.image as artist_image,
  al.title as album_display_title,
  al.image as album_image
FROM singles s
JOIN artists ar ON s.artist_id = ar.id
LEFT JOIN albums al ON s.album_id = al.id;

-- =============================================
-- SEARCH FUNCTION
-- =============================================
CREATE OR REPLACE FUNCTION search_content(search_query TEXT)
RETURNS TABLE (
  type TEXT,
  id UUID,
  slug VARCHAR,
  title VARCHAR,
  artist_name VARCHAR,
  image VARCHAR,
  accent_color VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  -- Search albums
  SELECT 
    'album'::TEXT as type,
    a.id,
    a.slug,
    a.title::VARCHAR,
    a.artist_name::VARCHAR,
    a.image::VARCHAR,
    a.accent_color::VARCHAR
  FROM albums a
  WHERE 
    a.title ILIKE '%' || search_query || '%' OR
    a.artist_name ILIKE '%' || search_query || '%' OR
    a.genre ILIKE '%' || search_query || '%'
  
  UNION ALL
  
  -- Search singles
  SELECT 
    'single'::TEXT as type,
    s.id,
    s.slug,
    s.title::VARCHAR,
    s.artist_name::VARCHAR,
    COALESCE(s.image, '/default-single.png')::VARCHAR,
    s.accent_color::VARCHAR
  FROM singles s
  WHERE 
    s.title ILIKE '%' || search_query || '%' OR
    s.artist_name ILIKE '%' || search_query || '%' OR
    s.genre ILIKE '%' || search_query || '%'
  
  UNION ALL
  
  -- Search artists
  SELECT 
    'artist'::TEXT as type,
    ar.id,
    ar.slug,
    ar.name::VARCHAR,
    ar.genre::VARCHAR,
    ar.image::VARCHAR,
    ar.accent_color::VARCHAR
  FROM artists ar
  WHERE 
    ar.name ILIKE '%' || search_query || '%' OR
    ar.genre ILIKE '%' || search_query || '%' OR
    ar.bio ILIKE '%' || search_query || '%'
  
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;
