# Flow Lend - Sistema de Gestão de Empréstimos

Sistema completo para gestão de empréstimos pessoais com cálculo automático de juros diários e interface responsiva.

## 🚀 Funcionalidades

### 📊 Dashboard
- Visão geral dos empréstimos e pagamentos
- Clientes com pagamentos pendentes
- Cálculo automático de valores em atraso
- Estatísticas em tempo real

### 👥 Gestão de Clientes
- Cadastro, edição e exclusão de clientes
- Configuração individual de taxas de juros diários
- Histórico completo de empréstimos

### 💰 Gestão de Empréstimos
- Cadastro de novos empréstimos
- Cálculo automático de juros diários em caso de atraso
- Controle de vencimentos e pagamentos
- Configuração personalizada de taxas por cliente

### 💳 Controle de Pagamentos
- Registro de pagamentos parciais e totais
- Cálculo inteligente de valores pendentes
- Histórico detalhado de transações

### ⚙️ Configurações do Sistema
- Personalização de nome, logo e favicon
- Configuração de cores do sistema
- Upload de arquivos para branding
- Configurações globais para todos os usuários

### 🔐 Autenticação
- Sistema de login seguro
- Acesso restrito a administradores
- Logout automático

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Icons**: Lucide React
- **State Management**: React Hooks + Context

## 📱 Design Responsivo

Interface totalmente adaptável para:
- 📱 Dispositivos móveis
- 📱 Tablets
- 💻 Desktops
- 🖥️ Telas grandes

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/ojfernandess/agicash.git
cd agicash
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# Crie um arquivo .env na raiz do projeto
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica_do_supabase
```

4. **Execute as migrações do banco**
- Acesse o SQL Editor no Supabase
- Execute os scripts SQL fornecidos na pasta `supabase/migrations/`

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

6. **Acesse a aplicação**
```
http://localhost:8080
```

## 📊 Estrutura do Banco de Dados

### Tabelas Principais
- `profiles` - Perfis de usuários
- `clientes` - Dados dos clientes
- `emprestimos` - Empréstimos realizados
- `pagamentos` - Histórico de pagamentos
- `configuracoes_juros` - Configurações de juros por cliente
- `system_config` - Configurações globais do sistema

### Funcionalidades Especiais
- **Cálculo Automático de Juros**: Sistema calcula automaticamente juros diários em caso de atraso
- **Configuração por Cliente**: Cada cliente pode ter sua própria taxa de juros
- **Configurações Globais**: Sistema personalizável com logo, cores e nome
- **Row Level Security**: Segurança a nível de linha no Supabase

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Gera build de produção
npm run preview      # Preview do build de produção
npm run lint         # Executa linter

# Supabase
npx supabase start   # Inicia Supabase local
npx supabase stop    # Para Supabase local
npx supabase status  # Status do Supabase
```

## 📁 Estrutura do Projeto

```
flow-lend-main/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── hooks/         # Custom hooks
│   ├── integrations/  # Integração com Supabase
│   ├── pages/         # Páginas da aplicação
│   └── lib/          # Utilitários
├── supabase/
│   └── migrations/   # Scripts de migração do banco
├── public/           # Arquivos estáticos
└── docs/            # Documentação adicional
```

## 🎨 Personalização

O sistema permite personalização completa:
- **Nome do Sistema**: Altere o nome exibido
- **Logo**: Upload de logo personalizada
- **Favicon**: Ícone personalizado para o navegador
- **Cores**: Paleta de cores customizável
- **Branding**: Identidade visual completa

## 🔒 Segurança

- Autenticação via Supabase Auth
- Row Level Security (RLS) ativo
- Validação de dados no frontend e backend
- Sanitização de inputs
- Controle de acesso por usuário

## 📈 Funcionalidades de Negócio

### Cálculo de Juros
- **Juros Simples**: Cálculo baseado no valor principal
- **Juros Diários**: Taxa configurável por cliente
- **Atraso Automático**: Cálculo automático em caso de atraso

### Gestão de Pagamentos
- **Pagamentos Parciais**: Sistema inteligente de abatimento
- **Controle de Vencimento**: Alertas e notificações
- **Histórico Completo**: Rastreamento de todas as transações

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte e dúvidas:
- Abra uma issue no GitHub
- Entre em contato via email

---

**Flow Lend** - Sistema completo de gestão de empréstimos pessoais 🚀
