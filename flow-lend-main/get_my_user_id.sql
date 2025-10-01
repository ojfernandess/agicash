-- Script para obter seu user_id real
-- Execute este script no SQL Editor do Supabase

-- 1. Tentar obter o user_id atual (pode retornar null no SQL Editor)
SELECT 
  'auth.uid() retorna:' as info,
  auth.uid() as user_id;

-- 2. Se auth.uid() retornar null, obter da tabela auth.users
SELECT 
  'Usuários disponíveis (copie o ID do seu usuário):' as info,
  id as user_id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- 3. Exemplo de como usar o user_id (substitua pelo seu ID real)
-- Exemplo: se seu user_id for 'aa5c80b9-626f-45ae-8e29-a55e4361207b'
-- Execute o comando abaixo substituindo pelo seu ID:

-- INSERT INTO system_config (user_id, system_name, primary_color, secondary_color)
-- VALUES ('aa5c80b9-626f-45ae-8e29-a55e4361207b', 'Meu Sistema Teste', '#ff0000', '#00ff00')
-- ON CONFLICT (user_id) 
-- DO UPDATE SET 
--   system_name = EXCLUDED.system_name,
--   primary_color = EXCLUDED.primary_color,
--   secondary_color = EXCLUDED.secondary_color,
--   updated_at = NOW();

-- 4. Verificar se foi inserida
-- SELECT * FROM system_config WHERE user_id = 'aa5c80b9-626f-45ae-8e29-a55e4361207b';

-- 5. Testar a função
-- SELECT * FROM get_system_config();
