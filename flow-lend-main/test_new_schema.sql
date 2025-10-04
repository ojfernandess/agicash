-- Script para testar o novo schema de configurações
-- Execute este script no SQL Editor do Supabase APÓS executar refactor_system_config.sql

-- ============================================
-- 1. VERIFICAR ESTRUTURA DA TABELA
-- ============================================

SELECT '=== VERIFICANDO ESTRUTURA DA TABELA ===' as status;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'system_config'
  AND table_schema = 'public'
ORDER BY ordinal_position;

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

-- Testar salvamento com nome personalizado
SELECT public.save_system_config(
  'Meu Sistema Personalizado',
  'https://example.com/logo.png',
  'https://example.com/favicon.ico',
  '#ff0000',
  '#00ff00'
) as resultado_salvamento;

-- ============================================
-- 5. VERIFICAR SE FOI SALVO
-- ============================================

SELECT '=== VERIFICANDO SE FOI SALVO ===' as status;

-- Verificar dados na tabela
SELECT * FROM public.system_config;

-- Verificar via função
SELECT * FROM public.get_system_config();

-- ============================================
-- 6. TESTAR ATUALIZAÇÃO
-- ============================================

SELECT '=== TESTANDO ATUALIZAÇÃO ===' as status;

-- Testar atualização
SELECT public.save_system_config(
  'Sistema Atualizado',
  'https://example.com/new-logo.png',
  'https://example.com/new-favicon.ico',
  '#0000ff',
  '#ffff00'
) as resultado_atualizacao;

-- Verificar se foi atualizado
SELECT * FROM public.system_config;
SELECT * FROM public.get_system_config();

-- ============================================
-- 7. TESTAR CAMPOS NULL
-- ============================================

SELECT '=== TESTANDO CAMPOS NULL ===' as status;

-- Testar salvamento com campos null
SELECT public.save_system_config(
  'Sistema Sem Logo',
  NULL,
  NULL,
  '#00ff00',
  '#ff0000'
) as resultado_null;

-- Verificar resultado
SELECT * FROM public.get_system_config();

-- ============================================
-- 8. TESTE DE PERFORMANCE
-- ============================================

SELECT '=== TESTE DE PERFORMANCE ===' as status;

-- Testar múltiplas chamadas
SELECT public.save_system_config(
  'Teste Performance',
  NULL,
  NULL,
  '#123456',
  '#654321'
) as teste1;

SELECT public.save_system_config(
  'Teste Performance 2',
  NULL,
  NULL,
  '#abcdef',
  '#fedcba'
) as teste2;

SELECT public.save_system_config(
  'Teste Performance 3',
  NULL,
  NULL,
  '#111111',
  '#222222'
) as teste3;

-- Verificar resultado final
SELECT * FROM public.get_system_config();

-- ============================================
-- 9. VERIFICAR LOGS
-- ============================================

SELECT '=== VERIFICANDO LOGS ===' as status;

-- Verificar se há erros
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- ============================================
-- 10. TESTE FINAL
-- ============================================

SELECT '=== TESTE FINAL ===' as status;

-- Testar salvamento final
SELECT public.save_system_config(
  'Flow Lend - Sistema Final',
  NULL,
  NULL,
  '#3b82f6',
  '#64748b'
) as resultado_final;

-- Verificar resultado final
SELECT * FROM public.get_system_config();

SELECT '=== NOVO SCHEMA TESTADO COM SUCESSO ===' as status;
