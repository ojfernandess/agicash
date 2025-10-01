-- Script para verificar políticas RLS da tabela system_config
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. VERIFICAR POLÍTICAS RLS
-- ============================================

SELECT '=== VERIFICANDO POLÍTICAS RLS ===' as status;

SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'system_config'
ORDER BY policyname;

-- ============================================
-- 2. VERIFICAR SE RLS ESTÁ ATIVO
-- ============================================

SELECT '=== VERIFICANDO SE RLS ESTÁ ATIVO ===' as status;

SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'system_config';

-- ============================================
-- 3. VERIFICAR PERMISSÕES DA TABELA
-- ============================================

SELECT '=== VERIFICANDO PERMISSÕES ===' as status;

SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'system_config'
  AND table_schema = 'public';

-- ============================================
-- 4. TESTAR ACESSO DIRETO À TABELA
-- ============================================

SELECT '=== TESTANDO ACESSO DIRETO ===' as status;

-- Testar SELECT
SELECT COUNT(*) as total_configs FROM system_config;

-- Testar INSERT (se possível)
-- INSERT INTO system_config (user_id, system_name, primary_color, secondary_color) 
-- VALUES (auth.uid(), 'Teste Direto', '#ff0000', '#00ff00');

-- ============================================
-- 5. VERIFICAR USUÁRIO ATUAL
-- ============================================

SELECT '=== VERIFICANDO USUÁRIO ATUAL ===' as status;

SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role,
  current_user as current_user_name;

-- ============================================
-- 6. VERIFICAR SE HÁ DADOS NA TABELA
-- ============================================

SELECT '=== VERIFICANDO DADOS NA TABELA ===' as status;

SELECT 
  id,
  user_id,
  system_name,
  logo_url,
  favicon_url,
  primary_color,
  secondary_color,
  created_at,
  updated_at
FROM system_config
ORDER BY updated_at DESC;

-- ============================================
-- 7. TESTAR FUNÇÃO GET_SYSTEM_CONFIG
-- ============================================

SELECT '=== TESTANDO GET_SYSTEM_CONFIG ===' as status;

SELECT * FROM get_system_config();
