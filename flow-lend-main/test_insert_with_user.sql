-- Script para testar inserção com user_id específico
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, obtenha seu user_id executando:
SELECT 'Seu user_id é:' as info, auth.uid() as user_id;

-- 2. Se auth.uid() retornar null, obtenha da tabela auth.users:
SELECT 'Usuários disponíveis:' as info, id, email FROM auth.users ORDER BY created_at DESC LIMIT 3;

-- 3. Substitua 'SEU_USER_ID_AQUI' pelo seu user_id real e execute:

-- Limpar configurações existentes (opcional)
-- DELETE FROM system_config WHERE user_id = 'SEU_USER_ID_AQUI';

-- Inserir nova configuração
INSERT INTO system_config (user_id, system_name, primary_color, secondary_color)
VALUES ('SEU_USER_ID_AQUI', 'Meu Sistema Teste', '#ff0000', '#00ff00')
ON CONFLICT (user_id) 
DO UPDATE SET 
  system_name = EXCLUDED.system_name,
  primary_color = EXCLUDED.primary_color,
  secondary_color = EXCLUDED.secondary_color,
  updated_at = NOW();

-- 4. Verificar se foi inserida
SELECT 'Configuração inserida:' as info, * FROM system_config WHERE user_id = 'SEU_USER_ID_AQUI';

-- 5. Testar a função get_system_config
SELECT 'Teste da função:' as info, * FROM get_system_config();

-- 6. Verificar todas as configurações
SELECT 'Todas as configurações:' as info, * FROM system_config;
