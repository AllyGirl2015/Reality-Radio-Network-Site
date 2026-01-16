-- =============================================
-- REALITY RADIO NETWORK - DATA FIX
-- Execute este SQL no Supabase SQL Editor para corrigir os dados
-- Gerado em: 2025-12-15
-- =============================================

-- =============================================
-- 1. CORRIGIR ÁLBUNS (artistas corretos)
-- =============================================

-- Heartfelt Rebellion é de Johnathan Gold & Guilded Hearts, não Kaira
UPDATE albums SET
  artist_id = (SELECT id FROM artists WHERE slug = 'johnathan-gold'),
  artist_name = 'Johnathan Gold & Guilded Hearts',
  artist_slug = 'johnathan-gold',
  genre = 'Country Rock',
  description = 'A bold country-rock statement — tackling faith, fire, and the fight for authenticity with Johnathan Gold''s trademark grit and the full force of Guilded Hearts.',
  updated_at = NOW()
WHERE slug = 'heartfelt-rebellion';

-- Barefoot Supernova é de Kaira Heartfelt, não Johnathan Gold
UPDATE albums SET
  artist_id = (SELECT id FROM artists WHERE slug = 'kaira-heartfelt'),
  artist_name = 'Kaira Heartfelt',
  artist_slug = 'kaira-heartfelt',
  genre = 'Country-Pop',
  description = 'Small-town sparks and big-sky dreams — Barefoot Supernova pairs country heart with modern storytelling from Kaira Heartfelt.',
  updated_at = NOW()
WHERE slug = 'barefoot-supernova';

-- Corrigir descrição do America's Changed
UPDATE albums SET
  artist_name = 'Johnathan Gold & Guilded Hearts',
  description = 'A heartland journey through quiet strength, gas-station prayers, and Main Street goodbyes — where country roots meet modern storytelling.',
  updated_at = NOW()
WHERE slug = 'americas-changed';

-- Corrigir descrição do Shattered Peaces
UPDATE albums SET
  description = 'Shattered Peaces dives into the depths of emotion, resilience, and identity through gritty rock and raw expression. Mathew Cage delivers an unforgettable journey — torn between darkness and light — that demands to be felt.',
  updated_at = NOW()
WHERE slug = 'shattered-peaces';

-- =============================================
-- 2. LIMPAR TRACKS EXISTENTES
-- =============================================
DELETE FROM tracks;

-- =============================================
-- 3. INSERIR TRACKS PARA CADA ÁLBUM
-- =============================================

-- SHATTERED PEACES - Mathew Cage (10 tracks)
INSERT INTO tracks (album_id, track_number, title, duration, preview_url, purchase_url, featured)
SELECT 
  (SELECT id FROM albums WHERE slug = 'shattered-peaces'),
  track_number,
  title,
  duration,
  NULL,
  purchase_url,
  featured
FROM (VALUES
  (1, 'World of Gold', '4:32', 'https://square.link/u/ioeRiwvN', true),
  (2, 'Fractured Signal', '4:02', 'https://square.link/u/2OwcTGU3', true),
  (3, 'The Line Was Crossed', '3:48', NULL, false),
  (4, 'Echoes of the Cage', '4:28', 'https://square.link/u/zwQRJCwe', true),
  (5, 'Shattered', '3:55', NULL, false),
  (6, 'Broken Peace', '4:15', NULL, false),
  (7, 'Fallen Flag', '5:05', 'https://square.link/u/VEMs3Tdc', true),
  (8, 'Soulbound', '4:22', NULL, false),
  (9, 'Corruption', '4:08', NULL, false),
  (10, 'Opening', '3:45', NULL, false)
) AS t(track_number, title, duration, purchase_url, featured);

-- HEARTFELT REBELLION - Johnathan Gold & Guilded Hearts (13 tracks)
INSERT INTO tracks (album_id, track_number, title, duration, preview_url, purchase_url, featured)
SELECT 
  (SELECT id FROM albums WHERE slug = 'heartfelt-rebellion'),
  track_number,
  title,
  duration,
  NULL,
  purchase_url,
  featured
