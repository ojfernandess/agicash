-- Script para corrigir políticas RLS e permitir acesso compartilhado
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. CORRIGIR POLÍTICAS PARA CLIENTES
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuários podem ver seus próprios clientes" ON public.clientes;
DROP POLICY IF EXISTS "Usuários podem criar seus próprios clientes" ON public.clientes;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios clientes" ON public.clientes;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios clientes" ON public.clientes;

-- Criar novas políticas para permitir acesso compartilhado
CREATE POLICY "Usuários autenticados podem ver todos os clientes"
  ON public.clientes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem criar clientes"
  ON public.clientes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar clientes"
  ON public.clientes FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar clientes"
  ON public.clientes FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- 2. CORRIGIR POLÍTICAS PARA EMPRÉSTIMOS
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuários podem ver seus próprios empréstimos" ON public.emprestimos;
DROP POLICY IF EXISTS "Usuários podem criar seus próprios empréstimos" ON public.emprestimos;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios empréstimos" ON public.emprestimos;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios empréstimos" ON public.emprestimos;

-- Criar novas políticas para permitir acesso compartilhado
CREATE POLICY "Usuários autenticados podem ver todos os empréstimos"
  ON public.emprestimos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem criar empréstimos"
  ON public.emprestimos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar empréstimos"
  ON public.emprestimos FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar empréstimos"
  ON public.emprestimos FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- 3. CORRIGIR POLÍTICAS PARA PAGAMENTOS
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuários podem ver seus próprios pagamentos" ON public.pagamentos;
DROP POLICY IF EXISTS "Usuários podem criar seus próprios pagamentos" ON public.pagamentos;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios pagamentos" ON public.pagamentos;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios pagamentos" ON public.pagamentos;

-- Criar novas políticas para permitir acesso compartilhado
CREATE POLICY "Usuários autenticados podem ver todos os pagamentos"
  ON public.pagamentos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem criar pagamentos"
  ON public.pagamentos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar pagamentos"
  ON public.pagamentos FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar pagamentos"
  ON public.pagamentos FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- 4. CORRIGIR POLÍTICAS PARA CONFIGURAÇÕES DE JUROS
-- ============================================

-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuários podem ver suas próprias configurações de juros" ON public.configuracoes_juros;
DROP POLICY IF EXISTS "Usuários podem criar suas próprias configurações de juros" ON public.configuracoes_juros;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias configurações de juros" ON public.configuracoes_juros;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias configurações de juros" ON public.configuracoes_juros;

-- Criar novas políticas para permitir acesso compartilhado
CREATE POLICY "Usuários autenticados podem ver todas as configurações de juros"
  ON public.configuracoes_juros FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem criar configurações de juros"
  ON public.configuracoes_juros FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar configurações de juros"
  ON public.configuracoes_juros FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar configurações de juros"
  ON public.configuracoes_juros FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- 5. VERIFICAÇÃO FINAL
-- ============================================

-- Verificar políticas criadas
SELECT '=== POLÍTICAS CRIADAS ===' as status;

SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('clientes', 'emprestimos', 'pagamentos', 'configuracoes_juros')
ORDER BY tablename, policyname;

-- Testar acesso
SELECT '=== TESTE DE ACESSO ===' as status;

-- Verificar se conseguimos ver todos os clientes
SELECT 
  'Clientes visíveis:' as info,
  COUNT(*) as total
FROM clientes;

-- Verificar se conseguimos ver todos os empréstimos
SELECT 
  'Empréstimos visíveis:' as info,
  COUNT(*) as total
FROM emprestimos;

-- Verificar se conseguimos ver todos os pagamentos
SELECT 
  'Pagamentos visíveis:' as info,
  COUNT(*) as total
FROM pagamentos;
