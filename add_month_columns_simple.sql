-- Script simplificado para adicionar colunas de mês/ano aos pagamentos
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
-- 2. CRIAR ÍNDICES PARA MELHORAR PERFORMANCE
-- ============================================

SELECT '=== CRIANDO ÍNDICES ===' as status;

CREATE INDEX IF NOT EXISTS idx_pagamentos_mes_ano ON public.pagamentos(mes_pagamento, ano_pagamento);
CREATE INDEX IF NOT EXISTS idx_pagamentos_emprestimo_mes_ano ON public.pagamentos(emprestimo_id, mes_pagamento, ano_pagamento);

-- ============================================
-- 3. ATUALIZAR PAGAMENTOS EXISTENTES COM MÊS/ANO
-- ============================================

SELECT '=== ATUALIZANDO PAGAMENTOS EXISTENTES ===' as status;

UPDATE public.pagamentos 
SET 
  mes_pagamento = EXTRACT(MONTH FROM data_pagamento),
  ano_pagamento = EXTRACT(YEAR FROM data_pagamento)
WHERE mes_pagamento IS NULL OR ano_pagamento IS NULL;

SELECT '=== MIGRAÇÃO CONCLUÍDA ===' as status;
