-- Criar tabela para configurações do sistema
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
CREATE POLICY "Usuários podem ver suas próprias configurações"
  ON public.system_config FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias configurações"
  ON public.system_config FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias configurações"
  ON public.system_config FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias configurações"
  ON public.system_config FOR DELETE
  USING (auth.uid() = user_id);

-- Função para obter configuração do sistema
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
  
  -- Se não encontrou configuração, retorna valores padrão
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

-- Índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_system_config_user_id ON public.system_config(user_id);
