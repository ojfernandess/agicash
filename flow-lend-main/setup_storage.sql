-- Criar bucket para assets do sistema
INSERT INTO storage.buckets (id, name, public)
VALUES ('system-assets', 'system-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir que usuários autenticados façam upload
CREATE POLICY "Usuários autenticados podem fazer upload de assets do sistema"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'system-assets' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir que usuários autenticados vejam os assets
CREATE POLICY "Usuários autenticados podem ver assets do sistema"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'system-assets' 
  AND auth.role() = 'authenticated'
);

-- Política para permitir que usuários autenticados atualizem seus próprios assets
CREATE POLICY "Usuários podem atualizar seus próprios assets do sistema"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'system-assets' 
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para permitir que usuários autenticados deletem seus próprios assets
CREATE POLICY "Usuários podem deletar seus próprios assets do sistema"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'system-assets' 
  AND auth.role() = 'authenticated'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
