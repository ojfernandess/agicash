-- Script para simular exatamente o que o frontend está fazendo
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. SIMULAR CHAMADA DO FRONTEND
-- ============================================

SELECT '=== SIMULANDO CHAMADA DO FRONTEND ===' as status;

-- Simular exatamente os parâmetros que o frontend está enviando
SELECT public.save_system_config(
  'Meu Sistema Frontend',  -- p_system_name
  NULL,                    -- p_logo_url
  NULL,                    -- p_favicon_url
  '#3b82f6',              -- p_primary_color
  '#64748b'               -- p_secondary_color
) as resultado_frontend;

-- ============================================
-- 2. VERIFICAR RESULTADO
-- ============================================

SELECT '=== VERIFICANDO RESULTADO ===' as status;

SELECT * FROM public.get_system_config();

-- ============================================
-- 3. SIMULAR ATUALIZAÇÃO
-- ============================================

SELECT '=== SIMULANDO ATUALIZAÇÃO ===' as status;

-- Simular atualização do nome
SELECT public.save_system_config(
  'Nome Atualizado Frontend',
  NULL,
  NULL,
  '#3b82f6',
  '#64748b'
) as resultado_atualizacao;

-- ============================================
-- 4. VERIFICAR ATUALIZAÇÃO
-- ============================================

SELECT '=== VERIFICANDO ATUALIZAÇÃO ===' as status;

SELECT * FROM public.get_system_config();

-- ============================================
-- 5. TESTAR COM DADOS PARCIAIS
-- ============================================

SELECT '=== TESTANDO COM DADOS PARCIAIS ===' as status;

-- Simular salvamento parcial (apenas nome)
SELECT public.save_system_config(
  'Apenas Nome Alterado',
  NULL,
  NULL,
  NULL,
  NULL
) as resultado_parcial;

-- ============================================
-- 6. VERIFICAR RESULTADO PARCIAL
-- ============================================

SELECT '=== VERIFICANDO RESULTADO PARCIAL ===' as status;

SELECT * FROM public.get_system_config();

-- ============================================
-- 7. TESTAR COM VALORES VAZIOS
-- ============================================

SELECT '=== TESTANDO COM VALORES VAZIOS ===' as status;

-- Testar com valores vazios
SELECT public.save_system_config(
  '',
  '',
  '',
  '',
  ''
) as resultado_vazios;

-- ============================================
-- 8. VERIFICAR RESULTADO VAZIOS
-- ============================================

SELECT '=== VERIFICANDO RESULTADO VAZIOS ===' as status;

SELECT * FROM public.get_system_config();

-- ============================================
-- 9. TESTE FINAL
-- ============================================

SELECT '=== TESTE FINAL ===' as status;

-- Teste final com nome válido
SELECT public.save_system_config(
  'Flow Lend - Sistema Final',
  NULL,
  NULL,
  '#3b82f6',
  '#64748b'
) as resultado_final;

-- Verificar resultado final
SELECT * FROM public.get_system_config();

SELECT '=== SIMULAÇÃO DO FRONTEND CONCLUÍDA ===' as status;
