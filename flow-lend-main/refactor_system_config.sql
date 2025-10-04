-- Script para refazer completamente o schema de configurações do sistema
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. LIMPAR ESTRUTURA EXISTENTE
-- ============================================

SELECT '=== LIMPANDO ESTRUTURA EXISTENTE ===' as status;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Todos os usuários autenticados podem ver configurações do sistema" ON public.system_config;
DROP POLICY IF EXISTS "Todos os usuários autenticados podem criar configurações do sistema" ON public.system_config;
DROP POLICY IF EXISTS "Todos os usuários autenticados podem atualizar configurações do sistema" ON public.system_config;
DROP POLICY IF EXISTS "Todos os usuários autenticados podem deletar configurações do sistema" ON public.system_config;
DROP POLICY IF EXISTS "Usuários podem ver suas próprias configurações" ON public.system_config;
DROP POLICY IF EXISTS "Usuários podem criar suas próprias configurações" ON public.system_config;
DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias configurações" ON public.system_config;
DROP POLICY IF EXISTS "Usuários podem deletar suas próprias configurações" ON public.system_config;

-- Remover funções existentes
DROP FUNCTION IF EXISTS public.get_system_config();
DROP FUNCTION IF EXISTS public.save_system_config(TEXT, TEXT, TEXT, TEXT, TEXT);

-- Limpar dados existentes
DELETE FROM public.system_config;

-- ============================================
-- 2. RECRIAR TABELA SYSTEM_CONFIG
-- ============================================

SELECT '=== RECRIANDO TABELA SYSTEM_CONFIG ===' as status;

-- Remover tabela existente
DROP TABLE IF EXISTS public.system_config;

-- Criar nova tabela com estrutura simplificada
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
-- 3. CRIAR POLÍTICAS RLS SIMPLIFICADAS
-- ============================================

SELECT '=== CRIANDO POLÍTICAS RLS ===' as status;

-- Habilitar RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Política para SELECT (todos os usuários autenticados podem ver)
CREATE POLICY "system_config_select_policy"
  ON public.system_config FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política para INSERT (todos os usuários autenticados podem inserir)
CREATE POLICY "system_config_insert_policy"
  ON public.system_config FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Política para UPDATE (todos os usuários autenticados podem atualizar)
CREATE POLICY "system_config_update_policy"
  ON public.system_config FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Política para DELETE (todos os usuários autenticados podem deletar)
CREATE POLICY "system_config_delete_policy"
  ON public.system_config FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- 4. CRIAR FUNÇÃO GET_SYSTEM_CONFIG
-- ============================================

SELECT '=== CRIANDO FUNÇÃO GET_SYSTEM_CONFIG ===' as status;

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
SET search_path = public
AS $$
BEGIN
  -- Retornar a configuração mais recente ou criar uma padrão se não existir
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

SELECT '=== CRIANDO FUNÇÃO SAVE_SYSTEM_CONFIG ===' as status;

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
  v_count INTEGER;
BEGIN
  -- Verificar se já existe uma configuração
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

SELECT '=== INSERINDO CONFIGURAÇÃO INICIAL ===' as status;

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

SELECT '=== TESTANDO FUNÇÕES ===' as status;

-- Testar get_system_config
SELECT 'Testando get_system_config:' as info;
SELECT * FROM public.get_system_config();

-- Testar save_system_config
SELECT 'Testando save_system_config:' as info;
SELECT public.save_system_config(
  'Meu Sistema Teste',
  NULL,
  NULL,
  '#ff0000',
  '#00ff00'
) as resultado;

-- Verificar se foi salvo
SELECT 'Verificando se foi salvo:' as info;
SELECT * FROM public.get_system_config();

-- ============================================
-- 8. VERIFICAR POLÍTICAS
-- ============================================

SELECT '=== VERIFICANDO POLÍTICAS ===' as status;

SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'system_config'
ORDER BY policyname;

-- ============================================
-- 9. TESTE FINAL
-- ============================================

SELECT '=== TESTE FINAL ===' as status;

-- Testar atualização
SELECT public.save_system_config(
  'Sistema Final Teste',
  'https://example.com/logo.png',
  'https://example.com/favicon.ico',
  '#0000ff',
  '#ffff00'
) as resultado_final;

-- Verificar resultado final
SELECT * FROM public.get_system_config();

SELECT '=== CONFIGURAÇÃO DO SISTEMA REFATORADA COM SUCESSO ===' as status;
