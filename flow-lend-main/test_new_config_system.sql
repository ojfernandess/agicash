-- Script para testar o novo sistema de configurações
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. VERIFICAR SE O NOVO SCHEMA EXISTE
-- ============================================

SELECT '=== VERIFICANDO NOVO SCHEMA ===' as status;

-- Verificar se a tabela existe
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'system_config'
  AND table_schema = 'public';

-- ============================================
-- 2. VERIFICAR ESTRUTURA DA TABELA
-- ============================================

SELECT '=== VERIFICANDO ESTRUTURA ===' as status;

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
-- 3. VERIFICAR FUNÇÕES
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
-- 4. VERIFICAR POLÍTICAS RLS
-- ============================================

SELECT '=== VERIFICANDO POLÍTICAS ===' as status;

SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'system_config'
ORDER BY policyname;

-- ============================================
-- 5. TESTAR FUNÇÃO GET_SYSTEM_CONFIG
-- ============================================

SELECT '=== TESTANDO GET_SYSTEM_CONFIG ===' as status;

SELECT * FROM public.get_system_config();

-- ============================================
-- 6. TESTAR SALVAMENTO DO NOME
-- ============================================

SELECT '=== TESTANDO SALVAMENTO DO NOME ===' as status;

-- Testar salvamento com nome específico
SELECT public.save_system_config(
  'Meu Sistema Novo',
  NULL,
  NULL,
  '#3b82f6',
  '#64748b'
) as resultado_salvamento;

-- ============================================
-- 7. VERIFICAR SE O NOME FOI SALVO
-- ============================================

SELECT '=== VERIFICANDO SE O NOME FOI SALVO ===' as status;

SELECT * FROM public.system_config;
SELECT * FROM public.get_system_config();

-- ============================================
-- 8. TESTAR ATUALIZAÇÃO DO NOME
-- ============================================

SELECT '=== TESTANDO ATUALIZAÇÃO DO NOME ===' as status;

-- Testar atualização do nome
SELECT public.save_system_config(
  'Nome Atualizado Teste',
  NULL,
  NULL,
  '#ff0000',
  '#00ff00'
) as resultado_atualizacao;

-- ============================================
-- 9. VERIFICAR ATUALIZAÇÃO
-- ============================================

SELECT '=== VERIFICANDO ATUALIZAÇÃO ===' as status;

SELECT * FROM public.system_config;
SELECT * FROM public.get_system_config();

-- ============================================
-- 10. TESTE FINAL
-- ============================================

SELECT '=== TESTE FINAL ===' as status;

-- Teste final com nome personalizado
SELECT public.save_system_config(
  'Flow Lend - Sistema Final',
  NULL,
  NULL,
  '#3b82f6',
  '#64748b'
) as resultado_final;

-- Verificar resultado final
SELECT * FROM public.get_system_config();

SELECT '=== NOVO SISTEMA DE CONFIGURAÇÕES TESTADO COM SUCESSO ===' as status;
