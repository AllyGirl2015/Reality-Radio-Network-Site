#!/usr/bin/env python3
"""
Import JSON data from the `data/` folder into the Postgres database.

Usage:
  export DATABASE_URL=postgres://user:pass@host:5432/dbname
  python scripts/import_seeds.py

Or pass `--db-url`.

This script:
- Inserts/updates artists (by slug)
- Inserts/updates albums (linking artist by slug)
- Inserts/updates tracks (linking album by slug)
- Inserts/updates singles (linking artist & album by slug)
- Inserts/updates blogs

It uses `ON CONFLICT` to be idempotent.
"""
import os
import json
import argparse
from datetime import datetime
import psycopg2
from psycopg2.extras import execute_values


def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def upsert_artists(cur, artists):
    sql = '''
    INSERT INTO artists (slug, name, genre, bio, image, accent_color, social_links, created_at, updated_at)
    VALUES %s
    ON CONFLICT (slug) DO UPDATE SET
      name = EXCLUDED.name,
      genre = EXCLUDED.genre,
      bio = EXCLUDED.bio,
      image = EXCLUDED.image,
      accent_color = EXCLUDED.accent_color,
      social_links = COALESCE(EXCLUDED.social_links, artists.social_links),
      updated_at = EXCLUDED.updated_at
    RETURNING id, slug;
    '''
    vals = []
    for a in artists:
        vals.append((a.get('slug'), a.get('name'), a.get('genre'), a.get('bio'), a.get('image'), a.get('accentColor') or a.get('accent_color') or 'purple', json.dumps(a.get('social_links', {})), a.get('createdAt') or datetime.utcnow().isoformat(), a.get('updatedAt') or datetime.utcnow().isoformat()))
    execute_values(cur, sql, vals)
    rows = cur.fetchall()
    return {r[1]: r[0] for r in rows}


def upsert_albums(cur, albums, artist_map):
    sql = '''
    INSERT INTO albums (slug, title, artist_id, artist_name, artist_slug, genre, year, duration, digital_price, physical_price, catalog, image, description, digital_buy_link, physical_buy_link, accent_color, featured, streaming_links, created_at, updated_at)
    VALUES %s
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      artist_id = EXCLUDED.artist_id,
      artist_name = EXCLUDED.artist_name,
      artist_slug = EXCLUDED.artist_slug,
      genre = EXCLUDED.genre,
      year = EXCLUDED.year,
      duration = EXCLUDED.duration,
      digital_price = EXCLUDED.digital_price,
      physical_price = EXCLUDED.physical_price,
      catalog = EXCLUDED.catalog,
      image = EXCLUDED.image,
      description = EXCLUDED.description,
      digital_buy_link = EXCLUDED.digital_buy_link,
      physical_buy_link = EXCLUDED.physical_buy_link,
      accent_color = EXCLUDED.accent_color,
      featured = EXCLUDED.featured,
      streaming_links = COALESCE(EXCLUDED.streaming_links, albums.streaming_links),
      updated_at = EXCLUDED.updated_at
    RETURNING id, slug;
    '''
    vals = []
    for a in albums:
        artist_id = artist_map.get(a.get('artistSlug'))
        vals.append((a.get('slug'), a.get('title'), artist_id, a.get('artist'), a.get('artistSlug'), a.get('genre'), a.get('year'), a.get('duration'), a.get('digitalPrice') or 0, a.get('physicalPrice') or 0, a.get('catalog'), a.get('image'), a.get('description'), a.get('digitalBuyLink') or '', a.get('physicalBuyLink') or '', a.get('accentColor') or 'purple', bool(a.get('featured', False)), json.dumps(a.get('streaming_links', {})), a.get('createdAt') or datetime.utcnow().isoformat(), a.get('updatedAt') or datetime.utcnow().isoformat()))
    execute_values(cur, sql, vals)
    rows = cur.fetchall()
    return {r[1]: r[0] for r in rows}


def upsert_tracks(cur, albums_with_tracks, album_map):
    sql = '''
    INSERT INTO tracks (album_id, track_number, title, duration, preview_url, purchase_url, featured, created_at, updated_at)
    VALUES %s
    ON CONFLICT (album_id, track_number) DO UPDATE SET
      title = EXCLUDED.title,
      duration = EXCLUDED.duration,
      preview_url = EXCLUDED.preview_url,
      purchase_url = EXCLUDED.purchase_url,
      featured = EXCLUDED.featured,
      updated_at = EXCLUDED.updated_at
    RETURNING id;
    '''
    vals = []
    for album in albums_with_tracks:
        slug = album.get('slug')
        a_id = album_map.get(slug)
        for t in album.get('tracklist', []):
            vals.append((a_id, t.get('number'), t.get('title'), t.get('duration'), t.get('previewUrl') or t.get('preview_url'), t.get('purchaseUrl') or t.get('purchase_url') or None, bool(t.get('featured', False)), album.get('createdAt') or datetime.utcnow().isoformat(), album.get('updatedAt') or datetime.utcnow().isoformat()))
    if vals:
        execute_values(cur, sql, vals)


