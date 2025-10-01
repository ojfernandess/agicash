-- Script para corrigir o problema de configurações
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, vamos verificar se tudo está funcionando
SELECT 'Verificando estrutura...' as status;

-- Verificar se a tabela existe
SELECT 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_config')
       THEN '✅ Tabela system_config existe'
       ELSE '❌ Tabela system_config NÃO existe'
  END as status;

-- Verificar se a função existe
SELECT 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_system_config')
       THEN '✅ Função get_system_config existe'
       ELSE '❌ Função get_system_config NÃO existe'
  END as status;

-- 2. Testar a função atual
SELECT 'Testando função get_system_config...' as status;
SELECT * FROM get_system_config();

-- 3. Verificar se há configurações salvas
SELECT 'Configurações existentes:' as status;
SELECT * FROM system_config;

-- 4. Se não há configurações, vamos criar uma de teste
-- IMPORTANTE: Execute get_user_id.sql primeiro para obter seu user_id
-- Depois substitua 'SEU_USER_ID_AQUI' pelo seu user_id real

-- Exemplo de como inserir (substitua o UUID):
-- INSERT INTO system_config (user_id, system_name, primary_color, secondary_color)
-- VALUES ('aa5c80b9-626f-45ae-8e29-a55e4361207b', 'Meu Sistema', '#3b82f6', '#64748b');

-- 5. Verificar se o bucket de storage existe
SELECT 
  CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'system-assets')
       THEN '✅ Bucket system-assets existe'
       ELSE '❌ Bucket system-assets NÃO existe'
  END as status;
