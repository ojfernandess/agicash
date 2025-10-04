-- Script para recriar a função save_system_config com logs detalhados
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. REMOVER FUNÇÃO EXISTENTE
-- ============================================

DROP FUNCTION IF EXISTS public.save_system_config(TEXT, TEXT, TEXT, TEXT, TEXT);

-- ============================================
-- 2. CRIAR NOVA FUNÇÃO COM LOGS
-- ============================================

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
DECLARE
  v_user_id UUID;
  v_count INTEGER;
BEGIN
  -- Log de entrada
  RAISE NOTICE '=== INICIANDO save_system_config ===';
  RAISE NOTICE 'Parâmetros recebidos:';
  RAISE NOTICE '  p_system_name: %', p_system_name;
  RAISE NOTICE '  p_logo_url: %', p_logo_url;
  RAISE NOTICE '  p_favicon_url: %', p_favicon_url;
  RAISE NOTICE '  p_primary_color: %', p_primary_color;
  RAISE NOTICE '  p_secondary_color: %', p_secondary_color;
  
  -- Obter user_id
  v_user_id := auth.uid();
  RAISE NOTICE 'User ID: %', v_user_id;
  
  -- Verificar se já existe configuração
  SELECT COUNT(*) INTO v_count FROM public.system_config;
  RAISE NOTICE 'Configurações existentes: %', v_count;
  
  IF v_count > 0 THEN
    -- Atualizar configuração existente
    RAISE NOTICE 'Atualizando configuração existente...';
    
    UPDATE public.system_config SET
      system_name = p_system_name,
      logo_url = p_logo_url,
      favicon_url = p_favicon_url,
      primary_color = p_primary_color,
      secondary_color = p_secondary_color,
      updated_at = NOW();
    
    RAISE NOTICE 'Configuração atualizada com sucesso';
  ELSE
    -- Criar nova configuração
    RAISE NOTICE 'Criando nova configuração...';
    
    INSERT INTO public.system_config (
      user_id,
      system_name,
      logo_url,
      favicon_url,
      primary_color,
      secondary_color
    ) VALUES (
      v_user_id,
      p_system_name,
      p_logo_url,
      p_favicon_url,
      p_primary_color,
      p_secondary_color
    );
    
    RAISE NOTICE 'Nova configuração criada com sucesso';
  END IF;
  
  -- Verificar resultado
  SELECT COUNT(*) INTO v_count FROM public.system_config;
  RAISE NOTICE 'Configurações após operação: %', v_count;
  
  RAISE NOTICE '=== FIM save_system_config ===';
  RETURN TRUE;
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'ERRO em save_system_config: %', SQLERRM;
    RAISE NOTICE 'Código do erro: %', SQLSTATE;
    RETURN FALSE;
END;
$$;

-- ============================================
-- 3. TESTAR A NOVA FUNÇÃO
-- ============================================

SELECT '=== TESTANDO NOVA FUNÇÃO ===' as status;

-- Testar salvamento
SELECT save_system_config(
  'Sistema Teste com Logs',
  NULL,
  NULL,
  '#ff0000',
  '#00ff00'
) as resultado_teste;

-- ============================================
-- 4. VERIFICAR RESULTADO
-- ============================================

SELECT '=== VERIFICANDO RESULTADO ===' as status;

SELECT * FROM system_config;
SELECT * FROM get_system_config();
