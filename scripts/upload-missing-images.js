import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Carregar variáveis de ambiente do .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  try {
    const envContent = readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');

    for (const line of envLines) {
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        supabaseUrl = line.split('=')[1];
      } else if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=') && !line.startsWith('#')) {
        supabaseServiceKey = line.split('=')[1];
      } else if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
        supabaseAnonKey = line.split('=')[1];
      }
    }
  } catch (error) {
    console.error('Erro ao ler .env.local:', error.message);
  }
}

if (!supabaseUrl) {
  console.error('NEXT_PUBLIC_SUPABASE_URL não encontrada');
  process.exit(1);
}

if (!supabaseServiceKey && supabaseAnonKey) {
  console.log('SUPABASE_SERVICE_ROLE_KEY não encontrada, usando ANON_KEY (pode não funcionar para upload)');
  supabaseServiceKey = supabaseAnonKey;
}

if (!supabaseServiceKey) {
  console.error('Nenhuma chave do Supabase encontrada');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function uploadMissingImages() {
  const imagesToUpload = [
    'Stellar Love.svg',
    'Warmth of Chaos.svg'
  ];

  console.log('Fazendo upload das imagens faltantes...\n');

  for (const imageName of imagesToUpload) {
    const imagePath = join(__dirname, '..', 'public', imageName);

    try {
      // Ler o arquivo
      const fileBuffer = readFileSync(imagePath);
      const file = new File([fileBuffer], imageName, { type: 'image/svg+xml' });

      console.log(`Enviando ${imageName}...`);

      // Fazer upload
      const { data, error } = await supabase.storage
        .from('images')
        .upload(imageName, file, {
          cacheControl: '3600',
          upsert: true, // Sobrescrever se já existir
        });

      if (error) {
        console.error(`Erro ao enviar ${imageName}:`, error.message);
      } else {
        console.log(`✅ ${imageName} enviado com sucesso`);
      }
    } catch (err) {
      console.error(`Erro ao processar ${imageName}:`, err.message);
    }
  }

  console.log('\nVerificando upload...');
  const { data: files, error } = await supabase.storage
    .from('images')
    .list('', { limit: 50 });

  if (error) {
    console.error('Erro ao listar arquivos:', error);
  } else {
    console.log('Arquivos no bucket após upload:');
    files.forEach(file => {
      if (imagesToUpload.some(img => file.name === img)) {
        console.log(`✅ ${file.name}`);
      }
    });
  }
}

uploadMissingImages().catch(console.error);