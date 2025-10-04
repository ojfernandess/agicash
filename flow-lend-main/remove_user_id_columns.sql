-- Script para remover colunas user_id das tabelas (opcional)
-- Execute este script no SQL Editor do Supabase APENAS se quiser remover o isolamento por usuário

-- ATENÇÃO: Este script remove o isolamento por usuário completamente
-- Todos os usuários autenticados terão acesso a todos os dados

-- ============================================
-- 1. REMOVER COLUNAS USER_ID (OPCIONAL)
-- ============================================

-- Descomente as linhas abaixo se quiser remover as colunas user_id:

-- ALTER TABLE public.clientes DROP COLUMN IF EXISTS user_id;
-- ALTER TABLE public.emprestimos DROP COLUMN IF EXISTS user_id;
-- ALTER TABLE public.pagamentos DROP COLUMN IF EXISTS user_id;
-- ALTER TABLE public.configuracoes_juros DROP COLUMN IF EXISTS user_id;

-- ============================================
-- 2. ATUALIZAR CONSTRAINTS (SE REMOVER USER_ID)
-- ============================================

-- Se remover user_id, também remover constraints relacionadas:

-- ALTER TABLE public.clientes DROP CONSTRAINT IF EXISTS clientes_user_id_fkey;
-- ALTER TABLE public.emprestimos DROP CONSTRAINT IF EXISTS emprestimos_user_id_fkey;
-- ALTER TABLE public.pagamentos DROP CONSTRAINT IF EXISTS pagamentos_user_id_fkey;
-- ALTER TABLE public.configuracoes_juros DROP CONSTRAINT IF EXISTS configuracoes_juros_user_id_fkey;

-- ============================================
-- 3. ATUALIZAR UNIQUE CONSTRAINTS (SE REMOVER USER_ID)
-- ============================================

-- Se remover user_id, atualizar constraints únicos:

-- ALTER TABLE public.clientes DROP CONSTRAINT IF EXISTS clientes_user_id_cpf_key;
-- ALTER TABLE public.clientes ADD CONSTRAINT clientes_cpf_key UNIQUE (cpf);

-- ALTER TABLE public.configuracoes_juros DROP CONSTRAINT IF EXISTS configuracoes_juros_user_id_cliente_id_key;
-- ALTER TABLE public.configuracoes_juros ADD CONSTRAINT configuracoes_juros_cliente_id_key UNIQUE (cliente_id);

-- ============================================
-- 4. VERIFICAÇÃO ATUAL (SEM REMOVER COLUNAS)
-- ============================================

-- Verificar estrutura atual das tabelas
SELECT '=== ESTRUTURA ATUAL DAS TABELAS ===' as status;

SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('clientes', 'emprestimos', 'pagamentos', 'configuracoes_juros')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ============================================
-- 5. TESTE DE ACESSO COMPARTILHADO
-- ============================================

-- Verificar se todos os usuários autenticados podem ver os dados
SELECT '=== TESTE DE ACESSO COMPARTILHADO ===' as status;

-- Verificar clientes
SELECT 
  'Clientes acessíveis:' as info,
  COUNT(*) as total,
  COUNT(DISTINCT user_id) as usuarios_diferentes
FROM clientes;

-- Verificar empréstimos
SELECT 
  'Empréstimos acessíveis:' as info,
  COUNT(*) as total,
  COUNT(DISTINCT user_id) as usuarios_diferentes
FROM emprestimos;

-- Verificar pagamentos
SELECT 
  'Pagamentos acessíveis:' as info,
  COUNT(*) as total,
  COUNT(DISTINCT user_id) as usuarios_diferentes
FROM pagamentos;
