import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificar se as variáveis estão configuradas
const disableFlag = (process.env.NEXT_PUBLIC_SUPABASE_DISABLED || process.env.SUPABASE_DISABLED || '').toLowerCase();
const explicitEnableFlag = (process.env.NEXT_PUBLIC_SUPABASE_ENABLED || process.env.SUPABASE_ENABLED || '').toLowerCase();
const isExplicitlyDisabled = ['1', 'true', 'yes'].includes(disableFlag);
const isExplicitlyEnabled = ['1', 'true', 'yes'].includes(explicitEnableFlag);

// By default, disable Supabase in non-production unless explicitly enabled.
const shouldEnableByDefault = process.env.NODE_ENV === 'production' || isExplicitlyEnabled;
const isSupabaseConfigured = !isExplicitlyDisabled && shouldEnableByDefault && !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'your_supabase_project_url';

// Cliente público para o frontend (inicialização lazy)
let _supabase: SupabaseClient | null = null;

export const getSupabase = () => {
  if (!isSupabaseConfigured) {
    if (isExplicitlyEnabled) {
      console.warn('Supabase not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    }
    return null;
  }
  if (!_supabase) {
    _supabase = createClient(supabaseUrl!, supabaseAnonKey!);
  }
  return _supabase;
};

// Para compatibilidade com código existente
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseAnonKey!) : null;

// Cliente com service role para o admin (server-side only)
export const getSupabaseAdmin = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!isSupabaseConfigured || !supabaseServiceKey) {
    if (isExplicitlyEnabled) {
      console.warn('Supabase admin not configured. Please set SUPABASE_SERVICE_ROLE_KEY');
    }
    return null;
  }
  return createClient(supabaseUrl!, supabaseServiceKey);
};

// Helper para verificar se Supabase está configurado
export const isSupabaseEnabled = () => isSupabaseConfigured;
