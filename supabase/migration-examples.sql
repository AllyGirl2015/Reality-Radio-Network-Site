-- =============================================
-- SCRIPT DE MIGRAÇÃO: JSON para Supabase
-- Execute após popular os dados do JSON para Supabase
-- =============================================

-- Este script ajuda a migrar os dados dos arquivos JSON
-- para o banco de dados Supabase. Execute manualmente no 
-- SQL Editor do Supabase após inserir os dados.

-- Exemplo de INSERT para um artista:
/*
INSERT INTO artists (slug, name, genre, bio, image, accent_color)
VALUES (
  'johnathan-gold',
  'Johnathan Gold & Guilded Hearts',
  'Country / Americana',
  'Johnathan Gold brings heartland truths with raw emotion, balancing modern country roots and bold lyrical honesty.',
  '/Johnathan Gold.png',
  'purple'
);
*/

-- Exemplo de INSERT para um álbum:
/*
INSERT INTO albums (
  slug, title, artist_id, artist_name, artist_slug, genre, year, duration,
  digital_price, physical_price, catalog, image, description,
  digital_buy_link, physical_buy_link, accent_color, featured
)
VALUES (
  'americas-changed',
  'America''s Changed',
  (SELECT id FROM artists WHERE slug = 'johnathan-gold'),
  'Johnathan Gold & Guilded Hearts',
  'johnathan-gold',
  'Country / Americana',
  2025,
  '38:42',
  8.99,
  14.99,
  'RRN-JG-AC',
  '/America''s Changed.png',
  'America''s Changed is a powerful reflection on transformation and truth.',
  'https://square.link/u/8vYPUPDl',
  'https://square.link/u/NB6AhAuq',
  'purple',
  true
);
*/

-- Exemplo de INSERT para uma track:
/*
INSERT INTO tracks (album_id, track_number, title, duration, preview_url, purchase_url, featured)
VALUES (
  (SELECT id FROM albums WHERE slug = 'americas-changed'),
  1,
  'America''s Changed',
  '3:42',
  'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/America''s%20Changed/01%20America''s%20Changed.mp3',
  'https://square.link/u/cY1R9Yas',
  true
);
*/

-- Exemplo de INSERT para um single:
/*
INSERT INTO singles (
  slug, title, artist_id, artist_name, artist_slug, album_id, album_title, album_slug,
  genre, year, duration, price, catalog, description, buy_link, preview_url, accent_color, featured
)
VALUES (
  'americas-changed',
  'America''s Changed',
  (SELECT id FROM artists WHERE slug = 'johnathan-gold'),
  'Johnathan Gold & Guilded Hearts',
  'johnathan-gold',
  (SELECT id FROM albums WHERE slug = 'americas-changed'),
  'America''s Changed',
  'americas-changed',
  'Country',
  2025,
  '3:42',
  0.99,
  'RRN-JG-AC-01',
  'Title track from the America''s Changed album',
  'https://square.link/u/cLvZVxhh',
  'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/America''s%20Changed/01%20America''s%20Changed.mp3',
  'purple',
  true
);
*/
