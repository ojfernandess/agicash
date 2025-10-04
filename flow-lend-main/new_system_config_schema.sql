-- Novo schema simplificado para configurações do sistema
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. LIMPAR TUDO E RECOMEÇAR
-- ============================================

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "system_config_select_policy" ON public.system_config;
DROP POLICY IF EXISTS "system_config_insert_policy" ON public.system_config;
DROP POLICY IF EXISTS "system_config_update_policy" ON public.system_config;
DROP POLICY IF EXISTS "system_config_delete_policy" ON public.system_config;
DROP POLICY IF EXISTS "system_config_all_access" ON public.system_config;
DROP POLICY IF EXISTS "Todos os usuários autenticados podem ver configurações do sistema" ON public.system_config;
DROP POLICY IF EXISTS "Todos os usuários autenticados podem criar configurações do sistema" ON public.system_config;
DROP POLICY IF EXISTS "Todos os usuários autenticados podem atualizar configurações do sistema" ON public.system_config;
DROP POLICY IF EXISTS "Todos os usuários autenticados podem deletar configurações do sistema" ON public.system_config;

-- Remover funções existentes
DROP FUNCTION IF EXISTS public.get_system_config();
DROP FUNCTION IF EXISTS public.save_system_config(TEXT, TEXT, TEXT, TEXT, TEXT);

-- Remover tabela existente
DROP TABLE IF EXISTS public.system_config;

-- ============================================
-- 2. CRIAR NOVA TABELA SIMPLIFICADA
-- ============================================

CREATE TABLE public.system_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  system_name TEXT NOT NULL DEFAULT 'Flow Lend',
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#3b82f6',
  secondary_color TEXT NOT NULL DEFAULT '#64748b',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. HABILITAR RLS E CRIAR POLÍTICA SIMPLES
-- ============================================

ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Política simples: todos os usuários autenticados podem fazer tudo
CREATE POLICY "system_config_policy"
  ON public.system_config FOR ALL
  USING (auth.role() = 'authenticated');

-- ============================================
-- 4. CRIAR FUNÇÃO GET_SYSTEM_CONFIG
-- ============================================

CREATE OR REPLACE FUNCTION public.get_system_config()
RETURNS TABLE (
  id UUID,
  system_name TEXT,
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sc.id,
    sc.system_name,
    sc.logo_url,
    sc.favicon_url,
    sc.primary_color,
    sc.secondary_color,
    sc.created_at,
    sc.updated_at
  FROM public.system_config sc
  ORDER BY sc.updated_at DESC
  LIMIT 1;
  
  -- Se não há configuração, retornar valores padrão
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      gen_random_uuid() as id,
      'Flow Lend'::TEXT as system_name,
      NULL::TEXT as logo_url,
      NULL::TEXT as favicon_url,
      '#3b82f6'::TEXT as primary_color,
      '#64748b'::TEXT as secondary_color,
      NOW() as created_at,
      NOW() as updated_at;
  END IF;
END;
$$;

-- ============================================
-- 5. CRIAR FUNÇÃO SAVE_SYSTEM_CONFIG
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
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Contar configurações existentes
  SELECT COUNT(*) INTO v_count FROM public.system_config;
  
  IF v_count > 0 THEN
    -- Atualizar configuração existente
    UPDATE public.system_config SET
      system_name = COALESCE(p_system_name, system_name),
      logo_url = p_logo_url,
      favicon_url = p_favicon_url,
      primary_color = COALESCE(p_primary_color, primary_color),
      secondary_color = COALESCE(p_secondary_color, secondary_color),
      updated_at = NOW();
  ELSE
    -- Criar nova configuração
    INSERT INTO public.system_config (
      system_name,
      logo_url,
      favicon_url,
      primary_color,
      secondary_color
    ) VALUES (
      COALESCE(p_system_name, 'Flow Lend'),
      p_logo_url,
      p_favicon_url,
      COALESCE(p_primary_color, '#3b82f6'),
      COALESCE(p_secondary_color, '#64748b')
    );
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- ============================================
-- 6. INSERIR CONFIGURAÇÃO INICIAL
-- ============================================

INSERT INTO public.system_config (
  system_name,
  logo_url,
  favicon_url,
  primary_color,
  secondary_color
) VALUES (
  'Flow Lend',
  NULL,
  NULL,
  '#3b82f6',
  '#64748b'
);

-- ============================================
-- 7. TESTAR FUNÇÕES
-- ============================================

-- Testar get_system_config
SELECT 'Testando get_system_config:' as info;
SELECT * FROM public.get_system_config();

-- Testar save_system_config
SELECT 'Testando save_system_config:' as info;
SELECT public.save_system_config(
  'Sistema Teste Novo Schema',
  NULL,
  NULL,
  '#ff0000',
  '#00ff00'
) as resultado;

-- Verificar se foi salvo
SELECT 'Verificando se foi salvo:' as info;
SELECT * FROM public.get_system_config();

SELECT '=== NOVO SCHEMA CRIADO COM SUCESSO ===' as status;
