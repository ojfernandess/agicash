# Flow Lend - Sistema de Gestão de Empréstimos

Sistema completo para gestão de empréstimos pessoais com cálculo automático de juros diários e interface responsiva.

## 🚀 Deploy no Vercel

Este projeto está configurado para deploy automático no Vercel.

### 📋 Configuração Rápida

1. **Conecte o repositório** no Vercel
2. **Configure as variáveis de ambiente**:
   ```
   VITE_SUPABASE_URL=https://nxgmnnwbwroarunahfht.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54Z21ubndid3JvYXJ1bmFoZmh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMzk2MDAsImV4cCI6MjA3NDkxNTYwMH0.RlmIP4efxjWPT7E1t0kGF_65xpl1p6_wdHRRdDKR-Lw
   ```
3. **Deploy automático** será feito

### 🛠️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 📁 Estrutura do Projeto

```
├── flow-lend-main/          # Código fonte principal
│   ├── src/                # Código React/TypeScript
│   ├── supabase/           # Migrações do banco
│   └── package.json        # Dependências do projeto
├── vercel.json             # Configuração do Vercel
└── package.json            # Scripts de build
```

## 🔧 Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deploy**: Vercel

## 📖 Documentação Completa

Para documentação detalhada, veja:
- [flow-lend-main/README.md](flow-lend-main/README.md) - Documentação completa
- [flow-lend-main/DEPLOY_VERCEL.md](flow-lend-main/DEPLOY_VERCEL.md) - Guia de deploy

## 🚀 Deploy

O projeto está configurado para deploy automático no Vercel. Cada push para a branch `main` fará um novo deploy.

---

**Flow Lend** - Sistema completo de gestão de empréstimos pessoais 🚀