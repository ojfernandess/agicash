-- Script automático para testar configurações
-- Execute este script no SQL Editor do Supabase

-- 1. Obter o primeiro usuário da tabela
WITH first_user AS (
  SELECT id, email 
  FROM auth.users 
  ORDER BY created_at DESC 
  LIMIT 1
)
-- 2. Inserir configuração de teste usando o primeiro usuário
INSERT INTO system_config (user_id, system_name, primary_color, secondary_color)
SELECT 
  id,
  'Sistema Teste Automático',
  '#ff0000',
  '#00ff00'
FROM first_user
ON CONFLICT (user_id) 
DO UPDATE SET 
  system_name = EXCLUDED.system_name,
  primary_color = EXCLUDED.primary_color,
  secondary_color = EXCLUDED.secondary_color,
  updated_at = NOW();

-- 3. Verificar se foi inserida
SELECT '=== CONFIGURAÇÃO INSERIDA ===' as status;
SELECT * FROM system_config ORDER BY created_at DESC LIMIT 1;

-- 4. Testar a função get_system_config
SELECT '=== TESTE DA FUNÇÃO ===' as status;
SELECT * FROM get_system_config();

-- 5. Verificar todas as configurações
SELECT '=== TODAS AS CONFIGURAÇÕES ===' as status;
SELECT * FROM system_config;
