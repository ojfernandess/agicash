-- Script para recriar a função get_system_config com versão mais simples
-- Execute este script no SQL Editor do Supabase

-- 1. Remover a função existente
DROP FUNCTION IF EXISTS public.get_system_config();

-- 2. Criar uma versão mais simples da função
CREATE OR REPLACE FUNCTION public.get_system_config()
RETURNS TABLE(
  system_name TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT,
  secondary_color TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Tentar buscar configuração do usuário atual
  RETURN QUERY
  SELECT 
    COALESCE(sc.system_name, 'Flow Lend') as system_name,
    sc.logo_url,
    sc.favicon_url,
    COALESCE(sc.primary_color, '#3b82f6') as primary_color,
    COALESCE(sc.secondary_color, '#64748b') as secondary_color
  FROM public.system_config sc
  WHERE sc.user_id = auth.uid()
  LIMIT 1;
  
  -- Se não retornou nada, retornar valores padrão
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      'Flow Lend'::TEXT, 
      NULL::TEXT, 
      NULL::TEXT, 
      '#3b82f6'::TEXT, 
      '#64748b'::TEXT;
  END IF;
END;
$$;

-- 3. Testar a função
SELECT '=== TESTANDO NOVA FUNÇÃO ===' as status;
SELECT * FROM get_system_config();

-- 4. Verificar se a função foi criada
SELECT 
  'Função criada:' as info,
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name = 'get_system_config'
  AND routine_schema = 'public';

-- 5. Verificar permissões da função
SELECT 
  'Permissões da função:' as info,
  routine_name,
  security_type,
  is_deterministic
FROM information_schema.routines 
WHERE routine_name = 'get_system_config'
  AND routine_schema = 'public';