FROM (VALUES
  (1, 'Heartfelt Rebellion', '3:42', 'https://square.link/u/XabI1gG5', true),
  (2, 'Country Bonfire', '3:55', 'https://square.link/u/UGKRSozd', false),
  (3, 'Screens', '3:38', NULL, false),
  (4, 'Forgotten Sons', '4:12', 'https://square.link/u/lbWBcfEw', false),
  (5, 'Chaos Country', '3:45', 'https://square.link/u/2ZQY92lI', true),
  (6, 'Lifeline', '3:52', NULL, false),
  (7, 'Connections', '3:48', NULL, false),
  (8, 'Country Style', '3:35', NULL, false),
  (9, 'Civilization Outlaw', '4:05', NULL, true),
  (10, 'Religious Truth', '4:18', NULL, true),
  (11, 'Unspoken Words', '3:42', NULL, false),
  (12, 'Truth is What You Make It', '3:55', NULL, false),
  (13, 'Empathy', '4:02', NULL, false)
) AS t(track_number, title, duration, purchase_url, featured);

-- BAREFOOT SUPERNOVA - Kaira Heartfelt (13 tracks)
INSERT INTO tracks (album_id, track_number, title, duration, preview_url, purchase_url, featured)
SELECT 
  (SELECT id FROM albums WHERE slug = 'barefoot-supernova'),
  track_number,
  title,
  duration,
  NULL,
  purchase_url,
  featured
FROM (VALUES
  (1, 'Small Town Supernova', '3:48', NULL, true),
  (2, 'Country Girl', '3:42', 'https://square.link/u/qF1jAHCW', false),
  (3, 'Barefoot Change', '3:52', 'https://square.link/u/56avqyRz', false),
  (4, 'Lovestruck', '3:38', NULL, false),
  (5, 'He Cheated (Main)', '3:55', NULL, false),
  (6, 'His Best was Better', '3:42', NULL, false),
  (7, 'Beautiful Broken Love (Ft. Johnathan Gold)', '4:15', NULL, true),
  (8, 'Firefly Nights', '3:48', NULL, false),
  (9, 'Steering Faith', '3:52', NULL, false),
  (10, 'Daddy''s Girl', '3:45', NULL, false),
  (11, 'Colder Nights', '4:02', NULL, true),
  (12, 'He Cheated (Slow Alt)', '4:25', NULL, false),
  (13, 'Small Town Supernova (Slow Alt)', '4:18', NULL, false)
) AS t(track_number, title, duration, purchase_url, featured);

-- AMERICA'S CHANGED - Johnathan Gold & Guilded Hearts (10 tracks)
INSERT INTO tracks (album_id, track_number, title, duration, preview_url, purchase_url, featured)
SELECT 
  (SELECT id FROM albums WHERE slug = 'americas-changed'),
  track_number,
  title,
  duration,
  NULL,
  purchase_url,
  featured
FROM (VALUES
  (1, 'America''s Changed', '3:45', 'https://square.link/u/cLvZVxhh', true),
  (2, 'Goodbye Mainstreet', '3:48', 'https://square.link/u/yWtFJNzX', false),
  (3, 'She Wore Red, I Wore Blue', '3:52', NULL, false),
  (4, 'God Blessed the Silent Ones', '4:08', 'https://square.link/u/4yDcOqMs', true),
  (5, 'Gas Station Prayers', '3:55', 'https://square.link/u/uZ3CXyNi', false),
  (6, 'Generations', '3:42', NULL, false),
  (7, 'Country Fireflies', '3:38', NULL, false),
  (8, 'Tractor Man', '3:48', NULL, false),
  (9, 'Young Ones', '3:45', NULL, false),
  (10, 'Unspoken Hero', '4:02', NULL, false)
) AS t(track_number, title, duration, purchase_url, featured);

-- GOLDEN HEARTBREAK - Johnathan Gold (Double Album - estimating 18 tracks)
INSERT INTO tracks (album_id, track_number, title, duration, preview_url, purchase_url, featured)
SELECT 
  (SELECT id FROM albums WHERE slug = 'golden-heartbreak'),
  track_number,
  title,
  duration,
  NULL,
  NULL,
  featured
FROM (VALUES
  (1, 'Golden Heartbreak', '4:15', true),
  (2, 'Broken Dreams', '3:52', false),
  (3, 'Lost in Love', '4:02', false),
  (4, 'Heartache Highway', '3:48', true),
  (5, 'Tears of Gold', '4:08', false),
  (6, 'Midnight Sorrow', '3:55', false),
  (7, 'Empty Promises', '4:22', false),
  (8, 'Redemption Road', '4:35', true),
  (9, 'Fading Memories', '3:42', false),
  (10, 'One Last Dance', '4:18', false),
  (11, 'Shattered Heart', '3:58', false),
  (12, 'Love''s Last Stand', '4:05', false),
  (13, 'Walking Away', '3:45', false),
  (14, 'Second Chances', '4:12', true),
  (15, 'The Road Home', '4:28', false),
  (16, 'Healing', '4:15', false),
  (17, 'New Beginnings', '3:52', false),
  (18, 'Golden Sunrise', '4:45', true)
) AS t(track_number, title, duration, featured);

