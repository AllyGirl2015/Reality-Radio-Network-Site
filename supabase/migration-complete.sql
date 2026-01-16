-- =============================================
-- REALITY RADIO NETWORK - COMPLETE DATA MIGRATION
-- Execute este SQL no Supabase SQL Editor
-- Gerado em: 2025-12-15
-- =============================================

-- =============================================
-- 1. ATUALIZAR ÁLBUNS COM DADOS CORRETOS
-- =============================================

-- America's Changed
UPDATE albums SET
  artist_name = 'Johnathan Gold & Guilded Hearts',
  genre = 'Country / Americana',
  duration = '38:42',
  description = 'America''s Changed is a heartland journey through quiet strength, gas-station prayers, and Main Street goodbyes — where country roots meet modern storytelling.',
  image = '/America''s Changed.png',
  digital_buy_link = 'https://square.link/u/8vYPUPDl',
  physical_buy_link = 'https://square.link/u/NB6AhAuq',
  updated_at = NOW()
WHERE slug = 'americas-changed';

-- Barefoot Supernova - Kaira Heartfelt
UPDATE albums SET
  artist_id = (SELECT id FROM artists WHERE slug = 'kaira-heartfelt'),
  artist_name = 'Kaira Heartfelt',
  artist_slug = 'kaira-heartfelt',
  genre = 'Country-Pop',
  duration = '48:58',
  catalog = 'RRN-KH-BS',
  description = 'Small-town sparks and big-sky dreams — Barefoot Supernova pairs country heart with modern storytelling from Kaira Heartfelt.',
  image = '/Barefoot Supernova.png',
  accent_color = 'pink',
  digital_buy_link = 'https://square.link/u/gu45gzwi',
  physical_buy_link = 'https://square.link/u/Zk8fGBle',
  updated_at = NOW()
WHERE slug = 'barefoot-supernova';

-- Descend - Chronix
UPDATE albums SET
  genre = 'Experimental Electronic / Dark Ambient',
  duration = '44:03',
  description = 'The mind descends into darkness so easily, but sometimes it also grows in the darkness rather than falling to it. Descend is an immersive sonic journey through the depths of human consciousness, exploring the transformative power of embracing our shadows.',
  image = '/Decend.svg',
  digital_buy_link = 'https://square.link/u/Pil3gVkP',
  physical_buy_link = 'https://square.link/u/f9VJJDnj',
  updated_at = NOW()
WHERE slug = 'decend';

-- Golden Heartbreak - Johnathan Gold
UPDATE albums SET
  artist_name = 'Johnathan Gold & Guilded Hearts',
  genre = 'Country / Heartbreak Country',
  duration = '78:45',
  catalog = 'RRN-JGGH-GH',
  description = 'Country love, lust, and heartbreak. Golden Heartbreak proves that country and love go together so well. Johnathan Gold and Guilded Hearts deliver their most emotionally vulnerable album yet, weaving tales of romance, loss, and the bittersweet memories that linger long after love fades.',
  image = '/Golden Heartbreak.svg',
  digital_buy_link = 'https://square.link/u/M5p4wqPq',
  physical_buy_link = 'https://square.link/u/Fxnf3Vdv',
  updated_at = NOW()
WHERE slug = 'golden-heartbreak';

-- Heartfelt Rebellion - Johnathan Gold
UPDATE albums SET
  artist_id = (SELECT id FROM artists WHERE slug = 'johnathan-gold'),
  artist_name = 'Johnathan Gold & Guilded Hearts',
  artist_slug = 'johnathan-gold',
  genre = 'Country Rock',
  duration = '48:33',
  catalog = 'RRN-JGGH-HR',
  physical_price = 16.99,
  description = 'Heartfelt Rebellion is a bold country-rock statement — tackling faith, fire, and the fight for authenticity with Johnathan Gold''s trademark grit and the full force of Guilded Hearts.',
  image = '/Heartfelt Rebellion.png',
  accent_color = 'purple',
  digital_buy_link = 'https://square.link/u/hpERvq5a',
  physical_buy_link = 'https://square.link/u/I0y2neFk',
  updated_at = NOW()
