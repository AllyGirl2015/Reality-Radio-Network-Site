# 🎵 Sistema de Preview de Músicas com Supabase

## Configuração do Supabase Storage

### 1. Criar Conta e Projeto
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Anote a **URL do projeto** e a **anon key**

### 2. Criar Bucket de Storage
1. No painel do Supabase, vá em **Storage**
2. Clique em **Create bucket**
3. Nome do bucket: `music-previews`
4. Deixe **Public** marcado
5. Clique em **Create bucket**

### 3. Fazer Upload dos Previews
1. Entre no bucket `music-previews`
2. Crie pastas organizadas:
   ```
   music-previews/
   ├── albums/
   │   ├── americas-changed/
   │   │   └── preview-30s.mp3
   │   ├── shattered-peaces/
   │   │   └── preview-30s.mp3
   │   └── barefoot-supernova/
   │       └── preview-30s.mp3
   └── singles/
       ├── chaos-country-preview.mp3
       ├── world-of-gold-preview.mp3
       └── evil-love-preview.mp3
   ```

3. Faça upload dos arquivos MP3 (30 segundos de cada música)

### 4. Obter URLs dos Arquivos
Após o upload, clique em cada arquivo e copie a URL pública.

Exemplo de URL:
```
https://[seu-projeto].supabase.co/storage/v1/object/public/music-previews/singles/chaos-country-preview.mp3
```

### 5. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[seu-projeto].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
```

### 6. Adicionar Preview URLs nas Páginas

#### Exemplo para Singles:

```tsx
// app/store/singles/chaos-country/page.tsx

export default function ChaosCoun tryPage() {
  const previewUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/music-previews/singles/chaos-country-preview.mp3`;

  return (
    <main className="min-h-screen pt-24">
      {/* ... resto do código ... */}
      
      <Section>
        <h2>Listen to a Preview</h2>
        <MusicPreviewPlayer
          trackTitle="Chaos Country"
          artist="Johnathan Gold"
          previewUrl={previewUrl}
          albumArt="/America's Changed.png"
          duration={30}
        />
      </Section>
    </main>
  );
}
```

## Criando Previews de 30 Segundos

### Usando FFmpeg (Recomendado)

```bash
# Instalar FFmpeg: https://ffmpeg.org/download.html

# Extrair 30 segundos começando em 1:00 (melhor parte da música)
ffmpeg -i musica-completa.mp3 -ss 00:01:00 -t 00:00:30 -c copy preview-30s.mp3

# Reduzir qualidade para economizar storage (opcional)
ffmpeg -i musica-completa.mp3 -ss 00:01:00 -t 00:00:30 -b:a 128k preview-30s.mp3
```

### Usando Audacity (Interface Gráfica)
1. Abra a música no Audacity
2. Selecione 30 segundos da melhor parte
3. `File > Export > Export as MP3`
4. Qualidade: 128 kbps (bom equilíbrio tamanho/qualidade)

## Políticas de Segurança (RLS)

O bucket está público por padrão, mas você pode adicionar políticas:

```sql
-- Permitir leitura pública
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'music-previews');

-- Apenas administradores podem fazer upload
CREATE POLICY "Admin Upload"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'music-previews' 
  AND auth.role() = 'service_role'
);
```

## Custos

- **Storage**: 1 GB grátis (suficiente para ~100 previews de 30s em 128kbps)
- **Bandwidth**: 2 GB/mês grátis
- **Requests**: Ilimitadas no plano grátis

### Estimativa de Uso:
- Preview 30s @ 128kbps = ~500 KB
- 50 previews = ~25 MB de storage
- 1000 plays/mês = ~500 MB de bandwidth

Bem dentro do plano grátis! 🎉

## Integração Completa

### Adicionar em Todas as Páginas de Singles:

```tsx
import MusicPreviewPlayer from '@/components/MusicPreviewPlayer';

// No component
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const previewUrl = `${SUPABASE_URL}/storage/v1/object/public/music-previews/singles/[nome-do-arquivo].mp3`;

<MusicPreviewPlayer
  trackTitle="Nome da Música"
  artist="Nome do Artista"
  previewUrl={previewUrl}
  albumArt="/capa-do-album.png"
  duration={30}
/>
```

## Analytics Integrado

O componente `MusicPreviewPlayer` já rastreia automaticamente:
- ✅ Quando um preview é tocado
- ✅ Qual música foi ouvida
- ✅ Artista associado

Tudo aparecerá no Google Analytics em:
**Events > Music > preview_track**

## Melhorias Futuras

1. **Waveform Visualization** - Mostrar forma de onda da música
2. **Playlist de Previews** - Ouvir múltiplos previews em sequência
3. **Download After Play** - CTA para comprar após ouvir
4. **Social Share** - Compartilhar preview nas redes sociais
5. **Lyrics Sync** - Letras sincronizadas com o preview

## Troubleshooting

### Erro: Preview not available
- Verifique se o arquivo existe no Supabase
- Confirme que o bucket é público
- Teste a URL diretamente no navegador

### Erro: CORS
- Adicione seu domínio nas configurações de CORS do Supabase
- Settings > API > CORS Configuration

### Erro: Failed to load preview
- Verifique se o arquivo MP3 é válido
- Tamanho máximo: 50 MB por arquivo
- Formatos aceitos: MP3, WAV, OGG

## Suporte

Documentação oficial: https://supabase.com/docs/guides/storage
