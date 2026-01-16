# Reality Radio Network - Backend Setup Guide

Este guia explica como configurar o backend do site usando Supabase como banco de dados.

## 📋 Visão Geral

O backend usa **Supabase** como banco de dados PostgreSQL para armazenar:
- **Artistas** - Informações sobre os artistas
- **Álbuns** - Álbuns com preços, links de compra e metadata
- **Singles** - Músicas individuais com preview e links de compra
- **Tracks** - Faixas individuais de cada álbum
- **Blogs** - Posts do blog

## 🚀 Configuração

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e crie uma conta
2. Crie um novo projeto
3. Anote as credenciais:
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **Anon Key** (API Key pública)
   - **Service Role Key** (API Key privada - NÃO expor no frontend!)

### 2. Configurar o Banco de Dados

No Supabase Dashboard, vá em **SQL Editor** e execute o conteúdo do arquivo:

```
supabase/schema.sql
```

Este script irá criar:
- Todas as tabelas necessárias
- Índices para performance
- Triggers para atualização automática de timestamps
- Políticas de segurança (RLS)
- Views e funções de busca

### 3. Configurar Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Edite o arquivo `.env.local` com suas credenciais:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui

# Admin Authentication
ADMIN_SECRET_KEY=uma_senha_super_secreta_para_admin
```

### 4. Migrar Dados Existentes (Opcional)

Se você tem dados nos arquivos JSON (`data/albums.json`, `data/singles.json`, etc.), pode usar os exemplos em `supabase/migration-examples.sql` como referência para inserir os dados no Supabase.

## 🔐 Painel Administrativo

Acesse o painel admin em: `/admin/v2`

### Funcionalidades:
- ✅ Gerenciar Artistas (criar, editar, excluir)
- ✅ Gerenciar Álbuns (criar, editar, excluir)
- ✅ Gerenciar Singles (criar, editar, excluir)
- ✅ Busca e filtros
- ✅ Preview de páginas

### Autenticação:
O painel usa a variável `ADMIN_SECRET_KEY` como senha. Configure uma senha forte!

## 📁 Estrutura de Arquivos

```
lib/
├── supabase.ts          # Cliente Supabase
├── services/
│   ├── index.ts         # Re-exportação de serviços
│   ├── artists.ts       # CRUD de artistas
│   ├── albums.ts        # CRUD de álbuns e tracks
│   └── singles.ts       # CRUD de singles

app/
├── api/v2/              # APIs REST com Supabase
│   ├── artists/route.ts
│   ├── albums/route.ts
│   ├── singles/route.ts
│   └── tracks/route.ts
├── admin/v2/page.tsx    # Painel admin
├── store/
│   ├── albums/[slug]/page.tsx   # Página dinâmica de álbum
│   └── singles/[slug]/page.tsx  # Página dinâmica de single
└── talent/[slug]/page.tsx       # Página dinâmica de artista

types/
└── database.ts          # Tipos TypeScript

supabase/
├── schema.sql           # Schema do banco de dados
└── migration-examples.sql # Exemplos de migração
```

## 🔄 Como Funciona

### Páginas Dinâmicas

Quando você adiciona um novo álbum/single/artista pelo painel admin:

1. Os dados são salvos no Supabase
2. As páginas dinâmicas (`[slug]`) buscam os dados do Supabase
3. O Next.js usa `generateStaticParams` para gerar páginas estáticas no build
4. Em produção, use `revalidate` para ISR (Incremental Static Regeneration)

### APIs

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/v2/artists` | GET | Lista todos artistas |
| `/api/v2/artists` | POST | Cria artista |
| `/api/v2/artists` | PUT | Atualiza artista |
| `/api/v2/artists?id=X` | DELETE | Remove artista |
| `/api/v2/albums` | GET | Lista todos álbuns |
| `/api/v2/albums` | POST | Cria álbum |
| `/api/v2/albums` | PUT | Atualiza álbum |
| `/api/v2/albums?id=X` | DELETE | Remove álbum |
| `/api/v2/singles` | GET | Lista todos singles |
| `/api/v2/singles` | POST | Cria single |
| `/api/v2/singles` | PUT | Atualiza single |
| `/api/v2/singles?id=X` | DELETE | Remove single |
| `/api/v2/tracks?albumId=X` | GET | Lista tracks do álbum |
| `/api/v2/tracks` | POST | Cria track(s) |

### Autenticação das APIs

Todas as operações de escrita (POST, PUT, DELETE) requerem autenticação:

```javascript
fetch('/api/v2/albums', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer SUA_ADMIN_SECRET_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(albumData)
});
```

## 🎵 URLs de Preview (R2/Cloudflare)

Para os previews de música, você pode usar Cloudflare R2 ou qualquer CDN:

1. Faça upload do arquivo MP3 para o R2
2. Obtenha a URL pública
3. Use a URL no campo `preview_url` do single ou track

Exemplo de URL:
```
https://pub-xxxxx.r2.dev/Music/Artist/Album/01%20Track.mp3
```

## 🔧 Desenvolvimento

```bash
# Instalar dependências
npm install

# Rodar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📝 Notas Importantes

1. **Segurança**: Nunca exponha a `SUPABASE_SERVICE_ROLE_KEY` no frontend
2. **RLS**: O Supabase usa Row Level Security - configure corretamente as políticas
3. **Backup**: Faça backups regulares do banco de dados
4. **Imagens**: Armazene imagens no Supabase Storage ou CDN externo

## 🆘 Solução de Problemas

### "Supabase not configured"
Verifique se as variáveis de ambiente estão corretas no `.env.local`

### "Unauthorized" no painel admin
Verifique se a senha está correta e corresponde à `ADMIN_SECRET_KEY`

### Páginas não atualizam após criar conteúdo
Em produção, você precisa configurar revalidação ou fazer rebuild
