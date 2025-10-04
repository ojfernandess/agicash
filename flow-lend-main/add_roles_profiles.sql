-- Adiciona controle de papéis (admin, financeiro, usuario) em public.profiles

-- 1) Campo role na tabela profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT
  CHECK (role IN ('admin','financeiro','usuario'))
  DEFAULT 'usuario';

-- 2) Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3) Políticas
-- Admin pode tudo em profiles
DROP POLICY IF EXISTS profiles_admin_all ON public.profiles;
CREATE POLICY profiles_admin_all
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Usuário pode ver a si mesmo
DROP POLICY IF EXISTS profiles_self_select ON public.profiles;
CREATE POLICY profiles_self_select
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Usuário pode atualizar a si mesmo, mas não pode alterar o próprio role
DROP POLICY IF EXISTS profiles_self_update ON public.profiles;
CREATE POLICY profiles_self_update
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid() AND role = role);

-- Índice opcional para busca por role
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Consulta de verificação
SELECT 'profiles columns' as info,
       column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema='public'
ORDER BY ordinal_position;


