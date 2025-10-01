-- Adicionar campos para juros diários configuráveis na tabela de empréstimos
ALTER TABLE public.emprestimos 
ADD COLUMN taxa_juros_diaria_atraso DECIMAL(8, 6) DEFAULT 0.033333 CHECK (taxa_juros_diaria_atraso >= 0),
ADD COLUMN juros_diarios_calculados DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN dias_atraso INTEGER DEFAULT 0,
ADD COLUMN data_ultimo_calculo TIMESTAMPTZ DEFAULT NOW();

-- Criar tabela para configurações de juros por cliente
CREATE TABLE public.configuracoes_juros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  taxa_juros_diaria_padrao DECIMAL(8, 6) DEFAULT 0.033333 CHECK (taxa_juros_diaria_padrao >= 0),
  taxa_juros_diaria_atraso DECIMAL(8, 6) DEFAULT 0.05 CHECK (taxa_juros_diaria_atraso >= 0),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, cliente_id)
);

-- Habilitar RLS
ALTER TABLE public.configuracoes_juros ENABLE ROW LEVEL SECURITY;

-- Políticas para configuracoes_juros
CREATE POLICY "Usuários podem ver suas próprias configurações de juros"
  ON public.configuracoes_juros FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias configurações de juros"
  ON public.configuracoes_juros FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias configurações de juros"
  ON public.configuracoes_juros FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias configurações de juros"
  ON public.configuracoes_juros FOR DELETE
  USING (auth.uid() = user_id);

-- Função para calcular juros diários automaticamente
CREATE OR REPLACE FUNCTION public.calcular_juros_diarios()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  emprestimo_record RECORD;
  dias_atraso INTEGER;
  juros_calculados DECIMAL(10, 2);
  taxa_diaria DECIMAL(8, 6);
BEGIN
  -- Atualizar empréstimos vencidos
  UPDATE public.emprestimos
  SET status = 'vencido'
  WHERE status = 'ativo'
    AND data_vencimento < CURRENT_DATE;

  -- Calcular juros diários para empréstimos vencidos
  FOR emprestimo_record IN 
    SELECT e.*, cj.taxa_juros_diaria_atraso
    FROM public.emprestimos e
    LEFT JOIN public.configuracoes_juros cj ON e.cliente_id = cj.cliente_id AND cj.ativo = TRUE
    WHERE e.status IN ('vencido', 'parcial')
      AND e.data_vencimento < CURRENT_DATE
  LOOP
    -- Calcular dias de atraso
    dias_atraso := CURRENT_DATE - emprestimo_record.data_vencimento;
    
    -- Usar taxa configurada ou padrão
    taxa_diaria := COALESCE(emprestimo_record.taxa_juros_diaria_atraso, 0.05);
    
    -- Calcular juros (valor_principal * taxa_diaria * dias_atraso)
    juros_calculados := emprestimo_record.valor_principal * taxa_diaria * dias_atraso;
    
    -- Atualizar empréstimo
    UPDATE public.emprestimos
    SET 
      dias_atraso = dias_atraso,
      juros_diarios_calculados = juros_calculados,
      data_ultimo_calculo = NOW()
    WHERE id = emprestimo_record.id;
  END LOOP;
END;
$$;

-- Função para obter configuração de juros de um cliente
CREATE OR REPLACE FUNCTION public.get_configuracao_juros(p_cliente_id UUID)
RETURNS TABLE(
  taxa_juros_diaria_padrao DECIMAL(8, 6),
  taxa_juros_diaria_atraso DECIMAL(8, 6)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(cj.taxa_juros_diaria_padrao, 0.033333) as taxa_juros_diaria_padrao,
    COALESCE(cj.taxa_juros_diaria_atraso, 0.05) as taxa_juros_diaria_atraso
  FROM public.configuracoes_juros cj
  WHERE cj.cliente_id = p_cliente_id 
    AND cj.ativo = TRUE
    AND cj.user_id = auth.uid()
  LIMIT 1;
  
  -- Se não encontrou configuração, retorna valores padrão
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0.033333::DECIMAL(8, 6), 0.05::DECIMAL(8, 6);
  END IF;
END;
$$;

-- Índices para melhorar performance
CREATE INDEX idx_configuracoes_juros_cliente_id ON public.configuracoes_juros(cliente_id);
CREATE INDEX idx_configuracoes_juros_user_id ON public.configuracoes_juros(user_id);
CREATE INDEX idx_emprestimos_dias_atraso ON public.emprestimos(dias_atraso);
CREATE INDEX idx_emprestimos_data_ultimo_calculo ON public.emprestimos(data_ultimo_calculo);
