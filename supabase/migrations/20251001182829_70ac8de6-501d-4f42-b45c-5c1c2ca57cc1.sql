-- Criar tabela de perfis de usuários
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Criar tabela de clientes
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT,
  endereco TEXT,
  data_cadastro TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cpf)
);

-- Habilitar RLS
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Políticas para clientes
CREATE POLICY "Usuários podem ver seus próprios clientes"
  ON public.clientes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios clientes"
  ON public.clientes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios clientes"
  ON public.clientes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios clientes"
  ON public.clientes FOR DELETE
  USING (auth.uid() = user_id);

-- Criar tabela de empréstimos
CREATE TABLE public.emprestimos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  valor_principal DECIMAL(10, 2) NOT NULL CHECK (valor_principal > 0),
  taxa_juros_mensal DECIMAL(5, 2) DEFAULT 30.00 CHECK (taxa_juros_mensal >= 0),
  taxa_juros_diaria DECIMAL(8, 6) GENERATED ALWAYS AS (taxa_juros_mensal / 30) STORED,
  data_emprestimo DATE NOT NULL DEFAULT CURRENT_DATE,
  data_vencimento DATE NOT NULL,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'pago', 'vencido', 'parcial')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.emprestimos ENABLE ROW LEVEL SECURITY;

-- Políticas para empréstimos
CREATE POLICY "Usuários podem ver seus próprios empréstimos"
  ON public.emprestimos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios empréstimos"
  ON public.emprestimos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios empréstimos"
  ON public.emprestimos FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios empréstimos"
  ON public.emprestimos FOR DELETE
  USING (auth.uid() = user_id);

-- Criar tabela de pagamentos
CREATE TABLE public.pagamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emprestimo_id UUID NOT NULL REFERENCES public.emprestimos(id) ON DELETE CASCADE,
  valor_pago DECIMAL(10, 2) NOT NULL CHECK (valor_pago > 0),
  tipo_pagamento TEXT NOT NULL CHECK (tipo_pagamento IN ('total', 'juros', 'parcial', 'principal')),
  data_pagamento TIMESTAMPTZ DEFAULT NOW(),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;

-- Políticas para pagamentos
CREATE POLICY "Usuários podem ver seus próprios pagamentos"
  ON public.pagamentos FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios pagamentos"
  ON public.pagamentos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios pagamentos"
  ON public.pagamentos FOR UPDATE
  USING (auth.uid() = user_id);

-- Criar tabela de lembretes
CREATE TABLE public.lembretes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emprestimo_id UUID NOT NULL REFERENCES public.emprestimos(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('previo', 'vencimento', 'atraso')),
  data_envio TIMESTAMPTZ,
  enviado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.lembretes ENABLE ROW LEVEL SECURITY;

-- Políticas para lembretes
CREATE POLICY "Usuários podem ver seus próprios lembretes"
  ON public.lembretes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios lembretes"
  ON public.lembretes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios lembretes"
  ON public.lembretes FOR UPDATE
  USING (auth.uid() = user_id);

-- Função para criar perfil automaticamente ao criar usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'nome', 'Usuário'),
    new.email
  );
  RETURN new;
END;
$$;

-- Trigger para criar perfil automaticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar status do empréstimo baseado em vencimento
CREATE OR REPLACE FUNCTION public.atualizar_status_emprestimos()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.emprestimos
  SET status = 'vencido'
  WHERE status = 'ativo'
    AND data_vencimento < CURRENT_DATE;
END;
$$;

-- Índices para melhorar performance
CREATE INDEX idx_clientes_user_id ON public.clientes(user_id);
CREATE INDEX idx_clientes_cpf ON public.clientes(cpf);
CREATE INDEX idx_emprestimos_user_id ON public.emprestimos(user_id);
CREATE INDEX idx_emprestimos_cliente_id ON public.emprestimos(cliente_id);
CREATE INDEX idx_emprestimos_status ON public.emprestimos(status);
CREATE INDEX idx_emprestimos_data_vencimento ON public.emprestimos(data_vencimento);
CREATE INDEX idx_pagamentos_emprestimo_id ON public.pagamentos(emprestimo_id);
CREATE INDEX idx_lembretes_emprestimo_id ON public.lembretes(emprestimo_id);