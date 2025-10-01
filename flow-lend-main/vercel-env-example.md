# Configuração de Variáveis de Ambiente no Vercel

Para configurar o projeto no Vercel, você precisa adicionar as seguintes variáveis de ambiente:

## Variáveis Obrigatórias

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Como Configurar no Vercel

1. Acesse o dashboard do Vercel
2. Vá para o seu projeto
3. Clique em "Settings"
4. Vá para "Environment Variables"
5. Adicione as variáveis acima

## Exemplo de Valores

```
VITE_SUPABASE_URL=https://nxgmnnwbwroarunahfht.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54Z21ubndid3JvYXJ1bmFoZmh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMzk2MDAsImV4cCI6MjA3NDkxNTYwMH0.RlmIP4efxjWPT7E1t0kGF_65xpl1p6_wdHRRdDKR-Lw
```

## Importante

- Substitua os valores pelos seus próprios do Supabase
- Certifique-se de que as variáveis estão configuradas para "Production"
- Após adicionar as variáveis, faça um novo deploy
