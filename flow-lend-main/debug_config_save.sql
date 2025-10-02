-- Script para debugar o problema de salvamento das configurações
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. VERIFICAR SE O SCHEMA EXISTE
-- ============================================

SELECT '=== VERIFICANDO SE O SCHEMA EXISTE ===' as status;

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
-- 3. VERIFICAR DADOS ATUAIS
-- ============================================

SELECT '=== VERIFICANDO DADOS ATUAIS ===' as status;

SELECT * FROM public.system_config;

-- ============================================
-- 4. VERIFICAR FUNÇÕES
-- ============================================

SELECT '=== VERIFICANDO FUNÇÕES ===' as status;

-- Verificar se get_system_config existe
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name = 'get_system_config'
  AND routine_schema = 'public';

-- Verificar se save_system_config existe
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name = 'save_system_config'
  AND routine_schema = 'public';

-- ============================================
-- 5. TESTAR FUNÇÃO GET_SYSTEM_CONFIG
-- ============================================

SELECT '=== TESTANDO GET_SYSTEM_CONFIG ===' as status;

SELECT * FROM public.get_system_config();

-- ============================================
-- 6. TESTAR FUNÇÃO SAVE_SYSTEM_CONFIG
-- ============================================

SELECT '=== TESTANDO SAVE_SYSTEM_CONFIG ===' as status;

-- Testar salvamento direto
SELECT public.save_system_config(
  'Nome Teste Direto',
  NULL,
  NULL,
  '#ff0000',
  '#00ff00'
) as resultado_teste;

-- ============================================
-- 7. VERIFICAR SE FOI SALVO
-- ============================================

SELECT '=== VERIFICANDO SE FOI SALVO ===' as status;

SELECT * FROM public.system_config;
SELECT * FROM public.get_system_config();

-- ============================================
-- 8. SE NÃO FUNCIONAR, RECRIAR TUDO
-- ============================================

-- Se as funções não existirem ou não funcionarem, execute o script refactor_system_config.sql
SELECT '=== SE NÃO FUNCIONAR, EXECUTE refactor_system_config.sql ===' as status;

-- ============================================
-- 9. TESTE MANUAL DE INSERÇÃO
-- ============================================

SELECT '=== TESTE MANUAL DE INSERÇÃO ===' as status;

-- Limpar dados existentes
DELETE FROM public.system_config;

-- Inserir configuração manual
INSERT INTO public.system_config (
  system_name,
  logo_url,
  favicon_url,
  primary_color,
  secondary_color
) VALUES (
  'Flow Lend Manual',
  NULL,
  NULL,
  '#3b82f6',
  '#64748b'
);

-- Verificar se foi inserido
SELECT * FROM public.system_config;

-- ============================================
-- 10. TESTE FINAL
-- ============================================

SELECT '=== TESTE FINAL ===' as status;

-- Testar função novamente
SELECT * FROM public.get_system_config();

SELECT '=== DEBUG CONCLUÍDO ===' as status;
