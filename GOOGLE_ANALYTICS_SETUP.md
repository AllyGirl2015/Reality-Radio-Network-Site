# 📊 Guia de Configuração do Google Analytics 4

## Configuração Inicial

### 1. Criar Conta Google Analytics
1. Acesse [analytics.google.com](https://analytics.google.com)
2. Clique em "Start measuring" ou "Começar a medir"
3. Preencha os dados da conta:
   - Nome da conta: **Reality Radio Network**
   - Dados da propriedade:
     - Nome: **RRN Website**
     - Fuso horário: Seu fuso horário
     - Moeda: USD ou sua moeda local

### 2. Configurar Fluxo de Dados (Data Stream)
1. Selecione **Web** como plataforma
2. Preencha:
   - URL do site: `https://www.realityradionetwork.com`
   - Nome do stream: **Reality Radio Website**
3. Ative **Enhanced measurement** (métricas aprimoradas)
4. Clique em **Create stream**

### 3. Copiar o Measurement ID
Você verá um ID no formato `G-XXXXXXXXXX`. Copie este ID!

### 4. Adicionar ao Projeto
Crie ou edite o arquivo `.env.local`:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**⚠️ IMPORTANTE:** Nunca commite o `.env.local` no Git!

### 5. Deploy no Netlify/Vercel
Adicione a variável de ambiente na plataforma:

**Netlify:**
- Site Settings > Environment > Environment Variables
- Key: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- Value: `G-XXXXXXXXXX`

**Vercel:**
- Project Settings > Environment Variables
- Name: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- Value: `G-XXXXXXXXXX`

## Eventos Rastreados Automaticamente

### 📄 Pageviews
- Rastreamento automático de todas as páginas visitadas
- Caminho completo (pathname + query params)
- Título da página

### 🎵 Eventos de Música
```typescript
// Visualização de álbum
trackAlbumView("America's Changed", "Johnathan Gold");

// Visualização de single
trackSingleView("Chaos Country", "Johnathan Gold");

// Preview tocado
trackMusicPreview("Chaos Country", "Johnathan Gold");
```

### 👤 Eventos de Artistas
```typescript
// Visualização de página de artista
trackArtistView("Johnathan Gold");
```

### 📻 Eventos de Rádio
```typescript
// Play de estação de rádio
trackRadioPlay("Reality Central Radio");
```

### 🛒 Eventos de E-commerce
```typescript
// Intenção de compra
trackPurchaseIntent("album", "America's Changed", "$8.99");
```

### 📧 Eventos de Engajamento
```typescript
// Cadastro em newsletter
trackNewsletterSignup("footer");

// Envio de formulário de contato
trackContactForm("general_inquiry");
```

### 🔍 Eventos de Busca
```typescript
// Busca realizada
trackSearch("chaos country", ["singles", "albums"]);
```

### 🔗 Eventos de Links
```typescript
// Click em link externo
trackOutboundLink("https://live365.com", "Live365 Player");

// Click em rede social
trackSocialClick("instagram", "footer");
```

### 📥 Downloads
```typescript
// Download de arquivo
trackDownload("pdf", "press-kit.pdf");
```

## Relatórios Personalizados

### 1. Relatório de Músicas Mais Ouvidas

**Google Analytics > Reports > Engagement > Events**

Filtrar por:
- Event name: `preview_track`
- Agrupar por: `event_label`

Você verá ranking das músicas mais ouvidas!

### 2. Relatório de Artistas Populares

Filtrar por:
- Event name: `view_artist`
- Agrupar por: `event_label`

### 3. Relatório de Conversões

Criar **Conversion Event** para:
- `add_to_cart` (intenção de compra)
- `newsletter_signup` (leads capturados)
- `contact_form_submit` (contatos)

**Como criar:**
1. Admin > Events
2. Encontre o evento desejado
3. Toggle "Mark as conversion"

### 4. Funil de Conversão

**Explorations > Funnel exploration**

Exemplo de funil:
1. Visualizou álbum (`view_album`)
2. Ouviu preview (`preview_track`)
3. Adicionou ao carrinho (`add_to_cart`)
4. Completou compra (quando implementar)

## Dashboards Recomendados

### Dashboard "Músicas e Artistas"
- Top 10 músicas com preview
- Top 10 artistas visualizados
- Taxa de conversão preview → compra
- Estações de rádio mais ouvidas

### Dashboard "Engajamento"
- Cadastros de newsletter por página
- Formulários de contato enviados
- Buscas mais populares
- Clicks em redes sociais

### Dashboard "E-commerce"
- Intenções de compra por produto
- Preço médio dos itens no carrinho
- Taxa de abandono de carrinho
- Receita (quando implementar pagamento)

## Metas e KPIs Sugeridos

### Curto Prazo (0-3 meses)
- ✅ 1000 pageviews/mês
- ✅ 100 cadastros newsletter/mês
- ✅ 50 previews ouvidos/semana
- ✅ 10 intenções de compra/semana

### Médio Prazo (3-6 meses)
- 🎯 5000 pageviews/mês
- 🎯 500 cadastros newsletter/mês
- 🎯 200 previews/semana
- 🎯 50 vendas/mês (quando implementar)

### Longo Prazo (6-12 meses)
- 🚀 10,000 pageviews/mês
- 🚀 1000 cadastros newsletter/mês
- 🚀 500 previews/semana
- 🚀 200 vendas/mês

## Integrações Avançadas

### 1. Google Search Console
Conecte o GA4 ao Search Console para ver:
- Queries de busca orgânica
- Posição média nos resultados
- CTR do Google

### 2. Google Ads (Futuro)
Quando começar a anunciar:
- Import conversion events
- Track ROAS (Return on Ad Spend)
- Remarketing audiences

### 3. Facebook Pixel (Futuro)
Para anúncios no Facebook/Instagram:
```tsx
// Adicionar ao layout.tsx similar ao GA
import FacebookPixel from '@/components/FacebookPixel';
```

## Privacidade e GDPR

### Cookie Consent
O site já tem `CookieBanner` implementado. O GA4 só é inicializado após o consentimento.

### Anonimizar IPs
GA4 já faz isso automaticamente! ✅

### Data Retention
Recomendado: **14 meses** (default)

Configure em:
**Admin > Data Settings > Data Retention**

### Opt-out
Usuários podem opt-out via cookie banner.

## Testes e Validação

### 1. Testar em Desenvolvimento
```bash
# Rodar o site localmente
npm run dev

# Abrir no navegador
# Abrir DevTools > Console
# Verificar chamadas gtag()
```

### 2. Google Analytics Debugger
Instale a extensão do Chrome:
[GA Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/)

### 3. Realtime Report
Acesse **Reports > Realtime** no GA4 e navegue pelo site.
Você deve ver suas ações em tempo real!

### 4. Validar Eventos
```tsx
// Adicionar temporariamente para debug
console.log('Event tracked:', { action, category, label });
```

## Troubleshooting

### Não vejo dados no GA4
- ✅ Verificar se o Measurement ID está correto
- ✅ Confirmar que `.env.local` foi criado
- ✅ Aguardar até 24h (dados podem demorar)
- ✅ Testar em modo Realtime primeiro
- ✅ Verificar se ad-blockers estão desativados

### Eventos não aparecem
- ✅ Verificar console do navegador por erros
- ✅ Confirmar que `window.gtag` está definido
- ✅ Eventos customizados podem demorar 24-48h para aparecer

### Contagem duplicada
- ✅ Verificar se não há múltiplos tags GA no site
- ✅ Confirmar que o componente Analytics só é renderizado uma vez

## Relatórios para Apresentar

### Para Investidores
- **User Growth** - Crescimento mensal de usuários
- **Engagement Rate** - Taxa de engajamento
- **Conversion Rate** - Taxa de conversão

### Para Artistas (Persona Adopters)
- **Artist Page Views** - Visualizações da página do artista
- **Music Previews** - Quantas vezes suas músicas foram ouvidas
- **Purchase Intent** - Quantas pessoas tentaram comprar

### Para Equipe Interna
- **Full Analytics Dashboard** - Acesso completo
- **Weekly Reports** - Relatório semanal automatizado
- **A/B Test Results** - Resultados de testes

## Automatizações

### Email Semanal Automático
Configure em **Admin > Property > Email Notifications**

Sugestões:
- Weekly summary report (toda segunda às 9h)
- Spike alerts (picos de tráfego)
- Custom insights

### Alertas Personalizados
**Admin > Custom Alerts**

Exemplos:
- 🔔 Se pageviews caírem >50% em um dia
- 🔔 Se newsletter signups >100 em um dia
- 🔔 Se taxa de erro de preview >10%

## Recursos Adicionais

- [GA4 Documentation](https://support.google.com/analytics/answer/9304153)
- [GA4 Academy](https://analytics.google.com/analytics/academy/)
- [Measure Protocol](https://developers.google.com/analytics/devguides/collection/protocol/ga4)
- [Data Studio](https://datastudio.google.com) - Dashboards avançados

---

**✨ Seu analytics está pronto!** Todos os eventos estão rastreando automaticamente. Agora é só configurar o Measurement ID e começar a coletar dados! 🚀
