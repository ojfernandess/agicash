-- Script para testar salvamento de configurações
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. VERIFICAR FUNÇÃO SAVE_SYSTEM_CONFIG
-- ============================================

SELECT '=== VERIFICANDO FUNÇÃO SAVE_SYSTEM_CONFIG ===' as status;

-- Verificar se a função existe
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name = 'save_system_config'
  AND routine_schema = 'public';

-- ============================================
-- 2. TESTAR SALVAMENTO DE CONFIGURAÇÃO
-- ============================================

SELECT '=== TESTANDO SALVAMENTO ===' as status;

-- Testar salvamento com nome personalizado
SELECT save_system_config(
  'Meu Sistema Personalizado',
  NULL, -- Sem logo
  NULL, -- Sem favicon
  '#ff0000', -- Cor vermelha
  '#00ff00'  -- Cor verde
) as resultado_salvamento;

-- ============================================
-- 3. VERIFICAR SE FOI SALVO
-- ============================================

SELECT '=== VERIFICANDO SE FOI SALVO ===' as status;

-- Verificar configurações na tabela
SELECT 
  id,
  user_id,
  system_name,
  logo_url,
  favicon_url,
  primary_color,
  secondary_color,
  updated_at
FROM system_config
ORDER BY updated_at DESC;

-- ============================================
-- 4. TESTAR FUNÇÃO GET_SYSTEM_CONFIG
-- ============================================

SELECT '=== TESTANDO GET_SYSTEM_CONFIG ===' as status;

-- Testar se a função retorna os dados corretos
SELECT * FROM get_system_config();

-- ============================================
-- 5. TESTAR ATUALIZAÇÃO
-- ============================================

SELECT '=== TESTANDO ATUALIZAÇÃO ===' as status;

-- Testar atualização com novo nome
SELECT save_system_config(
  'Sistema Atualizado',
  NULL,
  NULL,
  '#0000ff', -- Cor azul
  '#ffff00'  -- Cor amarela
) as resultado_atualizacao;

-- Verificar se foi atualizado
SELECT * FROM get_system_config();

-- ============================================
-- 6. VERIFICAR POLÍTICAS RLS
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
-- 7. TESTE DE ACESSO
-- ============================================

SELECT '=== TESTE DE ACESSO ===' as status;

-- Verificar se conseguimos acessar a tabela
SELECT 
  'Configurações acessíveis:' as info,
  COUNT(*) as total
FROM system_config;
