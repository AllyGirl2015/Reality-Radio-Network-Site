# Live365 Player - Guia de Implementação

## 🎵 Componentes Disponíveis

### 1. `Live365Player` (Recomendado)
Componente principal usando o formato de embed recomendado do Live365.

**Localização:** `components/Live365Player.tsx`

**Uso:**
```tsx
import Live365Player from '@/components/Live365Player';

<Live365Player
  stationId="a47993"
  stationName="Reality Central Radio"
  height={300}
  width="100%"
/>
```

**Props:**
- `stationId` (string): ID da estação no Live365 (padrão: "a47993")
- `stationName` (string): Nome exibido da estação
- `height` (number): Altura do player em pixels (padrão: 250)
- `width` (number | string): Largura do player (padrão: "100%")

---

### 2. `Live365PlayerAlt` (Alternativo)
Componente com múltiplos formatos de embed para testes.

**Localização:** `components/Live365PlayerAlt.tsx`

**Uso:**
```tsx
import Live365PlayerAlt from '@/components/Live365PlayerAlt';

<Live365PlayerAlt
  stationId="a47993"
  stationName="Reality Central Radio"
  embedType="popout"
  height={250}
/>
```

**Props:**
- `stationId` (string): ID da estação
- `stationName` (string): Nome da estação
- `embedType` ('popout' | 'standard' | 'mini'): Tipo de embed
- `height` (number): Altura do player

**Formatos de Embed:**

1. **popout** (Recomendado)
   - URL: `https://live365.com/embed/popout?l=a47993`
   - Melhor para integração em sites
   - Player completo com controles

2. **standard**
   - URL: `https://player.live365.com/a47993`
   - Player padrão do Live365
   - Interface full-featured

3. **mini**
   - URL: `https://live365.com/embed/mini?l=a47993`
   - Player compacto
   - Menor altura recomendada

---

## 📍 Onde Está Sendo Usado

### Home Page (`app/page.tsx`)
```tsx
<Live365Player
  stationId="a47993"
  stationName="Reality Central Radio"
  height={300}
/>
```

Seção: Hero → "Listen Live" (#listen)

---

## 🔧 Solução de Problemas

### Player Não Carrega
1. **Verificar Station ID**: Confirme que `a47993` é o ID correto
2. **Testar Formato Alternativo**: Use `Live365PlayerAlt` com `embedType="standard"`
3. **Verificar CORS**: Live365 pode bloquear alguns domínios

### Player Não Reproduz Automaticamente
- O atributo `allow="autoplay"` está configurado
- Navegadores modernos bloqueiam autoplay sem interação do usuário
- Usuário precisa clicar no play

### Altura Incorreta
- Ajuste o prop `height` conforme necessário
- Popout: 250-300px recomendado
- Mini: 150-200px recomendado
- Standard: 300-400px recomendado

---

## 🎨 Customização do Design

O player está envolvido em `.card-neon` com:
- Border neon azul (`border-[#00f3ff]/30`)
- Background preto
- Badge "LIVE NOW" com efeito neon
- Link para Live365 no rodapé

Para modificar o estilo, edite os arquivos dos componentes ou adicione classes Tailwind.

---

## 🌐 Links Importantes

- **Estação na Live365:** https://live365.com/station/201-5-Reality-Central-Radio-a47993
- **Documentação Live365:** https://live365.com/station/help
- **Station ID:** a47993

---

## 💡 Dicas

### Teste em Diferentes Navegadores
- Chrome/Edge: Geralmente funciona bem
- Firefox: Pode ter restrições de autoplay
- Safari: Restrições estritas de autoplay

### Fallback para Usuários Sem JavaScript
O `Live365PlayerAlt` inclui um `<noscript>` com link direto para Live365.

### Performance
- O iframe carrega conteúdo externo
- Pode afetar tempo de carregamento da página
- Considere lazy loading se houver múltiplos players

### Acessibilidade
- Todos os iframes têm `title` descritivo
- Links com `aria-label` apropriados
- Badge "LIVE NOW" tem emoji 🔴 para contexto visual

---

## 🔄 Trocar Entre Componentes

**De Live365Player para Live365PlayerAlt:**

```tsx
// Antes
import Live365Player from '@/components/Live365Player';
<Live365Player ... />

// Depois
import Live365PlayerAlt from '@/components/Live365PlayerAlt';
<Live365PlayerAlt embedType="standard" ... />
```

**Testar Todos os Formatos:**
```tsx
{/* Popout - Recomendado */}
<Live365PlayerAlt embedType="popout" height={250} />

{/* Standard - Player Full */}
<Live365PlayerAlt embedType="standard" height={350} />

{/* Mini - Compacto */}
<Live365PlayerAlt embedType="mini" height={180} />
```

---

## ✅ Checklist de Implementação

- [x] Componente `Live365Player` criado
- [x] Componente alternativo `Live365PlayerAlt` criado
- [x] Integrado na home page
- [x] Station ID correto (`a47993`)
- [x] Atributo `allow="autoplay"` configurado
- [x] Link de fallback para Live365
- [x] Acessibilidade (title, aria-label)
- [x] Design neon integrado
- [ ] Testar em produção/Netlify
- [ ] Confirmar reprodução em diferentes navegadores

---

## 📞 Suporte

Se o player não funcionar após deploy:
1. Verificar console do navegador para erros
2. Testar URL do iframe diretamente no navegador
3. Entrar em contato com suporte do Live365 se necessário
4. Considerar player HTML5 alternativo como fallback

---

**Última atualização:** 11 de novembro de 2025
