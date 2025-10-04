-- Script de debug para configurações do sistema
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela existe e tem dados
SELECT 'Verificando tabela system_config...' as status;
SELECT * FROM system_config;

-- 2. Verificar se a função existe
SELECT 'Verificando função get_system_config...' as status;
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'get_system_config';

-- 3. Testar a função diretamente
SELECT 'Testando função get_system_config...' as status;
SELECT * FROM get_system_config();

-- 4. Verificar usuário atual
SELECT 'Verificando usuário atual...' as status;
SELECT auth.uid() as current_user_id;

-- 5. Verificar se auth.uid() está funcionando
SELECT 'Verificando auth.uid()...' as status;
SELECT auth.uid() as current_user_id;

-- 6. Inserir uma configuração de teste (substitua o UUID pelo seu user_id real)
-- IMPORTANTE: Substitua 'SEU_USER_ID_AQUI' pelo ID real do seu usuário
SELECT 'Inserindo configuração de teste...' as status;
-- Descomente e substitua o UUID abaixo pelo seu user_id real:
-- INSERT INTO system_config (user_id, system_name, primary_color, secondary_color)
-- VALUES ('SEU_USER_ID_AQUI', 'Meu Sistema Teste', '#ff0000', '#00ff00')
-- ON CONFLICT (user_id) 
-- DO UPDATE SET 
--   system_name = EXCLUDED.system_name,
--   primary_color = EXCLUDED.primary_color,
--   secondary_color = EXCLUDED.secondary_color,
--   updated_at = NOW();

-- 6. Verificar se foi inserida
SELECT 'Verificando configuração inserida...' as status;
SELECT * FROM system_config WHERE user_id = auth.uid();

-- 7. Testar a função novamente
SELECT 'Testando função após inserção...' as status;
SELECT * FROM get_system_config();

-- 8. Verificar políticas RLS
SELECT 'Verificando políticas RLS...' as status;
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'system_config';
