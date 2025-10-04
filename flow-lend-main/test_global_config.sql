-- Script para testar configurações globais do sistema
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. VERIFICAR CONFIGURAÇÕES EXISTENTES
-- ============================================

SELECT '=== CONFIGURAÇÕES EXISTENTES ===' as status;

SELECT 
  id,
  user_id,
  system_name,
  primary_color,
  secondary_color,
  logo_url,
  favicon_url,
  created_at,
  updated_at
FROM system_config
ORDER BY updated_at DESC;

-- ============================================
-- 2. TESTAR FUNÇÃO GET_SYSTEM_CONFIG
-- ============================================

SELECT '=== TESTE DA FUNÇÃO GET_SYSTEM_CONFIG ===' as status;
SELECT * FROM get_system_config();

-- ============================================
-- 3. TESTAR FUNÇÃO SAVE_SYSTEM_CONFIG
-- ============================================

SELECT '=== TESTE DA FUNÇÃO SAVE_SYSTEM_CONFIG ===' as status;

-- Testar salvamento de configuração global
SELECT save_system_config(
  'Meu Sistema Global',
  'https://example.com/logo.png',
  'https://example.com/favicon.ico',
  '#ff0000',
  '#00ff00'
) as resultado;

-- ============================================
-- 4. VERIFICAR SE FOI SALVO CORRETAMENTE
-- ============================================

SELECT '=== VERIFICAÇÃO APÓS SALVAMENTO ===' as status;

-- Verificar configurações na tabela
SELECT 
  id,
  user_id,
  system_name,
  primary_color,
  secondary_color,
  updated_at
FROM system_config
ORDER BY updated_at DESC;

-- Testar função novamente
SELECT * FROM get_system_config();

-- ============================================
-- 5. VERIFICAR POLÍTICAS RLS
-- ============================================

SELECT '=== POLÍTICAS RLS ===' as status;

SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'system_config'
ORDER BY policyname;

-- ============================================
-- 6. TESTE DE ACESSO COMPARTILHADO
-- ============================================

SELECT '=== TESTE DE ACESSO COMPARTILHADO ===' as status;

-- Verificar se todos os usuários autenticados podem ver as configurações
SELECT 
  'Configurações visíveis:' as info,
  COUNT(*) as total
FROM system_config;

-- Verificar se a função retorna dados para qualquer usuário autenticado
SELECT 
  'Função retorna dados:' as info,
  CASE 
    WHEN (SELECT COUNT(*) FROM get_system_config()) > 0 
    THEN '✅ Sim' 
    ELSE '❌ Não' 
  END as resultado;
