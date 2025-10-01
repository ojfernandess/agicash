-- Script para testar chamada RPC save_system_config
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. VERIFICAR ESTADO ATUAL
-- ============================================

SELECT '=== ESTADO ATUAL ===' as status;

SELECT * FROM system_config;
SELECT * FROM get_system_config();

-- ============================================
-- 2. TESTAR FUNÇÃO DIRETAMENTE
-- ============================================

SELECT '=== TESTANDO FUNÇÃO DIRETAMENTE ===' as status;

-- Testar salvamento direto
SELECT save_system_config(
  'Teste Direto SQL',
  NULL,
  NULL,
  '#ff0000',
  '#00ff00'
) as resultado_direto;

-- ============================================
-- 3. VERIFICAR SE MUDOU
-- ============================================

SELECT '=== VERIFICANDO MUDANÇA ===' as status;

SELECT * FROM system_config;
SELECT * FROM get_system_config();

-- ============================================
-- 4. TESTAR COM DADOS DIFERENTES
-- ============================================

SELECT '=== TESTANDO COM DADOS DIFERENTES ===' as status;

-- Testar com dados que vêm da interface
SELECT save_system_config(
  'Meu Sistema Personalizado',
  NULL,
  NULL,
  '#3b82f6',
  '#64748b'
) as resultado_interface;

-- ============================================
-- 5. VERIFICAR RESULTADO FINAL
-- ============================================

SELECT '=== RESULTADO FINAL ===' as status;

SELECT * FROM system_config;
SELECT * FROM get_system_config();

-- ============================================
-- 6. VERIFICAR LOGS DA FUNÇÃO
-- ============================================

SELECT '=== VERIFICANDO LOGS ===' as status;

-- Verificar se há logs de erro
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- ============================================
-- 7. TESTAR FUNÇÃO GET_SYSTEM_CONFIG
-- ============================================

SELECT '=== TESTANDO GET_SYSTEM_CONFIG ===' as status;

-- Testar se a função de busca está funcionando
SELECT get_system_config() as config_atual;
