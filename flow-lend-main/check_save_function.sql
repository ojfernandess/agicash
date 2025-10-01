-- Script para verificar se a função save_system_config existe
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. VERIFICAR SE A FUNÇÃO EXISTE
-- ============================================

SELECT '=== VERIFICANDO FUNÇÃO SAVE_SYSTEM_CONFIG ===' as status;

SELECT 
  routine_name,
  routine_type,
  data_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'save_system_config'
  AND routine_schema = 'public';

-- ============================================
-- 2. SE A FUNÇÃO NÃO EXISTIR, CRIAR
-- ============================================

-- Criar função save_system_config se não existir
CREATE OR REPLACE FUNCTION public.save_system_config(
  p_system_name TEXT,
  p_logo_url TEXT,
  p_favicon_url TEXT,
  p_primary_color TEXT,
  p_secondary_color TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se já existe uma configuração
  IF EXISTS (SELECT 1 FROM public.system_config LIMIT 1) THEN
    -- Atualizar configuração existente
    UPDATE public.system_config SET
      system_name = p_system_name,
      logo_url = p_logo_url,
      favicon_url = p_favicon_url,
      primary_color = p_primary_color,
      secondary_color = p_secondary_color,
      updated_at = NOW();
  ELSE
    -- Criar nova configuração global
    INSERT INTO public.system_config (
      user_id,
      system_name,
      logo_url,
      favicon_url,
      primary_color,
      secondary_color
    ) VALUES (
      auth.uid(), -- Usar o usuário atual como criador
      p_system_name,
      p_logo_url,
      p_favicon_url,
      p_primary_color,
      p_secondary_color
    );
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- ============================================
-- 3. TESTAR A FUNÇÃO
-- ============================================

SELECT '=== TESTANDO FUNÇÃO ===' as status;

-- Testar salvamento
SELECT save_system_config(
  'Sistema Teste',
  NULL,
  NULL,
  '#ff0000',
  '#00ff00'
) as resultado;

-- ============================================
-- 4. VERIFICAR RESULTADO
-- ============================================

SELECT '=== VERIFICANDO RESULTADO ===' as status;

SELECT * FROM system_config;
SELECT * FROM get_system_config();
