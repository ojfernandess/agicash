-- Script para verificar se as configurações estão sendo salvas no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela system_config tem dados
SELECT '=== CONFIGURAÇÕES SALVAS NO SUPABASE ===' as status;

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

-- 2. Verificar se a função get_system_config retorna os dados corretos
SELECT '=== DADOS RETORNADOS PELA FUNÇÃO ===' as status;
SELECT * FROM get_system_config();

-- 3. Verificar se há configurações recentes (últimas 24 horas)
SELECT '=== CONFIGURAÇÕES RECENTES (24h) ===' as status;
SELECT 
  system_name,
  primary_color,
  secondary_color,
  updated_at,
  'Atualizado há ' || EXTRACT(EPOCH FROM (NOW() - updated_at))/60 || ' minutos' as tempo_atraso
FROM system_config
WHERE updated_at > NOW() - INTERVAL '24 hours'
ORDER BY updated_at DESC;

-- 4. Verificar se a função está funcionando corretamente
SELECT '=== TESTE DA FUNÇÃO ===' as status;

-- Testar se a função retorna dados quando há configuração
WITH config_test AS (
  SELECT COUNT(*) as total_configs FROM system_config
)
SELECT 
  CASE 
    WHEN total_configs > 0 THEN '✅ Há configurações na tabela'
    ELSE '❌ Não há configurações na tabela'
  END as status_tabela,
  CASE 
    WHEN (SELECT COUNT(*) FROM get_system_config()) > 0 THEN '✅ Função retorna dados'
    ELSE '❌ Função não retorna dados'
  END as status_funcao
FROM config_test;

-- 5. Verificar estrutura da tabela
SELECT '=== ESTRUTURA DA TABELA ===' as status;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'system_config' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
