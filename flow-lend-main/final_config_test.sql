-- Script final para testar configurações do sistema
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. VERIFICAR ESTADO INICIAL
-- ============================================

SELECT '=== ESTADO INICIAL ===' as status;

SELECT * FROM public.system_config;
SELECT * FROM public.get_system_config();

-- ============================================
-- 2. TESTAR SALVAMENTO COMPLETO
-- ============================================

SELECT '=== TESTANDO SALVAMENTO COMPLETO ===' as status;

-- Testar salvamento com todos os campos
SELECT public.save_system_config(
  'Meu Sistema Completo',
  'https://example.com/logo.png',
  'https://example.com/favicon.ico',
  '#ff0000',
  '#00ff00'
) as resultado_completo;

-- ============================================
-- 3. VERIFICAR SALVAMENTO COMPLETO
-- ============================================

SELECT '=== VERIFICANDO SALVAMENTO COMPLETO ===' as status;

SELECT * FROM public.system_config;
SELECT * FROM public.get_system_config();

-- ============================================
-- 4. TESTAR APENAS NOME
-- ============================================

SELECT '=== TESTANDO APENAS NOME ===' as status;

-- Testar salvamento apenas do nome
SELECT public.save_system_config(
  'Apenas Nome Alterado',
  NULL,
  NULL,
  NULL,
  NULL
) as resultado_apenas_nome;

-- ============================================
-- 5. VERIFICAR APENAS NOME
-- ============================================

SELECT '=== VERIFICANDO APENAS NOME ===' as status;

SELECT * FROM public.system_config;
SELECT * FROM public.get_system_config();

-- ============================================
-- 6. TESTAR NOME E CORES
-- ============================================

SELECT '=== TESTANDO NOME E CORES ===' as status;

-- Testar salvamento do nome e cores
SELECT public.save_system_config(
  'Nome e Cores Alterados',
  NULL,
  NULL,
  '#0000ff',
  '#ffff00'
) as resultado_nome_cores;

-- ============================================
-- 7. VERIFICAR NOME E CORES
-- ============================================

SELECT '=== VERIFICANDO NOME E CORES ===' as status;

SELECT * FROM public.system_config;
SELECT * FROM public.get_system_config();

-- ============================================
-- 8. TESTE FINAL
-- ============================================

SELECT '=== TESTE FINAL ===' as status;

-- Teste final com nome personalizado
SELECT public.save_system_config(
  'Flow Lend - Sistema Personalizado',
  NULL,
  NULL,
  '#3b82f6',
  '#64748b'
) as resultado_final;

-- ============================================
-- 9. VERIFICAR RESULTADO FINAL
-- ============================================

SELECT '=== VERIFICANDO RESULTADO FINAL ===' as status;

SELECT * FROM public.system_config;
SELECT * FROM public.get_system_config();

-- ============================================
-- 10. VERIFICAR FUNÇÕES
-- ============================================

SELECT '=== VERIFICANDO FUNÇÕES ===' as status;

-- Verificar se as funções existem
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name IN ('get_system_config', 'save_system_config')
  AND routine_schema = 'public';

-- ============================================
-- 11. VERIFICAR POLÍTICAS
-- ============================================

SELECT '=== VERIFICANDO POLÍTICAS ===' as status;

SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'system_config'
ORDER BY policyname;

SELECT '=== TESTE FINAL CONCLUÍDO ===' as status;
