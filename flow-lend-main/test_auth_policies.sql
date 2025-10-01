-- Teste específico para verificar autenticação e políticas RLS
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar contexto de autenticação
SELECT '=== CONTEXTO DE AUTENTICAÇÃO ===' as status;

-- Verificar se auth.uid() funciona
SELECT 
  'auth.uid():' as info,
  auth.uid() as user_id;

-- Verificar se auth.role() funciona
SELECT 
  'auth.role():' as info,
  auth.role() as role;

-- 2. Verificar políticas RLS detalhadamente
SELECT '=== POLÍTICAS RLS DETALHADAS ===' as status;

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'system_config'
ORDER BY policyname;

-- 3. Verificar se as políticas estão funcionando
SELECT '=== TESTE DE POLÍTICAS ===' as status;

-- Tentar SELECT (deve funcionar se RLS estiver configurado corretamente)
SELECT 
  'SELECT test:' as info,
  COUNT(*) as count
FROM system_config;

-- 4. Verificar se a função get_system_config está funcionando
SELECT '=== TESTE DA FUNÇÃO ===' as status;

-- Testar a função diretamente
SELECT * FROM get_system_config();

-- 5. Verificar estrutura da tabela
SELECT '=== ESTRUTURA DA TABELA ===' as status;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'system_config' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Verificar se há dados na tabela
SELECT '=== DADOS NA TABELA ===' as status;

SELECT 
  id,
  user_id,
  system_name,
  primary_color,
  secondary_color,
  created_at,
  updated_at
FROM system_config
ORDER BY created_at DESC;
