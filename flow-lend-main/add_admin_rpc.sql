-- Função para verificar se o usuário atual é admin, ignorando RLS
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_admin boolean := false;
  v_email text;
BEGIN
  -- Tentar extrair email do JWT
  BEGIN
    v_email := auth.jwt() ->> 'email';
  EXCEPTION WHEN OTHERS THEN
    v_email := NULL;
  END;

  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE (
      p.id = auth.uid()
      OR (v_email IS NOT NULL AND p.email = v_email)
    )
    AND p.role = 'admin'
  ) INTO v_is_admin;

  RETURN COALESCE(v_is_admin, false);
END;
$$;


