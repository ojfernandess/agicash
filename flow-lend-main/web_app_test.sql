-- Script para verificar se o problema está na aplicação web
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a função get_system_config está funcionando
SELECT '=== TESTE DA FUNÇÃO GET_SYSTEM_CONFIG ===' as status;
SELECT * FROM get_system_config();

-- 2. Verificar se existem configurações na tabela
SELECT '=== CONFIGURAÇÕES NA TABELA ===' as status;
SELECT 
  id,
  user_id,
  system_name,
  primary_color,
  secondary_color,
  created_at,
  updated_at
FROM system_config
ORDER BY created_at DESC;

-- 3. Verificar se a função retorna dados quando há configuração
-- Se houver configurações na tabela, a função deve retornar os dados
SELECT '=== COMPARAÇÃO: TABELA vs FUNÇÃO ===' as status;

-- Dados da tabela (se existirem)
SELECT 
  'Dados da tabela:' as origem,
  system_name,
  primary_color,
  secondary_color
FROM system_config
ORDER BY created_at DESC
LIMIT 1;

-- Dados da função
SELECT 
  'Dados da função:' as origem,
  system_name,
  primary_color,
  secondary_color
FROM get_system_config();

-- 4. Verificar se há problemas de permissão
SELECT '=== VERIFICAÇÃO DE PERMISSÕES ===' as status;

-- Verificar se conseguimos fazer SELECT na tabela
SELECT 
  'SELECT na tabela:' as teste,
  CASE WHEN COUNT(*) >= 0 
       THEN '✅ SELECT funciona'
       ELSE '❌ SELECT não funciona'
  END as resultado
FROM system_config;

-- 5. Verificar estrutura da função
SELECT '=== ESTRUTURA DA FUNÇÃO ===' as status;
SELECT 
  routine_name,
  routine_type,
  data_type,
  security_type
FROM information_schema.routines 
WHERE routine_name = 'get_system_config'
  AND routine_schema = 'public';
