-- Adiciona campos pessoais e chave pix em public.profiles

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS telefone TEXT,
  ADD COLUMN IF NOT EXISTS documento TEXT,            -- CPF/CNPJ
  ADD COLUMN IF NOT EXISTS endereco TEXT,
  ADD COLUMN IF NOT EXISTS cidade TEXT,
  ADD COLUMN IF NOT EXISTS estado TEXT,
  ADD COLUMN IF NOT EXISTS cep TEXT,
  ADD COLUMN IF NOT EXISTS pix_key TEXT,              -- chave pix opcional
  ADD COLUMN IF NOT EXISTS pix_tipo TEXT,             -- email | cpf | cnpj | telefone | aleatoria
  ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_documento ON public.profiles(documento);

-- Consulta de verificação
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles' AND table_schema='public'
ORDER BY ordinal_position;


