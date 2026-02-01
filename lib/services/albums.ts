import { getSupabase, getSupabaseAdmin } from '@/lib/supabase';
import { Album, AlbumFormData, Track, TrackFormData, getAllAlbums as dbGetAllAlbums, getAlbumById as dbGetAlbumById } from '@/lib/database';

// === FETCH ALBUMS (Public) ===
export async function getAllAlbums(): Promise<Album[]> {
  const supabase = getSupabase();
  if (!supabase) {
    return dbGetAllAlbums();
  }
  
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .order('year', { ascending: false });

  if (error) {
    console.error('Error fetching albums:', error);
    return dbGetAllAlbums();
  }
  
  return data || dbGetAllAlbums();
}

export async function getFeaturedAlbums(): Promise<Album[]> {
  const supabase = getSupabase();
  if (!supabase) return dbGetAllAlbums().filter(a => a.featured);
  
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .eq('featured', true)
    .order('year', { ascending: false });

  if (error) {
    console.error('Error fetching featured albums:', error);
    return dbGetAllAlbums().filter(a => a.featured);
  }
  
  return data || dbGetAllAlbums().filter(a => a.featured);
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return dbGetAllAlbums().find(a => a.slug === slug) || null;
  }
  
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching album:', error);
    return dbGetAllAlbums().find(a => a.slug === slug) || null;
  }

  return data;
}

export async function getAlbumById(id: string): Promise<Album | null> {
  const supabase = getSupabase();
  if (!supabase) return dbGetAlbumById(id) || null;
  
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching album:', error);
    return dbGetAlbumById(id) || null;
  }

  return data;
}

export async function getAlbumsByArtist(artistId: string): Promise<Album[]> {
  const supabase = getSupabase();
  if (!supabase) return dbGetAllAlbums().filter(a => a.artist === artistId || a.artistSlug === artistId);
  
  const { data, error } = await supabase
    .from('albums')
    .select('*')
    .eq('artist_id', artistId)
    .order('year', { ascending: false });

  if (error) {
    console.error('Error fetching albums by artist:', error);
    return dbGetAllAlbums().filter(a => a.artist === artistId || a.artistSlug === artistId);
  }
  
  return data || dbGetAllAlbums().filter(a => a.artist === artistId || a.artistSlug === artistId);
}

// === FETCH TRACKS (Public) ===
export async function getTracksByAlbum(albumId: string): Promise<Track[]> {
  const supabase = getSupabase();
  if (!supabase) {
    const album = dbGetAllAlbums().find(a => a.id === albumId || a.slug === albumId);
    return album ? (album.tracklist as Track[]) : [];
  }
  
  const { data, error } = await supabase
    .from('tracks')
    .select('*')
    .eq('album_id', albumId)
    .order('track_number', { ascending: true });

  if (error) {
    console.error('Error fetching tracks:', error);
    const album = dbGetAllAlbums().find(a => a.id === albumId || a.slug === albumId);
    return album ? (album.tracklist as Track[]) : [];
  }

  return data || [];
}

// === ADMIN ALBUM OPERATIONS (Server-side only) ===
export async function createAlbum(formData: AlbumFormData, artistName: string, artistSlug: string): Promise<Album | null> {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase admin not configured');
  
  const { data, error } = await admin
    .from('albums')
    .insert({
      ...formData,
      artist_name: artistName,
      artist_slug: artistSlug,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating album:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function updateAlbum(id: string, formData: Partial<AlbumFormData>): Promise<Album | null> {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase admin not configured');
  
  const { data, error } = await admin
    .from('albums')
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating album:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteAlbum(id: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase admin not configured');
  
  // First delete all tracks associated with the album
  await admin
    .from('tracks')
    .delete()
    .eq('album_id', id);
  
  const { error } = await admin
    .from('albums')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting album:', error);
    throw new Error(error.message);
  }

  return true;
}

// === ADMIN TRACK OPERATIONS (Server-side only) ===
export async function createTrack(formData: TrackFormData): Promise<Track | null> {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase admin not configured');
  
  const { data, error } = await admin
    .from('tracks')
    .insert(formData)
    .select()
    .single();

  if (error) {
    console.error('Error creating track:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function updateTrack(id: string, formData: Partial<TrackFormData>): Promise<Track | null> {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase admin not configured');
  
  const { data, error } = await admin
    .from('tracks')
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating track:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteTrack(id: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase admin not configured');
  
  const { error } = await admin
    .from('tracks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting track:', error);
    throw new Error(error.message);
  }

  return true;
}

export async function bulkCreateTracks(tracks: TrackFormData[]): Promise<Track[]> {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase admin not configured');
  
  const { data, error } = await admin
    .from('tracks')
    .insert(tracks)
    .select();

  if (error) {
    console.error('Error bulk creating tracks:', error);
    throw new Error(error.message);
  }

  return data || [];
}
