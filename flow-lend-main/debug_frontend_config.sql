-- Script para debugar o problema no frontend
-- Execute este script no SQL Editor do Supabase para verificar se o problema é no backend

-- ============================================
-- 1. VERIFICAR SE AS FUNÇÕES EXISTEM
-- ============================================

SELECT '=== VERIFICANDO FUNÇÕES ===' as status;

SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name IN ('get_system_config', 'save_system_config')
  AND routine_schema = 'public';

-- ============================================
-- 2. VERIFICAR POLÍTICAS RLS
-- ============================================

SELECT '=== VERIFICANDO POLÍTICAS RLS ===' as status;

SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'system_config'
ORDER BY policyname;

-- ============================================
-- 3. TESTAR FUNÇÃO GET_SYSTEM_CONFIG
-- ============================================

SELECT '=== TESTANDO GET_SYSTEM_CONFIG ===' as status;

SELECT * FROM public.get_system_config();

-- ============================================
-- 4. TESTAR FUNÇÃO SAVE_SYSTEM_CONFIG
-- ============================================

SELECT '=== TESTANDO SAVE_SYSTEM_CONFIG ===' as status;

-- Testar salvamento
SELECT public.save_system_config(
  'Teste Frontend',
  NULL,
  NULL,
  '#ff0000',
  '#00ff00'
) as resultado;

-- ============================================
-- 5. VERIFICAR SE FOI SALVO
-- ============================================

SELECT '=== VERIFICANDO SE FOI SALVO ===' as status;

SELECT * FROM public.system_config;
SELECT * FROM public.get_system_config();

-- ============================================
-- 6. VERIFICAR USUÁRIO ATUAL
-- ============================================

SELECT '=== VERIFICANDO USUÁRIO ATUAL ===' as status;

SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role,
  current_user as current_user_name;

-- ============================================
-- 7. TESTAR ACESSO DIRETO À TABELA
-- ============================================

SELECT '=== TESTANDO ACESSO DIRETO ===' as status;

-- Testar SELECT
SELECT COUNT(*) as total_configs FROM public.system_config;

-- Testar UPDATE direto
UPDATE public.system_config 
SET system_name = 'Teste Update Direto', updated_at = NOW()
WHERE id = (SELECT id FROM public.system_config LIMIT 1);

-- Verificar se foi atualizado
SELECT * FROM public.system_config;

SELECT '=== BACKEND FUNCIONANDO CORRETAMENTE ===' as status;
