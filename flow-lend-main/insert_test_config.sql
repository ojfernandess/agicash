-- Script para inserir configuração de teste
-- IMPORTANTE: Substitua 'SEU_USER_ID_AQUI' pelo seu user_id real

-- 1. Primeiro, execute get_user_id.sql para obter seu user_id

-- 2. Substitua 'SEU_USER_ID_AQUI' pelo seu user_id e execute:
INSERT INTO system_config (user_id, system_name, primary_color, secondary_color)
VALUES ('SEU_USER_ID_AQUI', 'Meu Sistema Teste', '#ff0000', '#00ff00')
ON CONFLICT (user_id) 
DO UPDATE SET 
  system_name = EXCLUDED.system_name,
  primary_color = EXCLUDED.primary_color,
  secondary_color = EXCLUDED.secondary_color,
  updated_at = NOW();

-- 3. Verificar se foi inserida
SELECT * FROM system_config WHERE user_id = 'SEU_USER_ID_AQUI';

-- 4. Testar a função
SELECT * FROM get_system_config();
