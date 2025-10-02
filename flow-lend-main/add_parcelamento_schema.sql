-- Script para adicionar funcionalidade de parcelamento aos empréstimos
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. ADICIONAR COLUNAS DE PARCELAMENTO NA TABELA EMPRESTIMOS
-- ============================================

SELECT '=== ADICIONANDO COLUNAS DE PARCELAMENTO ===' as status;

-- Adicionar colunas para parcelamento
ALTER TABLE public.emprestimos 
ADD COLUMN IF NOT EXISTS parcelado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS numero_parcelas INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS valor_parcela DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS intervalo_pagamento INTEGER DEFAULT 30, -- dias entre parcelas
ADD COLUMN IF NOT EXISTS data_primeira_parcela DATE,
ADD COLUMN IF NOT EXISTS observacoes_parcelamento TEXT;

-- ============================================
-- 2. CRIAR TABELA DE PARCELAS
-- ============================================

SELECT '=== CRIANDO TABELA DE PARCELAS ===' as status;

CREATE TABLE IF NOT EXISTS public.parcelas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  emprestimo_id UUID NOT NULL REFERENCES public.emprestimos(id) ON DELETE CASCADE,
  numero_parcela INTEGER NOT NULL,
  valor_parcela DECIMAL(10,2) NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  valor_pago DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
  juros_aplicados DECIMAL(10,2) DEFAULT 0,
  multa_aplicada DECIMAL(10,2) DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. HABILITAR RLS NA TABELA PARCELAS
-- ============================================

SELECT '=== HABILITANDO RLS NA TABELA PARCELAS ===' as status;

ALTER TABLE public.parcelas ENABLE ROW LEVEL SECURITY;

-- Política para SELECT
CREATE POLICY "Todos os usuários autenticados podem ver parcelas"
  ON public.parcelas FOR SELECT
  USING (auth.role() = 'authenticated');

-- Política para INSERT
CREATE POLICY "Todos os usuários autenticados podem criar parcelas"
  ON public.parcelas FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Política para UPDATE
CREATE POLICY "Todos os usuários autenticados podem atualizar parcelas"
  ON public.parcelas FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Política para DELETE
CREATE POLICY "Todos os usuários autenticados podem deletar parcelas"
  ON public.parcelas FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================
-- 4. CRIAR FUNÇÃO PARA GERAR PARCELAS
-- ============================================

SELECT '=== CRIANDO FUNÇÃO PARA GERAR PARCELAS ===' as status;

