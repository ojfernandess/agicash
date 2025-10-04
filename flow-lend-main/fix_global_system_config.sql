-- Script para corrigir configurações do sistema para serem globais
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. CORRIGIR POLÍTICAS DA TABELA SYSTEM_CONFIG
-- ============================================

-- Remover TODAS as políticas existentes (antigas e novas)
DROP POLICY IF EXISTS "Usuários podem ver suas próprias configurações" ON public.system_config;
DROP POLICY IF EXISTS "Usuários podem criar suas próprias configurações" ON public.system_config;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias configurações" ON public.system_config;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias configurações" ON public.system_config;
DROP POLICY IF EXISTS "Todos os usuários autenticados podem ver configurações do sistema" ON public.system_config;
DROP POLICY IF EXISTS "Todos os usuários autenticados podem criar configurações do sistema" ON public.system_config;
DROP POLICY IF EXISTS "Todos os usuários autenticados podem atualizar configurações do sistema" ON public.system_config;
DROP POLICY IF EXISTS "Todos os usuários autenticados podem deletar configurações do sistema" ON public.system_config;

-- Criar políticas que permitem acesso global
CREATE POLICY "Todos os usuários autenticados podem ver configurações do sistema"
  ON public.system_config FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Todos os usuários autenticados podem criar configurações do sistema"
  ON public.system_config FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Todos os usuários autenticados podem atualizar configurações do sistema"
  ON public.system_config FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Todos os usuários autenticados podem deletar configurações do sistema"
  ON public.system_config FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- 2. MODIFICAR FUNÇÃO GET_SYSTEM_CONFIG
-- ============================================

-- Recriar a função para retornar configuração global
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
-- 3. CRIAR FUNÇÃO PARA SALVAR CONFIGURAÇÃO GLOBAL
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
-- 4. CONSOLIDAR CONFIGURAÇÕES EXISTENTES
-- ============================================

-- Se existem múltiplas configurações, manter apenas a mais recente
WITH latest_config AS (
  SELECT 
    system_name,
    logo_url,
    favicon_url,
    primary_color,
    secondary_color,
    updated_at
  FROM public.system_config
  ORDER BY updated_at DESC, created_at DESC
  LIMIT 1
)
-- Deletar configurações antigas e manter apenas a mais recente
DELETE FROM public.system_config 
WHERE id NOT IN (
  SELECT id FROM public.system_config
  ORDER BY updated_at DESC, created_at DESC
  LIMIT 1
);

-- ============================================
-- 5. VERIFICAÇÃO FINAL
-- ============================================

-- Verificar políticas criadas
SELECT '=== POLÍTICAS CRIADAS ===' as status;

SELECT 
  tablename,
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
