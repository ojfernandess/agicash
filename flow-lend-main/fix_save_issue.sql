-- Script completo para diagnosticar e corrigir problema de salvamento
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. DIAGNÓSTICO INICIAL
-- ============================================

SELECT '=== DIAGNÓSTICO INICIAL ===' as status;

-- Verificar se a função existe
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name = 'save_system_config'
  AND routine_schema = 'public';

-- Verificar políticas RLS
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'system_config'
ORDER BY policyname;

-- Verificar dados atuais
SELECT * FROM system_config;
SELECT * FROM get_system_config();

-- ============================================
-- 2. CORRIGIR POLÍTICAS RLS
-- ============================================

SELECT '=== CORRIGINDO POLÍTICAS RLS ===' as status;

-- Remover políticas existentes
DROP POLICY IF EXISTS "Todos os usuários autenticados podem ver configurações do sistema" ON public.system_config;
DROP POLICY IF EXISTS "Todos os usuários autenticados podem criar configurações do sistema" ON public.system_config;
DROP POLICY IF EXISTS "Todos os usuários autenticados podem atualizar configurações do sistema" ON public.system_config;
DROP POLICY IF EXISTS "Todos os usuários autenticados podem deletar configurações do sistema" ON public.system_config;

-- Criar políticas corretas
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
-- 3. RECRIAR FUNÇÃO SAVE_SYSTEM_CONFIG
-- ============================================

SELECT '=== RECRIANDO FUNÇÃO SAVE_SYSTEM_CONFIG ===' as status;

-- Remover função existente
DROP FUNCTION IF EXISTS public.save_system_config(TEXT, TEXT, TEXT, TEXT, TEXT);

-- Criar nova função
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
  -- Obter user_id
  v_user_id := auth.uid();
  
  -- Verificar se já existe configuração
  SELECT COUNT(*) INTO v_count FROM public.system_config;
  
  IF v_count > 0 THEN
    -- Atualizar configuração existente
    UPDATE public.system_config SET
      system_name = p_system_name,
      logo_url = p_logo_url,
      favicon_url = p_favicon_url,
      primary_color = p_primary_color,
      secondary_color = p_secondary_color,
      updated_at = NOW();
  ELSE
    -- Criar nova configuração
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
  END IF;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- ============================================
-- 4. TESTAR FUNÇÃO
-- ============================================

SELECT '=== TESTANDO FUNÇÃO ===' as status;

-- Testar salvamento
SELECT save_system_config(
  'Sistema Teste Corrigido',
  NULL,
  NULL,
  '#ff0000',
  '#00ff00'
) as resultado_teste;

-- ============================================
-- 5. VERIFICAR RESULTADO
-- ============================================

SELECT '=== VERIFICANDO RESULTADO ===' as status;

SELECT * FROM system_config;
SELECT * FROM get_system_config();

-- ============================================
-- 6. TESTAR ATUALIZAÇÃO
-- ============================================

SELECT '=== TESTANDO ATUALIZAÇÃO ===' as status;

-- Testar atualização
SELECT save_system_config(
  'Sistema Atualizado Final',
  NULL,
  NULL,
  '#0000ff',
  '#ffff00'
) as resultado_atualizacao;

-- Verificar se foi atualizado
SELECT * FROM system_config;
SELECT * FROM get_system_config();