def upsert_singles(cur, singles, artist_map, album_map):
    sql = '''
    INSERT INTO singles (slug, title, artist_id, artist_name, artist_slug, album_id, album_title, album_slug, genre, year, duration, price, catalog, description, buy_link, preview_url, image, accent_color, featured, streaming_links, created_at, updated_at)
    VALUES %s
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      artist_id = EXCLUDED.artist_id,
      artist_name = EXCLUDED.artist_name,
      artist_slug = EXCLUDED.artist_slug,
      album_id = EXCLUDED.album_id,
      album_title = EXCLUDED.album_title,
      album_slug = EXCLUDED.album_slug,
      genre = EXCLUDED.genre,
      year = EXCLUDED.year,
      duration = EXCLUDED.duration,
      price = EXCLUDED.price,
      catalog = EXCLUDED.catalog,
      description = EXCLUDED.description,
      buy_link = EXCLUDED.buy_link,
      preview_url = EXCLUDED.preview_url,
      image = COALESCE(EXCLUDED.image, singles.image),
      accent_color = EXCLUDED.accent_color,
      featured = EXCLUDED.featured,
      streaming_links = COALESCE(EXCLUDED.streaming_links, singles.streaming_links),
      updated_at = EXCLUDED.updated_at
    RETURNING id, slug;
    '''
    vals = []
    for s in singles:
        artist_id = artist_map.get(s.get('artistSlug'))
        album_id = album_map.get(s.get('albumSlug')) if s.get('albumSlug') else None
        vals.append((s.get('slug'), s.get('title'), artist_id, s.get('artist'), s.get('artistSlug'), album_id, s.get('album'), s.get('albumSlug'), s.get('genre'), s.get('year'), s.get('duration'), s.get('price') or 0, s.get('catalog') or '', s.get('description') or '', s.get('buyLink') or '', s.get('previewUrl') or s.get('preview_url') or None, s.get('image') or None, s.get('accentColor') or s.get('accent_color') or 'purple', bool(s.get('featured', False)), json.dumps(s.get('streaming_links', {})), s.get('createdAt') or datetime.utcnow().isoformat(), s.get('updatedAt') or datetime.utcnow().isoformat()))
    execute_values(cur, sql, vals)
    rows = cur.fetchall()
    return {r[1]: r[0] for r in rows}


def upsert_blogs(cur, blogs):
    if not blogs:
        return
    sql = '''
    INSERT INTO blogs (slug, title, content, excerpt, author, image, tags, published, published_at, created_at, updated_at)
    VALUES %s
    ON CONFLICT (slug) DO UPDATE SET
      title = EXCLUDED.title,
      content = EXCLUDED.content,
      excerpt = EXCLUDED.excerpt,
      author = EXCLUDED.author,
      image = EXCLUDED.image,
      tags = EXCLUDED.tags,
      published = EXCLUDED.published,
      published_at = EXCLUDED.published_at,
      updated_at = EXCLUDED.updated_at
    RETURNING slug;
    '''
    vals = []
    for b in blogs:
        vals.append((b.get('slug'), b.get('title'), b.get('content'), b.get('excerpt'), b.get('author'), b.get('image'), b.get('tags') or [], bool(b.get('published', False)), b.get('published_at'), b.get('createdAt') or datetime.utcnow().isoformat(), b.get('updatedAt') or datetime.utcnow().isoformat()))
    execute_values(cur, sql, vals)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--db-url', help='Postgres DATABASE_URL (overrides env)')
    args = p.parse_args()

    db_url = args.db_url or os.getenv('DATABASE_URL')
    if not db_url:
        print('Provide DATABASE_URL env var or --db-url')
        return

    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
    artists = load_json(os.path.join(data_dir, 'artists.json'))
    albums = load_json(os.path.join(data_dir, 'albums.json'))
    singles = load_json(os.path.join(data_dir, 'singles.json'))
    blogs = []
    blogs_path = os.path.join(data_dir, 'blogs.json')
    if os.path.exists(blogs_path):
        blogs = load_json(blogs_path)

    conn = psycopg2.connect(db_url)
    try:
        with conn:
            with conn.cursor() as cur:
                print('Upserting artists...')
                artist_map = upsert_artists(cur, artists)
                print('Upserting albums...')
                album_map = upsert_albums(cur, albums, artist_map)
                print('Upserting tracks...')
                upsert_tracks(cur, albums, album_map)
                print('Upserting singles...')
                upsert_singles(cur, singles, artist_map, album_map)
                print('Upserting blogs...')
                upsert_blogs(cur, blogs)
                print('Done.')
    finally:
        conn.close()


if __name__ == '__main__':
    main()
