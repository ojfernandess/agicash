-- Script simples para testar configurações
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se tudo está funcionando
SELECT '=== VERIFICAÇÃO BÁSICA ===' as status;

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
SELECT '=== TESTE DA FUNÇÃO ===' as status;
SELECT * FROM get_system_config();

-- 3. Verificar configurações existentes
SELECT '=== CONFIGURAÇÕES EXISTENTES ===' as status;
SELECT * FROM system_config;

-- 4. Verificar usuários (para você copiar o ID)
SELECT '=== SEU USER_ID (copie este UUID) ===' as status;
SELECT 
  id as seu_user_id,
  email,
  'Copie o ID acima para usar nos testes' as instrucao
FROM auth.users
ORDER BY created_at DESC
LIMIT 1;

-- 5. Verificar políticas RLS
SELECT '=== POLÍTICAS RLS ===' as status;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'system_config';

-- 6. Verificar se RLS está habilitado
SELECT '=== STATUS RLS ===' as status;
SELECT 
  CASE WHEN relrowsecurity 
       THEN '✅ RLS habilitado'
       ELSE '❌ RLS desabilitado'
  END as status
FROM pg_class WHERE relname = 'system_config';
