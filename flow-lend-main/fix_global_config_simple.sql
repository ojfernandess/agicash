-- Script simples para corrigir configurações globais
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. REMOVER TODAS AS POLÍTICAS EXISTENTES
-- ============================================

-- Listar e remover todas as políticas da tabela system_config
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Remover todas as políticas existentes
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'system_config' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.system_config', policy_record.policyname);
    END LOOP;
END $$;

-- ============================================
-- 2. CRIAR NOVAS POLÍTICAS GLOBAIS
-- ============================================

-- Criar políticas que permitem acesso global
CREATE POLICY "global_select_config"
  ON public.system_config FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "global_insert_config"
  ON public.system_config FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "global_update_config"
  ON public.system_config FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "global_delete_config"
  ON public.system_config FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- 3. RECRIAR FUNÇÃO GET_SYSTEM_CONFIG
-- ============================================

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
  -- Buscar a primeira configuração disponível (configuração global)
  RETURN QUERY
  SELECT 
    COALESCE(sc.system_name, 'Flow Lend') as system_name,
    sc.logo_url,
    sc.favicon_url,
    COALESCE(sc.primary_color, '#3b82f6') as primary_color,
    COALESCE(sc.secondary_color, '#64748b') as secondary_color
  FROM public.system_config sc
  ORDER BY sc.updated_at DESC, sc.created_at DESC
  LIMIT 1;
  
  -- Se não encontrou configuração, retornar valores padrão
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

-- ============================================
-- 4. CRIAR FUNÇÃO SAVE_SYSTEM_CONFIG
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
-- 5. VERIFICAÇÃO FINAL
-- ============================================

-- Verificar políticas criadas
SELECT '=== POLÍTICAS CRIADAS ===' as status;

SELECT 
  policyname,
  cmd
FROM pg_policies 
WHERE tablename = 'system_config'
ORDER BY policyname;

-- Verificar configurações existentes
SELECT '=== CONFIGURAÇÕES EXISTENTES ===' as status;

SELECT 
  id,
  user_id,
  system_name,
  primary_color,
  secondary_color,
  created_at,
  updated_at
FROM system_config
ORDER BY updated_at DESC;

-- Testar a função
SELECT '=== TESTE DA FUNÇÃO ===' as status;
SELECT * FROM get_system_config();
