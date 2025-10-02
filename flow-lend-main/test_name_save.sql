-- Script para testar especificamente o salvamento do nome do sistema
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. VERIFICAR ESTADO ATUAL
-- ============================================

SELECT '=== ESTADO ATUAL ===' as status;

SELECT * FROM public.system_config;
SELECT * FROM public.get_system_config();

-- ============================================
-- 2. TESTAR SALVAMENTO DO NOME
-- ============================================

SELECT '=== TESTANDO SALVAMENTO DO NOME ===' as status;

-- Testar salvamento com nome específico
SELECT public.save_system_config(
  'Meu Sistema Personalizado',
  NULL,
  NULL,
  '#3b82f6',
  '#64748b'
) as resultado_salvamento;

-- ============================================
-- 3. VERIFICAR SE O NOME FOI SALVO
-- ============================================

SELECT '=== VERIFICANDO SE O NOME FOI SALVO ===' as status;

SELECT 
  id,
  system_name,
  logo_url,
  favicon_url,
  primary_color,
  secondary_color,
  updated_at
FROM public.system_config;

-- Verificar via função
SELECT * FROM public.get_system_config();

-- ============================================
-- 4. TESTAR ATUALIZAÇÃO DO NOME
-- ============================================

SELECT '=== TESTANDO ATUALIZAÇÃO DO NOME ===' as status;

-- Testar atualização do nome
SELECT public.save_system_config(
  'Nome Atualizado Teste',
  NULL,
  NULL,
  '#3b82f6',
  '#64748b'
) as resultado_atualizacao;

-- ============================================
-- 5. VERIFICAR ATUALIZAÇÃO
-- ============================================

SELECT '=== VERIFICANDO ATUALIZAÇÃO ===' as status;

SELECT 
  id,
  system_name,
  logo_url,
  favicon_url,
  primary_color,
  secondary_color,
  updated_at
FROM public.system_config;

-- Verificar via função
SELECT * FROM public.get_system_config();

-- ============================================
-- 6. TESTAR COM NOME VAZIO
-- ============================================

SELECT '=== TESTANDO COM NOME VAZIO ===' as status;

-- Testar com nome vazio (deve manter o anterior)
SELECT public.save_system_config(
  '',
  NULL,
  NULL,
  '#3b82f6',
  '#64748b'
) as resultado_nome_vazio;

-- Verificar se manteve o nome anterior
SELECT * FROM public.get_system_config();

-- ============================================
-- 7. TESTAR COM NOME NULL
-- ============================================

SELECT '=== TESTANDO COM NOME NULL ===' as status;

-- Testar com nome null (deve manter o anterior)
SELECT public.save_system_config(
  NULL,
  NULL,
  NULL,
  '#3b82f6',
  '#64748b'
) as resultado_nome_null;

-- Verificar se manteve o nome anterior
SELECT * FROM public.get_system_config();

-- ============================================
-- 8. TESTE FINAL COM NOME VÁLIDO
-- ============================================

SELECT '=== TESTE FINAL COM NOME VÁLIDO ===' as status;

-- Testar com nome válido final
SELECT public.save_system_config(
  'Flow Lend - Sistema Final',
  NULL,
  NULL,
  '#3b82f6',
  '#64748b'
) as resultado_final;

-- Verificar resultado final
SELECT * FROM public.get_system_config();

-- ============================================
-- 9. VERIFICAR LOGS DE ERRO
-- ============================================

SELECT '=== VERIFICANDO LOGS DE ERRO ===' as status;

-- Verificar se há erros
SELECT * FROM pg_stat_activity WHERE state = 'active';

SELECT '=== TESTE DE SALVAMENTO DO NOME CONCLUÍDO ===' as status;
