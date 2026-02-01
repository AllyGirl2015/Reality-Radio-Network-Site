import { getSupabase, getSupabaseAdmin } from '@/lib/supabase';
import { Single, SingleFormData, getAllSingles as dbGetAllSingles } from '@/lib/database';

// === FETCH SINGLES (Public) ===
export async function getAllSingles(): Promise<Single[]> {
  const supabase = getSupabase();
  if (!supabase) return dbGetAllSingles();
  
  const { data, error } = await supabase
    .from('singles')
    .select('*')
    .order('year', { ascending: false });

  if (error) {
    console.error('Error fetching singles:', error);
    return dbGetAllSingles();
  }
  
  return data || dbGetAllSingles();
}

export async function getFeaturedSingles(): Promise<Single[]> {
  const supabase = getSupabase();
  if (!supabase) return dbGetAllSingles().filter(s => s.featured);
  
  const { data, error } = await supabase
    .from('singles')
    .select('*')
    .eq('featured', true)
    .order('year', { ascending: false });

  if (error) {
    console.error('Error fetching featured singles:', error);
    return dbGetAllSingles().filter(s => s.featured);
  }
  
  return data || dbGetAllSingles().filter(s => s.featured);
}

export async function getSingleBySlug(slug: string): Promise<Single | null> {
  const supabase = getSupabase();
  if (!supabase) return dbGetAllSingles().find(s => s.slug === slug) || null;
  
  const { data, error } = await supabase
    .from('singles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching single:', error);
    return dbGetAllSingles().find(s => s.slug === slug) || null;
  }

  return data;
}

export async function getSingleById(id: string): Promise<Single | null> {
  const supabase = getSupabase();
  if (!supabase) return dbGetAllSingles().find(s => s.id === id) || null;
  
  const { data, error } = await supabase
    .from('singles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching single:', error);
    return dbGetAllSingles().find(s => s.id === id) || null;
  }

  return data;
}

export async function getSinglesByArtist(artistId: string): Promise<Single[]> {
  const supabase = getSupabase();
  if (!supabase) return dbGetAllSingles().filter(s => s.artist === artistId || s.artistSlug === artistId);
  
  const { data, error } = await supabase
    .from('singles')
    .select('*')
    .eq('artist_id', artistId)
    .order('year', { ascending: false });

  if (error) {
    console.error('Error fetching singles by artist:', error);
    return dbGetAllSingles().filter(s => s.artist === artistId || s.artistSlug === artistId);
  }

  return data || dbGetAllSingles().filter(s => s.artist === artistId || s.artistSlug === artistId);
}

export async function getSinglesByAlbum(albumId: string): Promise<Single[]> {
  const supabase = getSupabase();
  if (!supabase) return dbGetAllSingles().filter(s => s.album === albumId || s.albumSlug === albumId);
  
  const { data, error } = await supabase
    .from('singles')
    .select('*')
    .eq('album_id', albumId)
    .order('year', { ascending: false });

  if (error) {
    console.error('Error fetching singles by album:', error);
    return dbGetAllSingles().filter(s => s.album === albumId || s.albumSlug === albumId);
  }
  
  return data || dbGetAllSingles().filter(s => s.album === albumId || s.albumSlug === albumId);
}

// === ADMIN OPERATIONS (Server-side only) ===
export async function createSingle(
  formData: SingleFormData, 
  artistName: string, 
  artistSlug: string,
  albumTitle?: string,
  albumSlug?: string
): Promise<Single | null> {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase admin not configured');
  
  const { data, error } = await admin
    .from('singles')
    .insert({
      ...formData,
      artist_name: artistName,
      artist_slug: artistSlug,
      album_title: albumTitle,
      album_slug: albumSlug,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating single:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function updateSingle(id: string, formData: Partial<SingleFormData>): Promise<Single | null> {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase admin not configured');
  
  const { data, error } = await admin
    .from('singles')
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating single:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteSingle(id: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase admin not configured');
  
  const { error } = await admin
    .from('singles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting single:', error);
    throw new Error(error.message);
  }

  return true;
}

// === SEARCH ===
export async function searchSingles(query: string): Promise<Single[]> {
  const supabase = getSupabase();
  if (!supabase) return dbGetAllSingles().filter(s =>
    s.title.toLowerCase().includes(query.toLowerCase()) ||
    s.artist.toLowerCase().includes(query.toLowerCase()) ||
    s.genre.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 20);
  
  const { data, error } = await supabase
    .from('singles')
    .select('*')
    .or(`title.ilike.%${query}%,artist_name.ilike.%${query}%,genre.ilike.%${query}%`)
    .order('year', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error searching singles:', error);
    return dbGetAllSingles().filter(s =>
      s.title.toLowerCase().includes(query.toLowerCase()) ||
      s.artist.toLowerCase().includes(query.toLowerCase()) ||
      s.genre.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 20);
  }

  
  return data || dbGetAllSingles().filter(s =>
    s.title.toLowerCase().includes(query.toLowerCase()) ||
    s.artist.toLowerCase().includes(query.toLowerCase()) ||
    s.genre.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 20);
}
