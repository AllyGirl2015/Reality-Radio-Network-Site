import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Carregar variáveis de ambiente do .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env.local');

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  try {
    const envContent = readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');

    for (const line of envLines) {
      if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        supabaseUrl = line.split('=')[1];
      } else if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
        supabaseKey = line.split('=')[1];
      }
    }
  } catch (error) {
    console.error('Erro ao ler .env.local:', error.message);
  }
}

if (!supabaseUrl || !supabaseKey) {
  console.error('Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkImages() {
  console.log('Verificando imagens dos álbuns...\n');

  const { data: albums, error } = await supabase
    .from('albums')
    .select('title, image')
    .in('title', ['Warmth of Chaos', 'Stellar Love']);

  if (error) {
    console.error('Erro ao buscar álbuns:', error);
    return;
  }

  console.log('Dados dos álbuns no banco:');
  albums.forEach(album => {
    console.log(`${album.title}: "${album.image}"`);
  });

  console.log('\nVerificando arquivos no bucket...');

  const { data: files, error: storageError } = await supabase.storage
    .from('images')
    .list('', { limit: 100 });

  if (storageError) {
    console.error('Erro ao listar arquivos:', storageError);
    return;
  }

  console.log('\nArquivos encontrados no bucket:');
  if (files.length === 0) {
    console.log('Nenhum arquivo encontrado no bucket "images"');
  } else {
    files.forEach(file => {
      console.log(`- ${file.name} (${file.metadata?.size || 0} bytes)`);
    });
  }

  console.log('\nVerificando arquivos SVG:');
  const svgFiles = files.filter(file => file.name.endsWith('.svg'));
  svgFiles.forEach(file => {
    console.log(`- ${file.name}`);
  });

  console.log('\nComparação:');
  albums.forEach(album => {
    const expectedFileName = album.image.startsWith('/') ? album.image.slice(1) : album.image;
    const found = files.some(file => file.name === expectedFileName);
    console.log(`${album.title}: esperado "${expectedFileName}" - encontrado: ${found ? 'SIM' : 'NÃO'}`);
  });
}

checkImages().catch(console.error);