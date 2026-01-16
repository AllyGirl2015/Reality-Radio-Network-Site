import { getSupabase } from './supabase';

// Funções de autenticação usando Supabase Auth

export async function signIn(email: string, password: string) {
  const supabase = getSupabase();
  if (!supabase) {
    return { data: null, error: { message: 'Supabase não está configurado' } };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

export async function signOut() {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: { message: 'Supabase não está configurado' } };
  }

  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  const supabase = getSupabase();
  if (!supabase) {
    return { data: { session: null }, error: null };
  }

  const { data, error } = await supabase.auth.getSession();
  return { data, error };
}

export async function getUser() {
  const supabase = getSupabase();
  if (!supabase) {
    return { data: { user: null }, error: null };
  }

  const { data, error } = await supabase.auth.getUser();
  return { data, error };
}

// Verifica se o usuário está autenticado
export async function isAuthenticated() {
  const { data } = await getSession();
  return !!data?.session;
}

// Hook para obter o token de acesso para as APIs
export async function getAccessToken() {
  const { data } = await getSession();
  return data?.session?.access_token || null;
}
