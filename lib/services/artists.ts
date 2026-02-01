import { getSupabase, getSupabaseAdmin, isSupabaseEnabled } from '@/lib/supabase';
import { Artist, ArtistFormData, getAllArtists as dbGetAllArtists } from '@/lib/database';

// === FETCH (Public) ===
export async function getAllArtists(): Promise<Artist[]> {
  const supabase = getSupabase();
  if (!supabase) return dbGetAllArtists();
  
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching artists:', error);
    return dbGetAllArtists();
  }
  
  return data || dbGetAllArtists();
}

export async function getArtistBySlug(slug: string): Promise<Artist | null> {
  const supabase = getSupabase();
  if (!supabase) return dbGetAllArtists().find(a => a.slug === slug) || null;
  
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching artist:', error);
    return dbGetAllArtists().find(a => a.slug === slug) || null;
  }

  return data;
}

export async function getArtistById(id: string): Promise<Artist | null> {
  const supabase = getSupabase();
  if (!supabase) return dbGetAllArtists().find(a => a.id === id) || null;
  
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching artist:', error);
    return dbGetAllArtists().find(a => a.id === id) || null;
  }

  return data;
}

// === ADMIN OPERATIONS (Server-side only) ===
export async function createArtist(formData: ArtistFormData): Promise<Artist | null> {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase admin not configured');
  
  const { data, error } = await admin
    .from('artists')
    .insert({
      ...formData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating artist:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function updateArtist(id: string, formData: Partial<ArtistFormData>): Promise<Artist | null> {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase admin not configured');
  
  const { data, error } = await admin
    .from('artists')
    .update({
      ...formData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating artist:', error);
    throw new Error(error.message);
  }

  return data;
}

export async function deleteArtist(id: string): Promise<boolean> {
  const admin = getSupabaseAdmin();
  if (!admin) throw new Error('Supabase admin not configured');
  
  const { error } = await admin
    .from('artists')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting artist:', error);
    throw new Error(error.message);
  }

  return true;
}

// === UTILITY ===
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
