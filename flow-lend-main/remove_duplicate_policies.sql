-- Script para remover políticas duplicadas
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. VERIFICAR POLÍTICAS EXISTENTES
-- ============================================

SELECT '=== POLÍTICAS EXISTENTES ===' as status;

SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'system_config'
ORDER BY policyname;

-- ============================================
-- 2. REMOVER POLÍTICAS DUPLICADAS
-- ============================================

-- Remover políticas com nomes longos que podem estar causando conflito
DROP POLICY IF EXISTS "Todos os usuários autenticados podem ver configurações do sistema" ON public.system_config;
DROP POLICY IF EXISTS "Todos os usuários autenticados podem criar configurações do sistema" ON public.system_config;
DROP POLICY IF EXISTS "Todos os usuários autenticados podem atualizar configurações do sistema" ON public.system_config;
DROP POLICY IF EXISTS "Todos os usuários autenticados podem deletar configurações do sistema" ON public.system_config;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Usuários podem ver suas próprias configurações" ON public.system_config;
DROP POLICY IF EXISTS "Usuários podem criar suas próprias configurações" ON public.system_config;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias configurações" ON public.system_config;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias configurações" ON public.system_config;

-- ============================================
-- 3. CRIAR POLÍTICAS SIMPLES
-- ============================================

-- Criar políticas com nomes mais curtos
CREATE POLICY "global_select"
  ON public.system_config FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "global_insert"
  ON public.system_config FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "global_update"
  ON public.system_config FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "global_delete"
  ON public.system_config FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- 4. VERIFICAÇÃO FINAL
-- ============================================

-- Verificar políticas criadas
SELECT '=== POLÍTICAS FINAIS ===' as status;

SELECT 
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'system_config'
ORDER BY policyname;

-- Testar acesso
SELECT '=== TESTE DE ACESSO ===' as status;

SELECT 
  'Configurações visíveis:' as info,
  COUNT(*) as total
FROM system_config;
