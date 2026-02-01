const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(process.cwd(), 'data');
const ALBUMS_FILE = path.join(DATA_DIR, 'albums.json');
const SINGLES_FILE = path.join(DATA_DIR, 'singles.json');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

const albums = readJson(ALBUMS_FILE);
const singles = readJson(SINGLES_FILE);

// group singles by albumSlug
const byAlbum = {};
for (const s of singles) {
  const key = s.albumSlug || s.album || null;
  if (!key) continue;
  if (!byAlbum[key]) byAlbum[key] = [];
  byAlbum[key].push(s);
}

// For each album, build tracklist from matched singles; sort by catalog when available
for (const album of albums) {
  const list = byAlbum[album.slug] || [];
  list.sort((a,b) => {
    if (a.catalog && b.catalog) return a.catalog.localeCompare(b.catalog);
    return (a.title || '').localeCompare(b.title || '');
  });
  album.tracklist = list.map((s, idx) => ({
    number: idx + 1,
    title: s.title,
    duration: s.duration || '',
    featured: !!s.featured,
    previewUrl: s.previewUrl || undefined
  }));
}

writeJson(ALBUMS_FILE, albums);
console.log('Updated album tracklists.');
