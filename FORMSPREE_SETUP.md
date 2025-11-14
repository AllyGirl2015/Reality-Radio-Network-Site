# 📧 Guia de Configuração do Formspree

## O que é Formspree?

Formspree é um serviço que permite receber emails de formulários HTML sem precisar de backend. É perfeito para sites estáticos e Next.js!

## Configuração Rápida

### 1. Criar Conta no Formspree
1. Acesse [formspree.io](https://formspree.io)
2. Clique em "Get Started" ou "Sign Up"
3. Crie uma conta gratuita (Gmail login funciona)

### 2. Criar um Novo Form
1. No dashboard, clique em "+ New Form"
2. Preencha:
   - **Name:** Reality Radio Contact Form
   - **Email:** Seu email onde quer receber as mensagens (ex: support@realityradionetwork.com)
3. Clique em "Create Form"

### 3. Copiar o Form ID
Após criar, você verá um ID único no formato:
```
https://formspree.io/f/xyzabc123
```

O ID é a parte depois de `/f/` → `xyzabc123`

### 4. Adicionar ao Site

Abra o arquivo `app/contact/page.tsx` e substitua:

```tsx
// ANTES:
<form 
  action="https://formspree.io/f/YOUR_FORM_ID" 
  method="POST"
  ...
>

// DEPOIS (com seu ID):
<form 
  action="https://formspree.io/f/xyzabc123" 
  method="POST"
  ...
>
```

### 5. Testar o Formulário

1. Faça deploy do site ou rode localmente (`npm run dev`)
2. Vá para a página `/contact`
3. Preencha e envie o formulário
4. Na primeira vez, o Formspree vai pedir confirmação
5. Clique no link de confirmação no email
6. Pronto! Agora você receberá todos os contatos por email

## Plano Gratuito

✅ **O que você tem de graça:**
- 50 submissions/mês
- Emails ilimitados
- Spam protection básico
- Upload de arquivos (até 10MB)
- Notificações por email

❌ **Limitações do plano free:**
- Logo "Powered by Formspree" no email
- Sem integrações avançadas
- Sem equipe/colaboradores

💡 **Suficiente para começar!** 50 mensagens/mês é mais que o suficiente para os primeiros meses.

## Recursos do Formspree Já Configurados

### 1. Campos do Formulário
O formulário já está configurado com os campos:
- `name` - Nome do usuário
- `email` - Email do usuário
- `subject` - Assunto
- `category` - Tipo de consulta (dropdown)
- `message` - Mensagem

### 2. Validação
- Campos obrigatórios marcados com `required`
- Validação de email automática (`type="email"`)
- ARIA labels para acessibilidade

### 3. Proteção Anti-Spam
Formspree já inclui:
- reCAPTCHA invisível
- Honeypot protection
- Rate limiting

## Configurações Recomendadas

### 1. Customizar Email de Notificação

No dashboard do Formspree:
1. Clique no seu form
2. Settings > Email Notifications
3. Customize:
   - **Subject line:** `[RRN Contact] {{subject}}`
   - **Reply-To:** Use `{{email}}` (email do usuário)

Exemplo de template:
```
New contact from Reality Radio Network

Name: {{name}}
Email: {{email}}
Category: {{category}}

Subject: {{subject}}

Message:
{{message}}

---
Sent via Reality Radio Network Contact Form
```

### 2. Autoresponder (Email Automático para o Usuário)

Settings > Autoresponder:

```
Subject: Thanks for contacting Reality Radio Network!

Hi {{name}},

Thank you for reaching out to Reality Radio Network! 

We've received your message about "{{subject}}" and Alissa will 
get back to you as soon as possible.

In the meantime, feel free to:
- Listen to our radio: https://realityradionetwork.com/radio
- Check out our artists: https://realityradionetwork.com/artists
- Browse our store: https://realityradionetwork.com/store

Have a great day!

— Reality Radio Network Team
```

### 3. Redirecionamento Após Envio

Para redirecionar usuários após o envio, adicione um campo oculto:

```tsx
<form 
  action="https://formspree.io/f/xyzabc123" 
  method="POST"
  ...
>
  {/* Redireciona para página de obrigado após envio */}
  <input type="hidden" name="_next" value="https://realityradionetwork.com/contact/thanks" />
  
  {/* Assunto do email customizado */}
  <input type="hidden" name="_subject" value="New RRN Contact Form Submission" />
  
  {/* Seus outros campos aqui */}
  ...
</form>
```

### 4. Proteção Extra Anti-Spam

Adicione um honeypot (campo invisível que bots preenchem):

```tsx
<div style={{ display: 'none' }}>
  <label htmlFor="honeypot">Don't fill this out if you're human</label>
  <input type="text" name="_gotcha" id="honeypot" />
</div>
```

## Página de Agradecimento (Opcional)

Crie `app/contact/thanks/page.tsx`:

```tsx
import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import Section from '@/components/Section';

export const metadata: Metadata = {
  title: 'Message Sent | Reality Radio Network',
  description: 'Thank you for contacting Reality Radio Network.',
};

export default function ContactThanksPage() {
  return (
    <main className="min-h-screen pt-24">
      <Section>
        <div className="max-w-2xl mx-auto text-center">
          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Message Sent!
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-4">
            Thanks for reaching out! We'll get back to you as soon as possible.
          </p>
          <p className="text-gray-400 mb-8">
            Typically within 24-48 hours.
          </p>
          <Link
            href="/"
            className="btn-neon inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </Section>
    </main>
  );
}
```

## Upgrade para Plano Pago (Futuro)

Quando o site crescer, considere upgrade para:

**Gold Plan - $10/mês:**
- 1000 submissions/mês
- Sem branding Formspree
- File uploads ilimitados
- Webhooks
- Integrações (Slack, Discord, etc.)

**Platinum Plan - $40/mês:**
- 10,000 submissions/mês
- Tudo do Gold
- Múltiplos usuários
- Priority support

## Alternativas ao Formspree

Se preferir outras opções:

1. **Netlify Forms** (se hospedar no Netlify)
   - 100 submissions/mês grátis
   - Integração nativa

2. **SendGrid** (mais técnico)
   - API de email
   - 100 emails/dia grátis

3. **EmailJS** (client-side)
   - 200 requests/mês grátis
   - JavaScript puro

4. **Resend** (moderno, para devs)
   - 3,000 emails/mês grátis
   - API simples

## Troubleshooting

### Não recebi o email de teste
- ✅ Verifique spam/lixo eletrônico
- ✅ Confirme que clicou no link de ativação
- ✅ Verifique o email cadastrado no Formspree

### Erro 403 Forbidden
- ✅ Form ID incorreto
- ✅ Verificar se copiou o ID completo

### Campos não aparecem no email
- ✅ Verificar atributo `name` nos inputs
- ✅ Confirmar que form está enviando via POST

### Spam demais
- ✅ Ativar reCAPTCHA no dashboard
- ✅ Adicionar honeypot field
- ✅ Considerar plano pago com spam filters avançados

## Recursos Adicionais

- [Formspree Documentation](https://help.formspree.io/)
- [Formspree React Library](https://formspree.io/react) (para forms mais avançados)
- [Formspree Status](https://status.formspree.io/)

---

**✨ Seu formulário está pronto!** Agora é só:
1. Criar conta no Formspree
2. Copiar o Form ID
3. Substituir em `app/contact/page.tsx`
4. Testar! 🚀
