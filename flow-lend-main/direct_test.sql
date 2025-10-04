-- Teste direto para verificar salvamento no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se tudo está configurado corretamente
SELECT '=== VERIFICAÇÃO INICIAL ===' as status;

-- Verificar tabela
SELECT 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_config')
       THEN '✅ Tabela system_config existe'
       ELSE '❌ Tabela system_config NÃO existe'
  END as status;

-- Verificar função
SELECT 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_system_config')
       THEN '✅ Função get_system_config existe'
       ELSE '❌ Função get_system_config NÃO existe'
  END as status;

-- Verificar bucket
SELECT 
  CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'system-assets')
       THEN '✅ Bucket system-assets existe'
       ELSE '❌ Bucket system-assets NÃO existe'
  END as status;

-- 2. Verificar políticas RLS
SELECT '=== POLÍTICAS RLS ===' as status;
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'system_config';

-- 3. Verificar se RLS está habilitado
SELECT '=== STATUS RLS ===' as status;
SELECT relname, relrowsecurity, relforcerowsecurity FROM pg_class WHERE relname = 'system_config';

-- 4. Testar função get_system_config
SELECT '=== TESTE DA FUNÇÃO ===' as status;
SELECT * FROM get_system_config();

-- 5. Verificar configurações existentes
SELECT '=== CONFIGURAÇÕES EXISTENTES ===' as status;
SELECT * FROM system_config;

-- 6. Verificar usuários
SELECT '=== USUÁRIOS DISPONÍVEIS ===' as status;
SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 3;

-- 7. INSTRUÇÕES PARA TESTE MANUAL:
-- Para testar a inserção manual, execute os comandos abaixo substituindo o UUID:
-- 
-- INSERT INTO system_config (user_id, system_name, primary_color, secondary_color)
-- VALUES ('SEU_USER_ID_AQUI', 'Teste Manual', '#ff0000', '#00ff00');
-- 
-- SELECT * FROM system_config WHERE user_id = 'SEU_USER_ID_AQUI';
-- 
-- SELECT * FROM get_system_config();
