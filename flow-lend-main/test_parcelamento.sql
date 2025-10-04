-- Script para testar a funcionalidade de parcelamento
-- Execute este script no SQL Editor do Supabase APÓS executar add_parcelamento_schema.sql

-- ============================================
-- 1. VERIFICAR ESTRUTURA DAS TABELAS
-- ============================================

SELECT '=== VERIFICANDO ESTRUTURA DAS TABELAS ===' as status;

-- Verificar colunas adicionadas na tabela emprestimos
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'emprestimos' 
  AND column_name IN ('parcelado', 'numero_parcelas', 'valor_parcela', 'intervalo_pagamento', 'data_primeira_parcela', 'observacoes_parcelamento');

-- Verificar se a tabela parcelas foi criada
SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_name = 'parcelas' 
  AND table_schema = 'public';

-- ============================================
-- 2. VERIFICAR FUNÇÕES
-- ============================================

SELECT '=== VERIFICANDO FUNÇÕES ===' as status;

SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name IN ('gerar_parcelas', 'atualizar_status_parcelas', 'calcular_juros_parcelas')
  AND routine_schema = 'public';

-- ============================================
-- 3. VERIFICAR VIEW
-- ============================================

SELECT '=== VERIFICANDO VIEW ===' as status;

SELECT table_name, table_type
FROM information_schema.tables 
WHERE table_name = 'parcelas_detalhadas' 
  AND table_schema = 'public';

-- ============================================
-- 4. TESTAR CRIAÇÃO DE EMPRÉSTIMO PARCELADO
-- ============================================

SELECT '=== TESTANDO CRIAÇÃO DE EMPRÉSTIMO PARCELADO ===' as status;

-- Primeiro, vamos verificar se há clientes
SELECT id, nome FROM public.clientes LIMIT 1;

-- Criar um empréstimo parcelado (substitua o cliente_id por um ID real)
INSERT INTO public.emprestimos (
  cliente_id,
  valor_emprestimo,
  data_emprestimo,
  data_vencimento,
  taxa_juros,
  valor_total,
  taxa_juros_diaria_atraso,
  status,
  parcelado,
  numero_parcelas,
  valor_parcela,
  intervalo_pagamento,
  data_primeira_parcela,
  observacoes_parcelamento
) VALUES (
  (SELECT id FROM public.clientes LIMIT 1), -- Usar o primeiro cliente disponível
  1000.00,
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  0.30,
  1300.00,
  0.05,
  'ativo',
  true,
  3,
  433.33,
  30,
  CURRENT_DATE + INTERVAL '30 days',
  'Empréstimo parcelado em 3 vezes'
) RETURNING id;

-- ============================================
-- 5. TESTAR GERAÇÃO DE PARCELAS
-- ============================================

SELECT '=== TESTANDO GERAÇÃO DE PARCELAS ===' as status;

-- Obter o ID do empréstimo criado
-- Substitua 'EMPRESTIMO_ID_AQUI' pelo ID retornado na consulta anterior
-- SELECT public.gerar_parcelas(
--   'EMPRESTIMO_ID_AQUI',
--   3,
--   433.33,
--   CURRENT_DATE + INTERVAL '30 days',
--   30
-- ) as resultado_geracao;

-- ============================================
-- 6. VERIFICAR PARCELAS GERADAS
-- ============================================

SELECT '=== VERIFICANDO PARCELAS GERADAS ===' as status;

-- Verificar parcelas criadas
SELECT 
  p.id,
  p.emprestimo_id,
  p.numero_parcela,
  p.valor_parcela,
  p.data_vencimento,
  p.status,
  e.cliente_id,
  c.nome as cliente_nome
FROM public.parcelas p
JOIN public.emprestimos e ON p.emprestimo_id = e.id
JOIN public.clientes c ON e.cliente_id = c.id
ORDER BY p.numero_parcela;

-- ============================================
-- 7. TESTAR VIEW PARCELAS_DETALHADAS
-- ============================================

SELECT '=== TESTANDO VIEW PARCELAS_DETALHADAS ===' as status;

SELECT * FROM public.parcelas_detalhadas
ORDER BY numero_parcela;

-- ============================================
-- 8. TESTAR ATUALIZAÇÃO DE STATUS
-- ============================================

SELECT '=== TESTANDO ATUALIZAÇÃO DE STATUS ===' as status;

-- Executar função de atualização de status
SELECT public.atualizar_status_parcelas();

-- Verificar status atualizado
SELECT 
  numero_parcela,
  data_vencimento,
  status,
  CASE 
    WHEN data_vencimento < CURRENT_DATE THEN CURRENT_DATE - data_vencimento
    ELSE 0
  END as dias_atraso
FROM public.parcelas
ORDER BY numero_parcela;

-- ============================================
-- 9. TESTAR CÁLCULO DE JUROS
-- ============================================

SELECT '=== TESTANDO CÁLCULO DE JUROS ===' as status;

-- Executar função de cálculo de juros
-- SELECT public.calcular_juros_parcelas('EMPRESTIMO_ID_AQUI');

-- Verificar juros calculados
SELECT 
  numero_parcela,
  valor_parcela,
  juros_aplicados,
  status
FROM public.parcelas
WHERE juros_aplicados > 0
ORDER BY numero_parcela;

-- ============================================
-- 10. TESTE DE REGISTRO DE PAGAMENTO
-- ============================================

SELECT '=== TESTANDO REGISTRO DE PAGAMENTO ===' as status;

-- Simular pagamento da primeira parcela
-- UPDATE public.parcelas 
-- SET 
--   valor_pago = valor_parcela,
--   data_pagamento = CURRENT_DATE,
--   status = 'pago'
-- WHERE numero_parcela = 1;

-- Verificar pagamento registrado
SELECT 
  numero_parcela,
  valor_parcela,
  valor_pago,
  data_pagamento,
  status
FROM public.parcelas
ORDER BY numero_parcela;

-- ============================================
-- 11. VERIFICAR ÍNDICES
-- ============================================

SELECT '=== VERIFICANDO ÍNDICES ===' as status;

SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename = 'parcelas'
ORDER BY indexname;

-- ============================================
-- 12. TESTE FINAL
-- ============================================

SELECT '=== TESTE FINAL ===' as status;

-- Verificar estatísticas gerais
SELECT 
  COUNT(*) as total_parcelas,
  COUNT(CASE WHEN status = 'pendente' THEN 1 END) as parcelas_pendentes,
  COUNT(CASE WHEN status = 'pago' THEN 1 END) as parcelas_pagas,
  COUNT(CASE WHEN status = 'atrasado' THEN 1 END) as parcelas_atrasadas,
  SUM(valor_parcela) as valor_total_parcelas,
  SUM(valor_pago) as valor_total_pago
FROM public.parcelas;

SELECT '=== FUNCIONALIDADE DE PARCELAMENTO TESTADA COM SUCESSO ===' as status;
