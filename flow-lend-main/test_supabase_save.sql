-- Script para testar salvamento no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela system_config existe e sua estrutura
SELECT 
  'Estrutura da tabela system_config:' as info,
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'system_config' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar políticas RLS
SELECT 
  'Políticas RLS da tabela system_config:' as info,
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual
FROM pg_policies 
WHERE tablename = 'system_config';

-- 3. Verificar se RLS está habilitado
SELECT 
  'RLS habilitado:' as info,
  relname,
  relrowsecurity,
  relforcerowsecurity
FROM pg_class 
WHERE relname = 'system_config';

-- 4. Testar a função get_system_config
SELECT 
  'Testando get_system_config:' as info,
  * 
FROM get_system_config();

-- 5. Verificar se existem configurações
SELECT 
  'Configurações existentes:' as info,
  *
FROM system_config;

-- 6. Verificar usuários na tabela auth.users
SELECT 
  'Usuários disponíveis:' as info,
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 3;

-- 7. Testar inserção direta (substitua o UUID pelo seu user_id)
-- IMPORTANTE: Descomente e substitua o UUID abaixo
-- INSERT INTO system_config (user_id, system_name, primary_color, secondary_color)
-- VALUES ('SUBSTITUA_PELO_SEU_USER_ID', 'Teste Direto', '#ff0000', '#00ff00');

-- 8. Verificar se a inserção funcionou
-- SELECT * FROM system_config WHERE user_id = 'SUBSTITUA_PELO_SEU_USER_ID';
