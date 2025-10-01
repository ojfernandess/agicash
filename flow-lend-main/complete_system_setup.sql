-- SCRIPT COMPLETO DE CONFIGURAÇÃO DO SISTEMA
-- Execute este script no SQL Editor do Supabase para configurar tudo

-- ============================================
-- 1. CRIAR TABELA SYSTEM_CONFIG
-- ============================================
CREATE TABLE IF NOT EXISTS public.system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  system_name TEXT DEFAULT 'Flow Lend',
  logo_url TEXT,
  favicon_url TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#64748b',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Políticas para system_config
DROP POLICY IF EXISTS "Usuários podem ver suas próprias configurações" ON public.system_config;
CREATE POLICY "Usuários podem ver suas próprias configurações"
  ON public.system_config FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem criar suas próprias configurações" ON public.system_config;
CREATE POLICY "Usuários podem criar suas próprias configurações"
  ON public.system_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar suas próprias configurações" ON public.system_config;
CREATE POLICY "Usuários podem atualizar suas próprias configurações"
  ON public.system_config FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem deletar suas próprias configurações" ON public.system_config;
CREATE POLICY "Usuários podem deletar suas próprias configurações"
  ON public.system_config FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 2. CRIAR FUNÇÃO GET_SYSTEM_CONFIG
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
DECLARE
  config_exists BOOLEAN := FALSE;
BEGIN
  -- Verificar se existe configuração para o usuário
  SELECT EXISTS(
    SELECT 1 FROM public.system_config 
    WHERE user_id = auth.uid()
  ) INTO config_exists;
  
  -- Se existe configuração, retornar ela
  IF config_exists THEN
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
  ELSE
    -- Se não existe, retornar valores padrão
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
-- 3. CRIAR BUCKET DE STORAGE
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('system-assets', 'system-assets', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. CRIAR POLÍTICAS DO STORAGE
-- ============================================
-- Política para permitir que usuários autenticados façam upload
DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de assets do sistema" ON storage.objects;
CREATE POLICY "Usuários autenticados podem fazer upload de assets do sistema"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'system-assets' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir que usuários autenticados vejam os assets
DROP POLICY IF EXISTS "Usuários autenticados podem ver assets do sistema" ON storage.objects;
CREATE POLICY "Usuários autenticados podem ver assets do sistema"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'system-assets' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir que usuários autenticados atualizem seus próprios assets
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios assets do sistema" ON storage.objects;
CREATE POLICY "Usuários podem atualizar seus próprios assets do sistema"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'system-assets' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir que usuários autenticados deletem seus próprios assets
DROP POLICY IF EXISTS "Usuários podem deletar seus próprios assets do sistema" ON storage.objects;
CREATE POLICY "Usuários podem deletar seus próprios assets do sistema"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'system-assets' 
  AND auth.role() = 'authenticated'
);

-- ============================================
-- 5. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_system_config_user_id ON public.system_config(user_id);

-- ============================================
-- 6. VERIFICAÇÃO FINAL
-- ============================================
-- Verificar se tudo foi criado corretamente
SELECT 'system_config table' as item, 
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_config') 
            THEN 'OK' ELSE 'ERRO' END as status;

SELECT 'get_system_config function' as item,
       CASE WHEN EXISTS (SELECT 1 FROM information_schema.routines WHERE routine_name = 'get_system_config')
            THEN 'OK' ELSE 'ERRO' END as status;

SELECT 'system-assets bucket' as item,
       CASE WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'system-assets')
            THEN 'OK' ELSE 'ERRO' END as status;

-- Testar a função
SELECT 'Function test' as item, * FROM get_system_config();
