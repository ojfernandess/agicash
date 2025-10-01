-- Script simples para corrigir acesso entre usuários
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. CORRIGIR POLÍTICAS PARA CLIENTES
-- ============================================

-- Remover políticas antigas que isolam por usuário
DROP POLICY IF EXISTS "Usuários podem ver seus próprios clientes" ON public.clientes;
DROP POLICY IF EXISTS "Usuários podem criar seus próprios clientes" ON public.clientes;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios clientes" ON public.clientes;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios clientes" ON public.clientes;

-- Criar políticas que permitem acesso a todos os usuários autenticados
CREATE POLICY "Todos os usuários autenticados podem ver clientes"
  ON public.clientes FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Todos os usuários autenticados podem criar clientes"
  ON public.clientes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Todos os usuários autenticados podem atualizar clientes"
  ON public.clientes FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Todos os usuários autenticados podem deletar clientes"
  ON public.clientes FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- 2. CORRIGIR POLÍTICAS PARA EMPRÉSTIMOS
-- ============================================

-- Remover políticas antigas que isolam por usuário
DROP POLICY IF EXISTS "Usuários podem ver seus próprios empréstimos" ON public.emprestimos;
DROP POLICY IF EXISTS "Usuários podem criar seus próprios empréstimos" ON public.emprestimos;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios empréstimos" ON public.emprestimos;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios empréstimos" ON public.emprestimos;

-- Criar políticas que permitem acesso a todos os usuários autenticados
CREATE POLICY "Todos os usuários autenticados podem ver empréstimos"
  ON public.emprestimos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Todos os usuários autenticados podem criar empréstimos"
  ON public.emprestimos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Todos os usuários autenticados podem atualizar empréstimos"
  ON public.emprestimos FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Todos os usuários autenticados podem deletar empréstimos"
  ON public.emprestimos FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- 3. CORRIGIR POLÍTICAS PARA PAGAMENTOS
-- ============================================

-- Remover políticas antigas que isolam por usuário
DROP POLICY IF EXISTS "Usuários podem ver seus próprios pagamentos" ON public.pagamentos;
DROP POLICY IF EXISTS "Usuários podem criar seus próprios pagamentos" ON public.pagamentos;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios pagamentos" ON public.pagamentos;
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios pagamentos" ON public.pagamentos;

-- Criar políticas que permitem acesso a todos os usuários autenticados
CREATE POLICY "Todos os usuários autenticados podem ver pagamentos"
  ON public.pagamentos FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Todos os usuários autenticados podem criar pagamentos"
  ON public.pagamentos FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Todos os usuários autenticados podem atualizar pagamentos"
  ON public.pagamentos FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Todos os usuários autenticados podem deletar pagamentos"
  ON public.pagamentos FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- 4. VERIFICAÇÃO FINAL
-- ============================================

-- Verificar se as políticas foram criadas corretamente
SELECT '=== POLÍTICAS CRIADAS ===' as status;

SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE tablename IN ('clientes', 'emprestimos', 'pagamentos')
ORDER BY tablename, policyname;

-- Testar se conseguimos ver todos os dados
SELECT '=== TESTE DE ACESSO ===' as status;

SELECT 
  'Clientes visíveis:' as info,
  COUNT(*) as total
FROM clientes;

SELECT 
  'Empréstimos visíveis:' as info,
  COUNT(*) as total
FROM emprestimos;

SELECT 
  'Pagamentos visíveis:' as info,
  COUNT(*) as total
FROM pagamentos;
