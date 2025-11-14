# Configuração do Blog com Netlify CMS

Este projeto agora inclui um sistema de blog completo com Netlify CMS para gerenciamento de conteúdo fácil.

## 🎯 Recursos do Blog

- ✅ **Interface de administração** em `/admin`
- ✅ **Editor visual** com preview em tempo real
- ✅ **Upload de imagens** diretamente pelo CMS
- ✅ **Tags e categorização** para organizar posts
- ✅ **Markdown** para formatação rica de conteúdo
- ✅ **Integração Git** - todos os posts são versionados

## 🚀 Como Usar o CMS (Pós-Deploy)

### 1. Habilitar Netlify Identity

Após fazer o deploy no Netlify:

1. Acesse o painel do Netlify
2. Vá em **Site settings** → **Identity**
3. Clique em **Enable Identity**
4. Em **Registration preferences**, escolha **Invite only** (mais seguro)
5. Em **External providers**, você pode habilitar login com Google/GitHub se desejar
6. Em **Services** → **Git Gateway**, clique em **Enable Git Gateway**

### 2. Convidar Usuários

1. No painel do Netlify, vá em **Identity**
2. Clique em **Invite users**
3. Digite os emails de quem poderá gerenciar o blog
4. Os usuários receberão um email de convite

### 3. Acessar o Painel Admin

1. Acesse `https://seu-site.netlify.app/admin`
2. Faça login com as credenciais do Netlify Identity
3. Pronto! Você pode começar a criar posts

## 📝 Criando um Novo Post

No painel admin (`/admin`):

1. Clique em **Blog Posts** → **New Blog Posts**
2. Preencha os campos:
   - **Título**: Título do post
   - **Data de Publicação**: Data e hora
   - **Slug**: URL amigável (ex: `meu-primeiro-post`)
   - **Imagem Destacada**: Upload da imagem principal
   - **Resumo**: Descrição curta para a listagem
   - **Conteúdo**: Texto completo em Markdown
   - **Tags**: Palavras-chave (ex: `Música IA`, `Tutoriais`)
   - **Autor**: Nome do autor
   - **Publicado**: Marque para publicar imediatamente
3. Clique em **Publish**
4. O post será commitado no Git e aparecerá no site automaticamente!

## 📁 Estrutura de Arquivos

```
content/blog/              # Posts em Markdown
  2025-01-15-exemplo.md    # Arquivo do post
  
public/uploads/            # Imagens enviadas pelo CMS
  imagem1.jpg
  imagem2.png

public/admin/              # Interface do CMS
  config.yml               # Configuração do Netlify CMS
  index.html               # Página do admin
```

## 🎨 Formato dos Posts

Os posts são salvos em Markdown com frontmatter:

```markdown
---
title: "Título do Post"
date: 2025-01-15T10:00:00.000Z
slug: "titulo-do-post"
featuredImage: "/uploads/imagem.jpg"
excerpt: "Breve descrição..."
tags:
  - Tag 1
  - Tag 2
author: "Nome do Autor"
published: true
---

# Conteúdo do Post

Seu conteúdo em **Markdown** aqui...
```

## 🔧 Desenvolvimento Local

Para testar o CMS localmente:

```bash
npx netlify-cms-proxy-server
```

Em outro terminal:

```bash
npm run dev
```

Acesse `http://localhost:3000/admin`

## 🌐 URLs do Blog

- **Listagem**: `/blog` - Todos os posts publicados
- **Post individual**: `/blog/[slug]` - Post específico
- **Admin**: `/admin` - Painel de controle (requer autenticação)

## 🎯 Próximos Passos

Após o deploy:

1. ✅ Habilite Netlify Identity
2. ✅ Ative o Git Gateway
3. ✅ Convide usuários para gerenciar o blog
4. ✅ Crie seu primeiro post em `/admin`
5. ✅ Compartilhe com o mundo!

## 📚 Recursos Adicionais

- [Documentação Netlify CMS](https://www.netlifycms.org/docs/)
- [Markdown Guide](https://www.markdownguide.org/)
- [Netlify Identity](https://docs.netlify.com/visitor-access/identity/)
