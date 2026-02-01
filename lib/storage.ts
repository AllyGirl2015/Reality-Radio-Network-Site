import { getSupabase, isSupabaseEnabled } from './supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Gera a URL pública de uma imagem no bucket 'images'
 * @param imagePath - Caminho da imagem (ex: "/America's Changed.png" ou "America's Changed.png")
 * @returns string - URL pública completa
 */
export function getImageUrl(imagePath: string): string {
  if (!imagePath) return '';

  // Se já é uma URL completa, retorna como está
  // If Supabase isn't enabled, avoid returning remote URLs that will be fetched
  // If the image is a full URL, return it regardless
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // If image exists in the local public folder (server only), return the local path to avoid remote fetches
  const fileName = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  if (typeof window === 'undefined') {
    try {
      // require Node modules at runtime to avoid bundling them into client code
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const fs = require('fs');
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const path = require('path');
      const publicPath = path.join(process.cwd(), 'public', fileName);
      const publicImagesPath = path.join(process.cwd(), 'public', 'images', fileName);

      if (fs.existsSync(publicPath)) {
        return `/${fileName}`;
      }
      if (fs.existsSync(publicImagesPath)) {
        return `/images/${fileName}`;
      }
    } catch (err) {
      // ignore fs errors and fall back to supabase behavior below
    }
  }

  // If Supabase isn't enabled, return local public path to avoid empty src
  if (!isSupabaseEnabled()) return `/${fileName}`;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.warn('Supabase URL not configured');
    return `/${fileName}`;
  }

  return `${supabaseUrl}/storage/v1/object/public/images/${encodeURIComponent(fileName)}`;
}

/**
 * Faz upload de uma imagem para o bucket 'images'
 * @param file - O arquivo de imagem a ser enviado
 * @param fileName - Nome do arquivo (opcional, será gerado se não fornecido)
 * @returns Promise<UploadResult>
 */
export async function uploadImage(file: File, fileName?: string): Promise<UploadResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase não configurado' };
  }

  // Validar tipo de arquivo
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Tipo de arquivo não permitido. Use JPEG, PNG, GIF ou WebP.' };
  }

  // Validar tamanho (10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return { success: false, error: 'Arquivo muito grande. Máximo 10MB.' };
  }

  // Gerar nome único se não fornecido
  const finalFileName = fileName || `${Date.now()}-${file.name}`;

  try {
    const { data, error } = await supabase.storage
      .from('images')
      .upload(finalFileName, file, {
        cacheControl: '3600',
        upsert: false, // Não sobrescrever arquivos existentes
      });

    if (error) {
      return { success: false, error: error.message };
    }

    // Obter URL pública
    const { data: urlData } = supabase.storage
      .from('images')
      .getPublicUrl(finalFileName);

    return { success: true, url: urlData.publicUrl };
  } catch (err) {
    return { success: false, error: 'Erro inesperado durante o upload' };
  }
}

/**
 * Remove uma imagem do bucket
 * @param fileName - Nome do arquivo a ser removido
 * @returns Promise<UploadResult>
 */
export async function deleteImage(fileName: string): Promise<UploadResult> {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase não configurado' };
  }

  try {
    const { error } = await supabase.storage
      .from('images')
      .remove([fileName]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: 'Erro inesperado durante a remoção' };
  }
}

/**
 * Lista imagens no bucket
 * @param limit - Número máximo de arquivos a retornar (padrão: 100)
 * @returns Promise<any[]>
 */
export async function listImages(limit = 100) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase não configurado');
  }

  const { data, error } = await supabase.storage
    .from('images')
    .list('', { limit });

  if (error) {
    throw error;
  }

  return data;
}