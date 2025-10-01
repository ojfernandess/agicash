# 🚀 Deploy no Vercel - Flow Lend

Guia completo para fazer deploy do Flow Lend no Vercel.

## 📋 Pré-requisitos

- Conta no Vercel
- Projeto no Supabase configurado
- Repositório no GitHub

## 🔧 Configuração no Vercel

### 1. Conectar Repositório

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Conecte sua conta do GitHub
4. Selecione o repositório `ojfernandess/agicash`
5. Clique em "Import"

### 2. Configurar Build Settings

O Vercel deve detectar automaticamente:
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 3. Configurar Variáveis de Ambiente

No dashboard do Vercel:

1. Vá para **Settings** → **Environment Variables**
2. Adicione as seguintes variáveis:

```
VITE_SUPABASE_URL=https://nxgmnnwbwroarunahfht.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54Z21ubndid3JvYXJ1bmFoZmh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMzk2MDAsImV4cCI6MjA3NDkxNTYwMH0.RlmIP4efxjWPT7E1t0kGF_65xpl1p6_wdHRRdDKR-Lw
```

**Importante**: Substitua pelos seus próprios valores do Supabase!

### 4. Configurar Domínio (Opcional)

1. Vá para **Settings** → **Domains**
2. Adicione seu domínio personalizado se desejar

## 🗄️ Configuração do Supabase

### 1. Executar Migrações

Antes do deploy, execute no SQL Editor do Supabase:

```sql
-- Execute os scripts na ordem:
-- 1. fix_save_issue.sql
-- 2. setup_storage.sql
-- 3. complete_system_setup.sql
```

### 2. Configurar Storage

1. No Supabase, vá para **Storage**
2. Crie um bucket chamado `system-assets`
3. Configure as políticas RLS conforme o script `setup_storage.sql`

### 3. Configurar RLS

Execute o script `fix_user_access.sql` para permitir acesso global aos dados.

## 🚀 Deploy

### Deploy Automático

Após conectar o repositório:
1. O Vercel fará deploy automaticamente
2. Cada push para `main` fará um novo deploy
3. Você receberá uma URL única para cada deploy

### Deploy Manual

1. No dashboard do Vercel
2. Clique em **Deployments**
3. Clique em **Redeploy** no último deploy

## 🔍 Verificação Pós-Deploy

### 1. Testar Funcionalidades

- ✅ Login funciona
- ✅ Dashboard carrega
- ✅ Clientes são exibidos
- ✅ Empréstimos são exibidos
- ✅ Configurações do sistema funcionam

### 2. Verificar Logs

Se houver problemas:
1. Vá para **Functions** → **View Function Logs**
2. Verifique erros no console do navegador

### 3. Testar Responsividade

- 📱 Mobile
- 📱 Tablet
- 💻 Desktop

## 🐛 Solução de Problemas

### Erro 404

Se ainda estiver dando 404:

1. **Verifique o `vercel.json`**:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

2. **Verifique as variáveis de ambiente**
3. **Faça um novo deploy**

### Erro de Build

1. **Verifique os logs de build** no Vercel
2. **Teste localmente**:
```bash
npm run build
npm run preview
```

### Erro de Conexão com Supabase

1. **Verifique as variáveis de ambiente**
2. **Teste a conexão** no console do navegador
3. **Verifique as políticas RLS** no Supabase

## 📊 Monitoramento

### Analytics

1. Vá para **Analytics** no Vercel
2. Monitore performance e erros

### Logs

1. **Functions** → **View Function Logs**
2. Monitore erros em tempo real

## 🔄 Atualizações

Para atualizar o sistema:

1. **Faça push** para o GitHub
2. **O Vercel fará deploy automático**
3. **Teste** a nova versão

## 📞 Suporte

Se houver problemas:

1. Verifique os logs do Vercel
2. Teste localmente primeiro
3. Verifique as configurações do Supabase
4. Consulte a documentação do Vercel

---

**Flow Lend** - Deploy no Vercel configurado! 🚀
