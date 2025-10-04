-- Script simples para adicionar colunas Pix na tabela profiles
-- Execute este script no SQL Editor do Supabase

-- Adicionar colunas Pix
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pix_key TEXT,
  ADD COLUMN IF NOT EXISTS pix_tipo TEXT;

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
  AND column_name IN ('pix_key', 'pix_tipo')
ORDER BY column_name;

-- Exemplo de como atualizar um usuário com chave Pix
-- UPDATE public.profiles 
-- SET pix_key = 'seu-email@exemplo.com', pix_tipo = 'email'
-- WHERE id = 'seu-user-id-aqui';