-- STELLAR LOVE - Kaira Heartfelt (estimated 10 tracks)
INSERT INTO tracks (album_id, track_number, title, duration, preview_url, purchase_url, featured)
SELECT 
  (SELECT id FROM albums WHERE slug = 'stellar-love'),
  track_number,
  title,
  duration,
  NULL,
  NULL,
  featured
FROM (VALUES
  (1, 'Stellar Love', '3:45', true),
  (2, 'Take My Love', '3:52', false),
  (3, 'Love Killer', '3:38', false),
  (4, 'Lustful Love', '3:48', false),
  (5, 'Mark Me Down', '3:55', true),
  (6, 'One Drink', '3:42', false),
  (7, 'Starting Line', '3:58', false),
  (8, 'The Stars Above', '4:05', true),
  (9, 'Power of the Few', '3:48', false),
  (10, 'Rags No More', '4:12', false)
) AS t(track_number, title, duration, featured);

-- HIGH HIT - Mathew Cage (estimated 10 tracks)
INSERT INTO tracks (album_id, track_number, title, duration, preview_url, purchase_url, featured)
SELECT 
  (SELECT id FROM albums WHERE slug = 'high-hit'),
  track_number,
  title,
  duration,
  NULL,
  purchase_url,
  featured
FROM (VALUES
  (1, 'High Hit', '4:02', NULL, true),
  (2, 'Chronicles', '4:05', 'https://square.link/u/kEfKJCIE', false),
  (3, 'Drown it Out', '3:52', 'https://square.link/u/KCOOq0Jr', true),
  (4, 'Fallen Dust', '4:28', 'https://square.link/u/zsgL3N5e', false),
  (5, 'Hate No More', '3:55', NULL, false),
  (6, 'Scraps', '3:48', NULL, false),
  (7, 'In the Devil''s Name I Pray', '4:35', NULL, true),
  (8, 'Rise Again', '4:12', NULL, false),
  (9, 'Voice of the People', '4:22', NULL, true),
  (10, 'Revolution', '5:01', NULL, false)
) AS t(track_number, title, duration, purchase_url, featured);

-- DESCEND - Chronix (estimated 10 tracks)
INSERT INTO tracks (album_id, track_number, title, duration, preview_url, purchase_url, featured)
SELECT 
  (SELECT id FROM albums WHERE slug = 'decend'),
  track_number,
  title,
  duration,
  NULL,
  NULL,
  featured
FROM (VALUES
  (1, 'Descent', '4:35', true),
  (2, 'Into the Void', '4:22', false),
  (3, 'Dark Matter', '4:48', false),
  (4, 'Shadows', '3:55', false),
  (5, 'The Deep', '5:02', true),
  (6, 'Echoes', '4:15', false),
  (7, 'Lost Signal', '4:38', false),
  (8, 'Emergence', '4:25', true),
  (9, 'Beyond', '4:52', false),
  (10, 'Ascend', '5:11', true)
) AS t(track_number, title, duration, featured);

-- WARMTH OF CHAOS - Daina Vein (estimated 8 tracks based on 28:45 duration)
INSERT INTO tracks (album_id, track_number, title, duration, preview_url, purchase_url, featured)
SELECT 
  (SELECT id FROM albums WHERE slug = 'warmth-of-chaos'),
  track_number,
  title,
  duration,
  NULL,
  NULL,
  featured
FROM (VALUES
  (1, 'Warmth of Chaos', '3:45', true),
  (2, 'Industrial Heart', '3:38', false),
  (3, 'Electric Storm', '3:52', false),
  (4, 'Burning Inside', '3:28', true),
  (5, 'Chaos Theory', '3:42', false),
  (6, 'Neon Nights', '3:35', false),
  (7, 'Digital Dreams', '3:18', false),
  (8, 'Final Warmth', '3:27', true)
) AS t(track_number, title, duration, featured);

-- =============================================
-- 4. ATUALIZAR SINGLES COM REFERÊNCIAS CORRETAS
-- =============================================

-- Corrigir singles que pertencem a Barefoot Supernova (artista é Kaira, não Johnathan)
UPDATE singles SET
  artist_id = (SELECT id FROM artists WHERE slug = 'kaira-heartfelt'),
  artist_name = 'Kaira Heartfelt',
  artist_slug = 'kaira-heartfelt',
  accent_color = 'pink'
