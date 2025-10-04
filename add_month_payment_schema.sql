-- Script para adicionar campo de mês/ano aos pagamentos
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. ADICIONAR COLUNAS DE MÊS/ANO NA TABELA PAGAMENTOS
-- ============================================

SELECT '=== ADICIONANDO COLUNAS DE MÊS/ANO ===' as status;

-- Adicionar colunas para mês/ano do pagamento
ALTER TABLE public.pagamentos 
ADD COLUMN IF NOT EXISTS mes_pagamento INTEGER CHECK (mes_pagamento >= 1 AND mes_pagamento <= 12),
ADD COLUMN IF NOT EXISTS ano_pagamento INTEGER CHECK (ano_pagamento >= 2020);

-- ============================================
-- 2. CRIAR FUNÇÃO PARA DETECTAR MESES PENDENTES
-- ============================================

SELECT '=== CRIANDO FUNÇÃO PARA DETECTAR MESES PENDENTES ===' as status;

CREATE OR REPLACE FUNCTION public.get_meses_pendentes_pagamento(
  p_emprestimo_id UUID
)
RETURNS TABLE(
  mes INTEGER,
  ano INTEGER,
  valor_esperado DECIMAL(10,2),
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_emprestimo RECORD;
  v_data_inicio DATE;
  v_data_fim DATE;
  v_mes_atual INTEGER;
  v_ano_atual INTEGER;
  v_mes INTEGER;
  v_ano INTEGER;
  v_valor_parcela DECIMAL(10,2);
  v_valor_pago_mes DECIMAL(10,2);
BEGIN
  -- Obter dados do empréstimo
  SELECT * INTO v_emprestimo
  FROM public.emprestimos
  WHERE id = p_emprestimo_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Definir período de análise (últimos 12 meses)
  v_data_inicio := CURRENT_DATE - INTERVAL '12 months';
  v_data_fim := CURRENT_DATE;
  
  -- Se for parcelado, usar valor da parcela
  IF v_emprestimo.parcelado AND v_emprestimo.valor_parcela IS NOT NULL THEN
    v_valor_parcela := v_emprestimo.valor_parcela;
  ELSE
    -- Se não for parcelado, calcular valor mensal baseado na taxa de juros
    v_valor_parcela := v_emprestimo.valor_principal * (v_emprestimo.taxa_juros_mensal / 100);
  END IF;
  
  -- Iterar pelos meses do período
  v_mes := EXTRACT(MONTH FROM v_data_inicio);
  v_ano := EXTRACT(YEAR FROM v_data_inicio);
  
  WHILE (v_ano < EXTRACT(YEAR FROM v_data_fim)) OR 
        (v_ano = EXTRACT(YEAR FROM v_data_fim) AND v_mes <= EXTRACT(MONTH FROM v_data_fim))
  LOOP
    -- Verificar se há pagamentos para este mês/ano
    SELECT COALESCE(SUM(valor_pago), 0) INTO v_valor_pago_mes
    FROM public.pagamentos
    WHERE emprestimo_id = p_emprestimo_id
      AND mes_pagamento = v_mes
      AND ano_pagamento = v_ano;
    
    -- Determinar status do mês
    IF v_valor_pago_mes >= v_valor_parcela THEN
      RETURN QUERY SELECT v_mes, v_ano, v_valor_parcela, 'pago'::TEXT;
    ELSIF v_valor_pago_mes > 0 THEN
      RETURN QUERY SELECT v_mes, v_ano, v_valor_parcela, 'parcial'::TEXT;
    ELSE
      RETURN QUERY SELECT v_mes, v_ano, v_valor_parcela, 'pendente'::TEXT;
    END IF;
    
    -- Avançar para o próximo mês
    v_mes := v_mes + 1;
    IF v_mes > 12 THEN
      v_mes := 1;
      v_ano := v_ano + 1;
    END IF;
  END LOOP;
END;
$$;

-- ============================================
-- 3. CRIAR FUNÇÃO PARA OBTER RESUMO DE PAGAMENTOS POR MÊS
-- ============================================

SELECT '=== CRIANDO FUNÇÃO PARA RESUMO POR MÊS ===' as status;

CREATE OR REPLACE FUNCTION public.get_resumo_pagamentos_mensal(
  p_emprestimo_id UUID
)
RETURNS TABLE(
  mes INTEGER,
  ano INTEGER,
  valor_esperado DECIMAL(10,2),
  valor_pago DECIMAL(10,2),
  diferenca DECIMAL(10,2),
  status TEXT,
  data_ultimo_pagamento TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_emprestimo RECORD;
  v_valor_parcela DECIMAL(10,2);
  v_mes INTEGER;
  v_ano INTEGER;
  v_data_inicio DATE;
  v_data_fim DATE;
BEGIN
  -- Obter dados do empréstimo
  SELECT * INTO v_emprestimo
  FROM public.emprestimos
  WHERE id = p_emprestimo_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Definir período de análise
  v_data_inicio := v_emprestimo.data_emprestimo;
  v_data_fim := CURRENT_DATE;
  
  -- Calcular valor esperado por mês
  IF v_emprestimo.parcelado AND v_emprestimo.valor_parcela IS NOT NULL THEN
    v_valor_parcela := v_emprestimo.valor_parcela;
  ELSE
    v_valor_parcela := v_emprestimo.valor_principal * (v_emprestimo.taxa_juros_mensal / 100);
  END IF;
  
  -- Iterar pelos meses do período
  v_mes := EXTRACT(MONTH FROM v_data_inicio);
  v_ano := EXTRACT(YEAR FROM v_data_inicio);
  
  WHILE (v_ano < EXTRACT(YEAR FROM v_data_fim)) OR 
        (v_ano = EXTRACT(YEAR FROM v_data_fim) AND v_mes <= EXTRACT(MONTH FROM v_data_fim))
  LOOP
    -- Buscar dados do mês
    RETURN QUERY
    SELECT 
      v_mes,
      v_ano,
      v_valor_parcela,
      COALESCE(SUM(p.valor_pago), 0) as valor_pago,
      v_valor_parcela - COALESCE(SUM(p.valor_pago), 0) as diferenca,
      CASE 
        WHEN COALESCE(SUM(p.valor_pago), 0) >= v_valor_parcela THEN 'pago'
        WHEN COALESCE(SUM(p.valor_pago), 0) > 0 THEN 'parcial'
        ELSE 'pendente'
      END as status,
      MAX(p.data_pagamento) as data_ultimo_pagamento
    FROM public.pagamentos p
    WHERE p.emprestimo_id = p_emprestimo_id
      AND p.mes_pagamento = v_mes
      AND p.ano_pagamento = v_ano
    GROUP BY v_mes, v_ano, v_valor_parcela;
    
    -- Avançar para o próximo mês
    v_mes := v_mes + 1;
    IF v_mes > 12 THEN
      v_mes := 1;
      v_ano := v_ano + 1;
    END IF;
  END LOOP;
END;
$$;

-- ============================================
-- 4. CRIAR ÍNDICES PARA MELHORAR PERFORMANCE
-- ============================================

SELECT '=== CRIANDO ÍNDICES ===' as status;

CREATE INDEX IF NOT EXISTS idx_pagamentos_mes_ano ON public.pagamentos(mes_pagamento, ano_pagamento);
CREATE INDEX IF NOT EXISTS idx_pagamentos_emprestimo_mes_ano ON public.pagamentos(emprestimo_id, mes_pagamento, ano_pagamento);

-- ============================================
-- 5. ATUALIZAR PAGAMENTOS EXISTENTES COM MÊS/ANO
-- ============================================

SELECT '=== ATUALIZANDO PAGAMENTOS EXISTENTES ===' as status;

UPDATE public.pagamentos 
SET 
  mes_pagamento = EXTRACT(MONTH FROM data_pagamento),
  ano_pagamento = EXTRACT(YEAR FROM data_pagamento)
WHERE mes_pagamento IS NULL OR ano_pagamento IS NULL;

SELECT '=== MIGRAÇÃO CONCLUÍDA ===' as status;
