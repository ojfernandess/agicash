-- Script para debugar a função save_system_config
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
-- 2. VERIFICAR PARÂMETROS DA FUNÇÃO
-- ============================================

SELECT '=== VERIFICANDO PARÂMETROS ===' as status;

SELECT 
  parameter_name,
  data_type,
  parameter_mode
FROM information_schema.parameters 
WHERE specific_name IN (
  SELECT specific_name 
  FROM information_schema.routines 
  WHERE routine_name = 'save_system_config'
    AND routine_schema = 'public'
)
ORDER BY ordinal_position;

-- ============================================
-- 3. TESTAR CHAMADA DA FUNÇÃO
-- ============================================

SELECT '=== TESTANDO CHAMADA DA FUNÇÃO ===' as status;

-- Testar com parâmetros simples
SELECT save_system_config(
  'Teste via SQL',
  NULL,
  NULL,
  '#ff0000',
  '#00ff00'
) as resultado_teste;

-- ============================================
-- 4. VERIFICAR SE FOI SALVO
-- ============================================

SELECT '=== VERIFICANDO SE FOI SALVO ===' as status;

SELECT * FROM system_config;
SELECT * FROM get_system_config();

-- ============================================
-- 5. SE A FUNÇÃO NÃO EXISTIR, CRIAR
-- ============================================

-- Criar função save_system_config
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
    
    RAISE NOTICE 'Configuração atualizada com sucesso';
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
    
    RAISE NOTICE 'Nova configuração criada com sucesso';
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erro ao salvar configuração: %', SQLERRM;
    RETURN FALSE;
END;
$$;

-- ============================================
-- 6. TESTAR NOVA FUNÇÃO
-- ============================================

SELECT '=== TESTANDO NOVA FUNÇÃO ===' as status;

-- Testar salvamento
SELECT save_system_config(
  'Sistema Teste Final',
  NULL,
  NULL,
  '#0000ff',
  '#ffff00'
) as resultado_final;

-- Verificar resultado
SELECT * FROM system_config;
SELECT * FROM get_system_config();
