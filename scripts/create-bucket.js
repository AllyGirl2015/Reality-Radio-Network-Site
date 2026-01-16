import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Variáveis de ambiente não configuradas. Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createImagesBucket() {
  try {
    const { data, error } = await supabase.storage.createBucket('images', {
      public: true, // Torna o bucket público para acesso direto às imagens
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 10485760, // 10MB por arquivo
    });

    if (error) {
      console.error('Erro ao criar bucket:', error);
    } else {
      console.log('Bucket "images" criado com sucesso:', data);
    }
  } catch (err) {
    console.error('Erro inesperado:', err);
  }
}

createImagesBucket();