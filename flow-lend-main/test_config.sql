-- Script de teste para verificar configurações do sistema
-- Execute este script no SQL Editor do Supabase para diagnosticar problemas

-- 1. Verificar se a tabela system_config existe
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'system_config' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se a função get_system_config existe
SELECT 
  routine_name, 
  routine_type, 
  data_type
FROM information_schema.routines 
WHERE routine_name = 'get_system_config' 
  AND routine_schema = 'public';

-- 3. Verificar se o bucket system-assets existe
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id = 'system-assets';

-- 4. Verificar políticas da tabela system_config
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual
FROM pg_policies 
WHERE tablename = 'system_config';

-- 5. Verificar políticas do storage
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage';

-- 6. Testar a função get_system_config
SELECT * FROM get_system_config();

-- 7. Verificar se existem configurações salvas
SELECT * FROM system_config;
