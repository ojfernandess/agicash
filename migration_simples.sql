-- MIGRAÇÃO SIMPLES - Execute no SQL Editor do Supabase
-- 1. Criar tabela de configurações de juros

CREATE TABLE IF NOT EXISTS public.configuracoes_juros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  taxa_juros_diaria_padrao DECIMAL(8, 6) DEFAULT 0.033333,
  taxa_juros_diaria_atraso DECIMAL(8, 6) DEFAULT 0.05,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cliente_id)
);

-- 2. Habilitar RLS
ALTER TABLE public.configuracoes_juros ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas básicas
CREATE POLICY "Usuários podem ver suas configurações" ON public.configuracoes_juros FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem criar configurações" ON public.configuracoes_juros FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuários podem atualizar configurações" ON public.configuracoes_juros FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários podem deletar configurações" ON public.configuracoes_juros FOR DELETE USING (auth.uid() = user_id);

-- 4. Adicionar campos na tabela emprestimos (se não existirem)
ALTER TABLE public.emprestimos ADD COLUMN IF NOT EXISTS taxa_juros_diaria_atraso DECIMAL(8, 6) DEFAULT 0.05;
ALTER TABLE public.emprestimos ADD COLUMN IF NOT EXISTS juros_diarios_calculados DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE public.emprestimos ADD COLUMN IF NOT EXISTS dias_atraso INTEGER DEFAULT 0;
ALTER TABLE public.emprestimos ADD COLUMN IF NOT EXISTS data_ultimo_calculo TIMESTAMPTZ DEFAULT NOW();