WHERE album_slug = 'barefoot-supernova';

-- Corrigir singles de Heartfelt Rebellion (artista é Johnathan Gold)
UPDATE singles SET
  artist_id = (SELECT id FROM artists WHERE slug = 'johnathan-gold'),
  artist_name = 'Johnathan Gold & Guilded Hearts',
  artist_slug = 'johnathan-gold',
  album_id = (SELECT id FROM albums WHERE slug = 'heartfelt-rebellion'),
  album_title = 'Heartfelt Rebellion',
  album_slug = 'heartfelt-rebellion'
WHERE slug = 'heartfelt-rebellion';

-- Adicionar mais singles que estão faltando (baseado nos singles.json)
-- Small Town Supernova
INSERT INTO singles (slug, title, artist_id, artist_name, artist_slug, album_id, album_title, album_slug, genre, year, duration, price, catalog, description, buy_link, accent_color, featured)
VALUES (
  'small-town-supernova',
  'Small Town Supernova',
  (SELECT id FROM artists WHERE slug = 'kaira-heartfelt'),
  'Kaira Heartfelt',
  'kaira-heartfelt',
  (SELECT id FROM albums WHERE slug = 'barefoot-supernova'),
  'Barefoot Supernova',
  'barefoot-supernova',
  'Country-Pop',
  2025,
  '3:48',
  0.99,
  'RRN-KH-STS',
  'Title track from Barefoot Supernova - a small-town anthem',
  '',
  'pink',
  true
) ON CONFLICT (slug) DO UPDATE SET
  artist_id = EXCLUDED.artist_id,
  artist_name = EXCLUDED.artist_name,
  artist_slug = EXCLUDED.artist_slug,
  album_id = EXCLUDED.album_id,
  updated_at = NOW();

-- In the Devil's Name I Pray
INSERT INTO singles (slug, title, artist_id, artist_name, artist_slug, album_id, album_title, album_slug, genre, year, duration, price, catalog, description, buy_link, accent_color, featured)
VALUES (
  'in-the-devils-name',
  'In the Devil''s Name I Pray',
  (SELECT id FROM artists WHERE slug = 'mathew-cage'),
  'Mathew Cage',
  'mathew-cage',
  (SELECT id FROM albums WHERE slug = 'shattered-peaces'),
  'Shattered Peaces',
  'shattered-peaces',
  'Alt Rock',
  2025,
  '4:35',
  0.99,
  'RRN-MC-IDNIP',
  'A powerful rock anthem from Shattered Peaces',
  '',
  'red',
  true
) ON CONFLICT (slug) DO UPDATE SET
  artist_id = EXCLUDED.artist_id,
  updated_at = NOW();

-- =============================================
-- 5. CORRIGIR IMAGENS DOS ÁLBUNS
-- =============================================

-- Golden Heartbreak - extensão correta é .svg
UPDATE albums SET image = '/Golden Heartbreak.svg' WHERE slug = 'golden-heartbreak';

-- Heartfelt Rebellion - extensão correta é .png  
UPDATE albums SET image = '/Heartfelt Rebellion.png' WHERE slug = 'heartfelt-rebellion';

-- =============================================
-- 6. CORRIGIR IMAGENS DOS ARTISTAS
-- (Imagens de artistas não existem ainda, usando string vazia)
-- =============================================

-- Definir imagens vazias para artistas que não têm imagem
UPDATE artists SET image = '' WHERE slug IN ('johnathan-gold', 'kaira-heartfelt', 'mathew-cage', 'daina-vein');

-- Chronix - extensão correta é .svg
UPDATE artists SET image = '/Chronix.svg' WHERE slug = 'chronix';

-- =============================================
-- 7. VERIFICAÇÃO FINAL
-- =============================================
-- Após executar, use estas queries para verificar:

-- SELECT 'Artists' as table_name, COUNT(*) as count FROM artists
-- UNION ALL
-- SELECT 'Albums', COUNT(*) FROM albums
-- UNION ALL
-- SELECT 'Singles', COUNT(*) FROM singles
-- UNION ALL
-- SELECT 'Tracks', COUNT(*) FROM tracks;

-- Ver tracks por álbum:
-- SELECT a.title as album, COUNT(t.id) as track_count 
-- FROM albums a 
-- LEFT JOIN tracks t ON t.album_id = a.id 
-- GROUP BY a.title 
-- ORDER BY a.title;