CREATE OR REPLACE FUNCTION public.gerar_parcelas(
  p_emprestimo_id UUID,
  p_numero_parcelas INTEGER,
  p_valor_parcela DECIMAL(10,2),
  p_data_primeira_parcela DATE,
  p_intervalo_dias INTEGER DEFAULT 30
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_parcela INTEGER;
  v_data_vencimento DATE;
BEGIN
  -- Limpar parcelas existentes para este empréstimo
  DELETE FROM public.parcelas WHERE emprestimo_id = p_emprestimo_id;
  
  -- Gerar as parcelas
  FOR v_parcela IN 1..p_numero_parcelas LOOP
    v_data_vencimento := p_data_primeira_parcela + ((v_parcela - 1) * p_intervalo_dias);
    
    INSERT INTO public.parcelas (
      emprestimo_id,
      numero_parcela,
      valor_parcela,
      data_vencimento,
      status
    ) VALUES (
      p_emprestimo_id,
      v_parcela,
      p_valor_parcela,
      v_data_vencimento,
      'pendente'
    );
  END LOOP;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- ============================================
-- 5. CRIAR FUNÇÃO PARA ATUALIZAR STATUS DAS PARCELAS
-- ============================================

SELECT '=== CRIANDO FUNÇÃO PARA ATUALIZAR STATUS ===' as status;

CREATE OR REPLACE FUNCTION public.atualizar_status_parcelas()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Atualizar parcelas atrasadas
  UPDATE public.parcelas 
  SET status = 'atrasado'
  WHERE status = 'pendente' 
    AND data_vencimento < CURRENT_DATE;
    
  -- Atualizar parcelas pagas
  UPDATE public.parcelas 
  SET status = 'pago'
  WHERE status IN ('pendente', 'atrasado')
    AND valor_pago >= valor_parcela;
END;
$$;

-- ============================================
-- 6. CRIAR FUNÇÃO PARA CALCULAR JUROS DAS PARCELAS
-- ============================================

SELECT '=== CRIANDO FUNÇÃO PARA CALCULAR JUROS ===' as status;

CREATE OR REPLACE FUNCTION public.calcular_juros_parcelas(
  p_emprestimo_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_taxa_juros DECIMAL(5,4);
  v_dias_atraso INTEGER;
  v_juros DECIMAL(10,2);
  v_parcela_rec RECORD;
BEGIN
  -- Obter taxa de juros do empréstimo
  SELECT taxa_juros_diaria_atraso INTO v_taxa_juros
  FROM public.emprestimos 
  WHERE id = p_emprestimo_id;
  
  -- Calcular juros para parcelas atrasadas
  FOR v_parcela_rec IN
    SELECT id, valor_parcela, data_vencimento
    FROM public.parcelas 
    WHERE emprestimo_id = p_emprestimo_id 
      AND status = 'atrasado'
      AND data_vencimento < CURRENT_DATE
  LOOP
    v_dias_atraso := (CURRENT_DATE - v_parcela_rec.data_vencimento);
    v_juros := v_parcela_rec.valor_parcela * v_taxa_juros * v_dias_atraso;
    
    UPDATE public.parcelas 
    SET juros_aplicados = v_juros
    WHERE id = v_parcela_rec.id;
  END LOOP;
END;
$$;

-- ============================================
-- 7. CRIAR VIEW PARA PARCELAS COM INFORMAÇÕES DO EMPRÉSTIMO
-- ============================================

SELECT '=== CRIANDO VIEW PARA PARCELAS ===' as status;

CREATE OR REPLACE VIEW public.parcelas_detalhadas AS
SELECT 
  p.id,
  p.emprestimo_id,
  p.numero_parcela,
  p.valor_parcela,
  p.data_vencimento,
  p.data_pagamento,
  p.valor_pago,
  p.status,
  p.juros_aplicados,
  p.multa_aplicada,
  p.observacoes,
  e.cliente_id,
  c.nome as cliente_nome,
  c.cpf as cliente_cpf,
  e.taxa_juros_diaria_atraso,
  CASE 
    WHEN p.status = 'atrasado' THEN CURRENT_DATE - p.data_vencimento
    ELSE 0
  END as dias_atraso,
  CASE 
    WHEN p.status = 'atrasado' THEN p.valor_parcela + p.juros_aplicados + p.multa_aplicada
    ELSE p.valor_parcela
  END as valor_total_devido
FROM public.parcelas p
JOIN public.emprestimos e ON p.emprestimo_id = e.id
JOIN public.clientes c ON e.cliente_id = c.id;

-- ============================================
-- 8. CRIAR ÍNDICES PARA PERFORMANCE
-- ============================================

SELECT '=== CRIANDO ÍNDICES ===' as status;

CREATE INDEX IF NOT EXISTS idx_parcelas_emprestimo_id ON public.parcelas(emprestimo_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_data_vencimento ON public.parcelas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_parcelas_status ON public.parcelas(status);
CREATE INDEX IF NOT EXISTS idx_parcelas_cliente_id ON public.parcelas(emprestimo_id) INCLUDE (id);

-- ============================================
-- 9. TESTAR FUNCIONALIDADE
-- ============================================

SELECT '=== TESTANDO FUNCIONALIDADE ===' as status;

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'emprestimos' 
  AND column_name IN ('parcelado', 'numero_parcelas', 'valor_parcela', 'intervalo_pagamento', 'data_primeira_parcela');

-- Verificar se a tabela parcelas foi criada
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_name = 'parcelas' 
  AND table_schema = 'public';

-- Verificar se as funções foram criadas
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_name IN ('gerar_parcelas', 'atualizar_status_parcelas', 'calcular_juros_parcelas')
  AND routine_schema = 'public';

SELECT '=== FUNCIONALIDADE DE PARCELAMENTO ADICIONADA COM SUCESSO ===' as status;