WHERE slug = 'heartfelt-rebellion';

-- High Hit - Mathew Cage
UPDATE albums SET
  genre = 'Alt Rock / Protest Rock',
  duration = '41:40',
  description = 'A multi-meaning album of fire and resolve. High Hit is a voice for the people, channeling raw emotion and social consciousness into powerful rock anthems. Mathew Cage delivers his most politically charged and emotionally resonant work, creating a soundtrack for resistance and hope.',
  image = '/High Hit.svg',
  digital_buy_link = 'https://square.link/u/5dXvGxd4',
  physical_buy_link = 'https://square.link/u/wuLEwHwX',
  updated_at = NOW()
WHERE slug = 'high-hit';

-- Shattered Peaces - Mathew Cage
UPDATE albums SET
  genre = 'Alt Rock / Emotional Rock',
  duration = '47:00',
  description = 'Shattered Peaces dives into the depths of emotion, resilience, and identity through gritty rock and raw expression. Mathew Cage delivers an unforgettable journey — torn between darkness and light — that demands to be felt.',
  image = '/Shattered Peaces.png',
  digital_buy_link = 'https://square.link/u/L2CIvC40',
  physical_buy_link = 'https://square.link/u/02cCRDCl',
  updated_at = NOW()
WHERE slug = 'shattered-peaces';

-- Stellar Love - Kaira Heartfelt
UPDATE albums SET
  genre = 'Country-Pop / Romantic Country',
  duration = '40:23',
  description = 'A clashing of love, lust, and heartbreak. Stellar Love is a whirlwind of romantic emotions that takes you through the highs and lows of modern romance. Kaira Heartfelt delivers her most emotionally raw and vulnerable work yet, blending country authenticity with contemporary pop sensibilities.',
  image = '/Stellar Love.svg',
  digital_buy_link = 'https://square.link/u/Txr1N34B',
  physical_buy_link = 'https://square.link/u/M2p3RQNg',
  updated_at = NOW()
WHERE slug = 'stellar-love';

-- Warmth of Chaos - Daina Vein
UPDATE albums SET
  genre = 'Electronic / Industrial',
  duration = '28:45',
  description = 'Warmth of Chaos is Daina Vein''s explosive debut, blending electronic intensity with raw emotional power. Each track ignites with industrial beats and ethereal vocals, creating a soundscape that embraces the beauty within chaos.',
  image = '/Warmth of Chaos.svg',
  updated_at = NOW()
WHERE slug = 'warmth-of-chaos';

-- =============================================
-- 2. LIMPAR TRACKS EXISTENTES
-- =============================================
DELETE FROM tracks;

-- =============================================
-- 3. INSERIR TODAS AS TRACKS COM PREVIEW URLs
-- =============================================

-- AMERICA'S CHANGED - Johnathan Gold & Guilded Hearts (10 tracks)
INSERT INTO tracks (album_id, track_number, title, duration, preview_url, purchase_url, featured)
SELECT 
  (SELECT id FROM albums WHERE slug = 'americas-changed'),
  v.track_number,
  v.title,
  v.duration,
  v.preview_url,
  v.purchase_url,
  v.featured
