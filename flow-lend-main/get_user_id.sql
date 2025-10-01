-- Script para obter o user_id do usuário logado
-- Execute este script no SQL Editor do Supabase

-- 1. Obter o user_id atual
SELECT 
  'Seu user_id é:' as info,
  auth.uid() as user_id;

-- 2. Se auth.uid() retornar null, você pode obter o user_id da tabela auth.users
-- (Execute apenas se auth.uid() retornar null)
SELECT 
  'Usuários disponíveis:' as info,
  id as user_id,
  email
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 3. Testar a função get_system_config
SELECT 
  'Testando get_system_config:' as info,
  * 
FROM get_system_config();

-- 4. Verificar se existem configurações salvas
SELECT 
  'Configurações existentes:' as info,
  *
FROM system_config;