FROM (VALUES
  (1, 'America''s Changed', '3:42', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/America''s%20Changed/01%20America''s%20Changed.mp3', 'https://square.link/u/cY1R9Yas', true),
  (2, 'Goodbye Mainstreet', '3:35', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/America''s%20Changed/02%20Goodbye%20Mainstreet.mp3', 'https://square.link/u/LOuRjMBD', false),
  (3, 'She Wore Red, I Wore Blue', '4:05', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/America''s%20Changed/03%20She%20Wore%20Red%2C%20I%20wore%20Blue.mp3', 'https://square.link/u/U5l7NWyv', false),
  (4, 'God Blessed the Silent Ones', '3:58', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/America''s%20Changed/04%20God%20Blessed%20the%20Silent%20Ones.mp3', 'https://square.link/u/CRptBh7b', false),
  (5, 'Gas Station Prayers', '4:12', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/America''s%20Changed/05%20Gas%20Station%20Prayers.mp3', 'https://square.link/u/mO1DOqHN', false),
  (6, 'Generations', '3:45', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/America''s%20Changed/06%20Generations.mp3', 'https://square.link/u/IPBKC8O7', false),
  (7, 'Country Fireflies', '3:28', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/America''s%20Changed/07%20Country%20Fireflies.mp3', 'https://square.link/u/8aPThHjV', false),
  (8, 'Tractor Man', '3:52', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/America''s%20Changed/08%20Tractor%20Man.mp3', 'https://square.link/u/8HXmUmvF', false),
  (9, 'Young Ones', '4:18', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/America''s%20Changed/09%20Young%20Ones.mp3', 'https://square.link/u/NUHvRUL8', false),
  (10, 'Unspoken Hero', '4:47', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/America''s%20Changed/10%20Unspoken%20Hero.mp3', 'https://square.link/u/b0y5MXpr', false)
) AS v(track_number, title, duration, preview_url, purchase_url, featured);

-- BAREFOOT SUPERNOVA - Kaira Heartfelt (14 tracks)
INSERT INTO tracks (album_id, track_number, title, duration, preview_url, purchase_url, featured)
SELECT 
  (SELECT id FROM albums WHERE slug = 'barefoot-supernova'),
  v.track_number,
  v.title,
  v.duration,
  v.preview_url,
  v.purchase_url,
  v.featured
FROM (VALUES
  (1, 'Small Town Supernova', '3:18', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Barefoot%20Supernova/01%20Small%20Town%20Supernova.mp3', 'https://square.link/u/5RtJRMKv', true),
  (2, 'Country Girl', '3:25', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Barefoot%20Supernova/02%20Country%20Girl.mp3', 'https://square.link/u/l6cgNAC8', false),
  (3, 'Barefoot Change', '3:42', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Barefoot%20Supernova/03%20Barefoot%20Change.mp3', 'https://square.link/u/PQH2CVWU', false),
  (4, 'Lovestruck', '3:15', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Barefoot%20Supernova/04%20Lovestruck.mp3', 'https://square.link/u/4fIryxQD', false),
  (5, 'Evil Love', '3:38', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Barefoot%20Supernova/05%20Evil%20Love.mp3', 'https://square.link/u/OY5xgAwz', true),
  (6, 'He Cheated (Main)', '3:28', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Barefoot%20Supernova/06%20He%20Cheated%20(Main).mp3', 'https://square.link/u/7sPdOXvi', false),
  (7, 'His Best Was Better', '3:45', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Barefoot%20Supernova/07%20His%20Best%20was%20Better.mp3', 'https://square.link/u/jzoP6GPh', false),
  (8, 'Beautiful Broken Love (Ft. Johnathan Gold)', '4:05', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Barefoot%20Supernova/08%20Beautiful%20Broken%20Love%20(ft.%20Johnathan%20Gold).mp3', 'https://square.link/u/YlPc1uI1', true),
  (9, 'Firefly Nights', '3:32', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Barefoot%20Supernova/09%20Firefly%20Nights.mp3', 'https://square.link/u/d0Xux4fY', false),
  (10, 'Steering Faith', '3:48', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Barefoot%20Supernova/10%20Steering%20Faith.mp3', 'https://square.link/u/WS2JhhRH', false),
  (11, 'Daddy''s Girl', '4:12', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Barefoot%20Supernova/11%20Daddy''s%20Girl.mp3', 'https://square.link/u/YlOQWVSw', false),
  (12, 'Colder Nights', '3:55', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Barefoot%20Supernova/12%20Colder%20Nights.mp3', 'https://square.link/u/T8dcgmzd', false),
  (13, 'He Cheated (Slow Alt)', '3:52', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Barefoot%20Supernova/13%20He%20Cheated%20(Slow%20Alt).mp3', 'https://square.link/u/FgU9De98', false),
  (14, 'Small Town Supernova (Slow Alt)', '3:10', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Barefoot%20Supernova/14%20Small%20Town%20Supernova%20(Slow%20Alt).mp3', 'https://square.link/u/AGj1sQsJ', false)
) AS v(track_number, title, duration, preview_url, purchase_url, featured);

-- DESCEND - Chronix (10 tracks)
INSERT INTO tracks (album_id, track_number, title, duration, preview_url, purchase_url, featured)
SELECT 
  (SELECT id FROM albums WHERE slug = 'decend'),
  v.track_number,
  v.title,
  v.duration,
  v.preview_url,
  v.purchase_url,
  v.featured
FROM (VALUES
  (1, 'Starting Line', '4:12', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Chronix/Decend/01%20Starting%20Line.mp3', 'https://square.link/u/EQCSb9Zm', true),
  (2, 'Power of the Few', '4:38', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Chronix/Decend/02%20Power%20of%20the%20Few.mp3', 'https://square.link/u/gILHmo6H', false),
  (3, 'Rags No More', '4:05', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Chronix/Decend/03%20Rags%20No%20More.mp3', 'https://square.link/u/tW4GpZEt', false),
  (4, 'Hate No More', '4:22', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Chronix/Decend/04%20Hate%20No%20More.mp3', 'https://square.link/u/GoUQUJXA', true),
  (5, 'Mark Me Down', '4:48', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Chronix/Decend/05%20Mark%20Me%20Down.mp3', 'https://square.link/u/1vzafXZ0', false),
  (6, 'No Mistakes', '3:55', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Chronix/Decend/06%20No%20Mistakes.mp3', 'https://square.link/u/uoLk32wj', false),
  (7, 'Love No More', '4:32', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Chronix/Decend/07%20Love%20No%20More.mp3', 'https://square.link/u/e4Ap86kt', true),
  (8, 'Kinship', '4:28', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Chronix/Decend/08%20Kinship.mp3', 'https://square.link/u/nKLxawg1', false),
  (9, 'The Skies', '5:18', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Chronix/Decend/09%20The%20Skies.mp3', 'https://square.link/u/2W1BFTCQ', true),
  (10, 'Descend', '4:45', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Chronix/Decend/10%20Decend.mp3', 'https://square.link/u/2u6rpcSr', false)
) AS v(track_number, title, duration, preview_url, purchase_url, featured);

-- GOLDEN HEARTBREAK - Johnathan Gold & Guilded Hearts (22 tracks)
INSERT INTO tracks (album_id, track_number, title, duration, preview_url, purchase_url, featured)
SELECT 
  (SELECT id FROM albums WHERE slug = 'golden-heartbreak'),
  v.track_number,
  v.title,
  v.duration,
  v.preview_url,
  v.purchase_url,
  v.featured
FROM (VALUES
  (1, 'Back When We Fell', '3:42', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/01%20Back%20When%20We%20Fell.mp3', 'https://square.link/u/wX1OkEC7', true),
  (2, 'City Girl', '3:28', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/02%20City%20Girl.mp3', 'https://square.link/u/rseytD6W', false),
  (3, 'Country Looks', '3:35', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/03%20Country%20Looks.mp3', 'https://square.link/u/FT28aIJZ', false),
  (4, 'Tractor Heart', '3:45', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/04%20Tractor%20Heart.mp3', 'https://square.link/u/yc0nV212', true),
  (5, 'Country Lovin''', '3:52', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/05%20Country%20Lovin''.mp3', 'https://square.link/u/SnTml1ps', false),
  (6, 'Backroad Love', '3:38', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/06%20Backroad%20Love.mp3', 'https://square.link/u/14e5l2p6', false),
  (7, 'Country Tangled', '3:48', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/07%20Country%20Tangled.mp3', 'https://square.link/u/UN5iXDrE', false),
  (8, 'The Stash', '3:25', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/08%20The%20Stash.mp3', 'https://square.link/u/gZ9LdWRe', false),
  (9, 'Truckbed', '3:32', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/09%20Truckbed.mp3', 'https://square.link/u/QhtXJbYx', false),
  (10, 'Night on the Farm', '3:55', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/10%20Night%20On%20the%20Farm.mp3', 'https://square.link/u/NiuiZitK', false),
  (11, 'Innocent Love', '3:40', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/11%20Innocent%20Love.mp3', 'https://square.link/u/1ztXzbuu', false),
  (12, 'Country Breakup', '3:48', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/12%20Country%20Breakup.mp3', 'https://square.link/u/QzW1bYfl', false),
  (13, 'I Choose the Truck', '3:35', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/13%20I%20Choose%20the%20Truck.mp3', 'https://square.link/u/yoVxzSMt', true),
  (14, 'Muddy Mistake', '3:42', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/14%20Muddy%20Mistake.mp3', 'https://square.link/u/eGGOw13e', false),
  (15, 'Drunk Love', '3:28', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/15%20Drunk%20Love.mp3', 'https://square.link/u/pjnaC8Sw', false),
  (16, 'The Barn is a Secret', '4:05', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/16%20The%20Barn%20Is%20a%20Secret.mp3', 'https://square.link/u/dYj0rvWO', false),
  (17, 'The Old You and Me', '3:52', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/17%20The%20Old%20You%20and%20Me.mp3', 'https://square.link/u/N0bDGyKx', false),
  (18, 'Heartbreak Song', '4:15', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/18%20Heartbreak%20Song.mp3', 'https://square.link/u/UiIMPsRM', true),
  (19, 'Young Love', '3:38', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/19%20Young%20Love.mp3', 'https://square.link/u/tVeSuAoC', false),
  (20, 'Family Livin''', '3:45', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/20%20Family%20Livin''.mp3', 'https://square.link/u/0iah9h9s', false),
  (21, 'Tractor Tango', '3:55', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/21%20Tractor%20Tango.mp3', 'https://square.link/u/FsUC9ejz', false),
  (22, 'Golden Heartbreak', '4:32', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Golden%20Heartbreak/22%20Golden%20Heartbreak.mp3', 'https://square.link/u/qaj4NSW0', true)
) AS v(track_number, title, duration, preview_url, purchase_url, featured);

-- HEARTFELT REBELLION - Johnathan Gold & Guilded Hearts (13 tracks)
INSERT INTO tracks (album_id, track_number, title, duration, preview_url, purchase_url, featured)
SELECT 
  (SELECT id FROM albums WHERE slug = 'heartfelt-rebellion'),
  v.track_number,
  v.title,
  v.duration,
  v.preview_url,
  v.purchase_url,
  v.featured
FROM (VALUES
  (1, 'Heartfelt Rebellion', '3:28', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Heartfelt%20Rebellion/01%20Heartfelt%20Rebellion.mp3', 'https://square.link/u/XabI1gG5', true),
  (2, 'Country Bonfire', '3:48', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Heartfelt%20Rebellion/02%20Country%20Bonfire.mp3', 'https://square.link/u/wqT7BO6v', false),
  (3, 'Screens', '3:22', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Heartfelt%20Rebellion/03%20Screens.mp3', 'https://square.link/u/c8Gi0DAC', false),
  (4, 'Forgotten Sons', '4:18', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Heartfelt%20Rebellion/04%20Forgotten%20Sons.mp3', 'https://square.link/u/4X4F5rfO', false),
  (5, 'Chaos Country', '3:55', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Heartfelt%20Rebellion/05%20Chaos%20Country.mp3', 'https://square.link/u/2ZQY92lI', true),
  (6, 'Lifeline', '3:38', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Heartfelt%20Rebellion/06%20Lifeline.mp3', 'https://square.link/u/hwnbiib5', false),
  (7, 'Connections', '3:42', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Heartfelt%20Rebellion/07%20Connections.mp3', 'https://square.link/u/vN1ritIY', false),
  (8, 'Country Style', '3:28', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Heartfelt%20Rebellion/08%20Country%20Style.mp3', 'https://square.link/u/3FBthDir', false),
  (9, 'Civilization Outlaw', '4:25', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Heartfelt%20Rebellion/09%20Civilization%20Outlaw.mp3', 'https://square.link/u/XRwfPcK3', false),
  (10, 'Religious Truth', '4:32', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Heartfelt%20Rebellion/10%20Religious%20Truth.mp3', 'https://square.link/u/4lBRiXbf', false),
  (11, 'Unspoken Words', '3:55', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Heartfelt%20Rebellion/11%20Unspoken%20Words.mp3', 'https://square.link/u/7XuZrS9t', false),
  (12, 'Truth is What You Make It', '4:12', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Heartfelt%20Rebellion/12%20Truth%20is%20What%20You%20Make%20It.mp3', 'https://square.link/u/aF2dRvVr', false),
  (13, 'Empathy', '4:13', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Johnathan%20Gold/Heartfelt%20Rebellion/13%20Empathy.mp3', 'https://square.link/u/zW3GN3Rm', false)
) AS v(track_number, title, duration, preview_url, purchase_url, featured);

-- HIGH HIT - Mathew Cage (10 tracks)
INSERT INTO tracks (album_id, track_number, title, duration, preview_url, purchase_url, featured)
SELECT 
  (SELECT id FROM albums WHERE slug = 'high-hit'),
  v.track_number,
  v.title,
  v.duration,
  v.preview_url,
  v.purchase_url,
  v.featured
FROM (VALUES
  (1, 'Scraps', '4:12', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Mathew%20Cage/High%20Hit/01%20Scraps.mp3', 'https://square.link/u/Nk4Sjd9j', true),
  (2, 'One Drink', '3:45', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Mathew%20Cage/High%20Hit/02%20One%20Drink.mp3', 'https://square.link/u/POxETfEH', false),
  (3, 'Fallen Dust', '4:28', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Mathew%20Cage/High%20Hit/03%20Fallen%20Dust.mp3', 'https://square.link/u/zsgL3N5e', false),
  (4, 'Drown it Out', '3:52', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Mathew%20Cage/High%20Hit/04%20Drown%20It%20Out.mp3', 'https://square.link/u/KCOOq0Jr', true),
  (5, 'Chronicles', '4:05', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Mathew%20Cage/High%20Hit/05%20Chronicles.mp3', 'https://square.link/u/kEfKJCIE', false),
  (6, 'Reflection', '3:38', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Mathew%20Cage/High%20Hit/06%20Reflection.mp3', 'https://square.link/u/CwdgT7a5', false),
  (7, 'Hollow Leaning', '4:18', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Mathew%20Cage/High%20Hit/07%20Hollow%20Leaning.mp3', 'https://square.link/u/1AWKrlg8', false),
  (8, 'Youth', '4:42', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Mathew%20Cage/High%20Hit/08%20Youth.mp3', 'https://square.link/u/ZbdCOF4m', true),
  (9, 'High Hit', '3:55', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Mathew%20Cage/High%20Hit/09%20High%20Hit.mp3', 'https://square.link/u/8PETjt8w', true),
  (10, 'Made Us', '4:25', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Mathew%20Cage/High%20Hit/10%20Made%20Us.mp3', 'https://square.link/u/DpgfBHdm', false)
) AS v(track_number, title, duration, preview_url, purchase_url, featured);

-- SHATTERED PEACES - Mathew Cage (11 tracks)
INSERT INTO tracks (album_id, track_number, title, duration, preview_url, purchase_url, featured)
SELECT 
  (SELECT id FROM albums WHERE slug = 'shattered-peaces'),
  v.track_number,
  v.title,
  v.duration,
  v.preview_url,
  v.purchase_url,
  v.featured
FROM (VALUES
  (1, 'World of Gold', '3:06', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Mathew%20Cage/Shattered%20Peaces/01%20World%20of%20Gold.mp3', 'https://square.link/u/ioeRiwvN', true),
  (2, 'Fractured Signal', '4:02', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Mathew%20Cage/Shattered%20Peaces/02%20Fractured%20Signal.mp3', 'https://square.link/u/2OwcTGU3', false),
  (3, 'The Line Was Crossed', '3:58', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Mathew%20Cage/Shattered%20Peaces/03%20The%20Line%20was%20Crossed.mp3', 'https://square.link/u/VOSlMOow', false),
  (4, 'Echoes of the Cage', '4:28', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Mathew%20Cage/Shattered%20Peaces/04%20Echoes%20of%20the%20Cage.mp3', 'https://square.link/u/zwQRJCwe', false),
  (5, 'Shattered', '3:45', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Mathew%20Cage/Shattered%20Peaces/05%20Shattered.mp3', 'https://square.link/u/TGkYjuXg', false),
  (6, 'Broken Peace', '4:15', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Mathew%20Cage/Shattered%20Peaces/06%20Broken%20Peace.mp3', 'https://square.link/u/dRzsmiHE', false),
  (7, 'Fallen Flag', '5:05', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Mathew%20Cage/Shattered%20Peaces/07%20Fallen%20Flag.mp3', 'https://square.link/u/VEMs3Tdc', true),
  (8, 'Soulbound', '3:52', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Mathew%20Cage/Shattered%20Peaces/08%20Soulbound.mp3', 'https://square.link/u/gJAtDs7Y', false),
  (9, 'Corruption', '4:38', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Mathew%20Cage/Shattered%20Peaces/09%20Corruption.mp3', 'https://square.link/u/8Atz8bI9', false),
  (10, 'Opening', '4:20', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Mathew%20Cage/Shattered%20Peaces/10%20Opening.mp3', 'https://square.link/u/X00dkH2B', false),
  (11, 'In the Devil''s Name I Pray', '4:45', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Mathew%20Cage/Shattered%20Peaces/11%20In%20the%20Devils%20Name%20I%20Pray.mp3', 'https://square.link/u/OaRH2hfE', true)
) AS v(track_number, title, duration, preview_url, purchase_url, featured);

-- STELLAR LOVE - Kaira Heartfelt (11 tracks)
INSERT INTO tracks (album_id, track_number, title, duration, preview_url, purchase_url, featured)
SELECT 
  (SELECT id FROM albums WHERE slug = 'stellar-love'),
  v.track_number,
  v.title,
  v.duration,
  v.preview_url,
  v.purchase_url,
  v.featured
FROM (VALUES
  (1, 'Lustful Love', '3:28', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Stellar%20Love/01%20Lustful%20Love.mp3', 'https://square.link/u/7Z7NtdOx', true),
  (2, 'Love Killer', '3:45', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Stellar%20Love/02%20Love%20Killer.mp3', 'https://square.link/u/YkZwnMzA', false),
  (3, 'The Stars Above', '3:52', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Stellar%20Love/03%20The%20Stars%20Above.mp3', 'https://square.link/u/1vJh1PwJ', false),
  (4, 'Take My Love', '3:18', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Stellar%20Love/04%20Take%20My%20Love.mp3', 'https://square.link/u/8kANPQUF', false),
  (5, 'Rebound', '3:35', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Stellar%20Love/05%20Rebound.mp3', 'https://square.link/u/HaZTz5xe', false),
  (6, 'Heart Call', '3:42', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Stellar%20Love/06%20Heart%20Call.mp3', 'https://square.link/u/O4PioY92', false),
  (7, 'Catcall', '4:05', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Stellar%20Love/07%20Catcall.mp3', 'https://square.link/u/xXVJu6EJ', true),
  (8, 'Fisher', '3:38', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Stellar%20Love/08%20Fisher.mp3', 'https://square.link/u/6EAJJTol', false),
  (9, 'Confidential', '3:25', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Stellar%20Love/09%20Confidential.mp3', 'https://square.link/u/lfs9e6sC', false),
  (10, 'Chaos Love', '3:48', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Stellar%20Love/10%20Chaos%20Love.mp3', 'https://square.link/u/Z864AJ0B', true),
  (11, 'Devil''s Number', '4:12', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Kaira%20Heatfelt/Stellar%20Love/11%20Devils%20Number.mp3', 'https://square.link/u/a6D5Cfmh', false)
) AS v(track_number, title, duration, preview_url, purchase_url, featured);

-- WARMTH OF CHAOS - Daina Vein (6 tracks)
INSERT INTO tracks (album_id, track_number, title, duration, preview_url, purchase_url, featured)
SELECT 
  (SELECT id FROM albums WHERE slug = 'warmth-of-chaos'),
  v.track_number,
  v.title,
  v.duration,
  v.preview_url,
  v.purchase_url,
  v.featured
FROM (VALUES
  (1, 'Break Me Up', '4:32', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Daina%20Vein/Warmth%20of%20Chaos/01%20Break%20Me%20Up.mp3', NULL, true),
  (2, 'Split Matrix', '4:48', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Daina%20Vein/Warmth%20of%20Chaos/02%20Split%20Matrix.mp3', NULL, false),
  (3, 'Chaos Sake', '4:55', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Daina%20Vein/Warmth%20of%20Chaos/03%20Chaos%20Sake.mp3', NULL, true),
  (4, 'Trial By Fire', '5:02', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Daina%20Vein/Warmth%20of%20Chaos/04%20Trial%20By%20Fire.mp3', NULL, false),
  (5, 'We Stand As One', '4:38', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Daina%20Vein/Warmth%20of%20Chaos/05%20We%20Stand%20As%20One.mp3', NULL, true),
  (6, 'United They Fall', '4:50', 'https://pub-0dcbd2c73f5146f187aa654aa50b8b5d.r2.dev/Music/Daina%20Vein/Warmth%20of%20Chaos/06%20United%20They%20Fall.mp3', NULL, false)
) AS v(track_number, title, duration, preview_url, purchase_url, featured);

-- =============================================
-- 4. ATUALIZAR/CORRIGIR SINGLES COM ARTISTAS CORRETOS
-- =============================================

-- Singles de Barefoot Supernova devem ser de Kaira Heartfelt
UPDATE singles SET
  artist_id = (SELECT id FROM artists WHERE slug = 'kaira-heartfelt'),
  artist_name = 'Kaira Heartfelt',
  artist_slug = 'kaira-heartfelt',
  accent_color = 'pink'
WHERE album_slug = 'barefoot-supernova';

-- Singles de Heartfelt Rebellion devem ser de Johnathan Gold
UPDATE singles SET
  artist_id = (SELECT id FROM artists WHERE slug = 'johnathan-gold'),
  artist_name = 'Johnathan Gold & Guilded Hearts',
  artist_slug = 'johnathan-gold',
  accent_color = 'purple'
WHERE album_slug = 'heartfelt-rebellion';

-- =============================================
-- 5. CORRIGIR IMAGENS DOS ARTISTAS
-- =============================================

-- Definir imagens vazias para artistas que não têm imagem
UPDATE artists SET image = '' WHERE slug IN ('johnathan-gold', 'kaira-heartfelt', 'mathew-cage', 'daina-vein');

-- Chronix tem imagem .svg
UPDATE artists SET image = '/Chronix.svg' WHERE slug = 'chronix';

-- =============================================
-- 6. VERIFICAÇÃO FINAL
-- =============================================
-- Execute estas queries após a migração para verificar:

-- SELECT 'Artists' as table_name, COUNT(*) as count FROM artists
-- UNION ALL SELECT 'Albums', COUNT(*) FROM albums
-- UNION ALL SELECT 'Singles', COUNT(*) FROM singles
-- UNION ALL SELECT 'Tracks', COUNT(*) FROM tracks;

-- Ver tracks por álbum:
-- SELECT a.title as album, a.artist_name, COUNT(t.id) as track_count 
-- FROM albums a 
-- LEFT JOIN tracks t ON t.album_id = a.id 
-- GROUP BY a.id, a.title, a.artist_name
-- ORDER BY a.title;
