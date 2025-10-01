-- Script para testar acesso compartilhado entre usuários
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. VERIFICAR POLÍTICAS RLS ATUAIS
-- ============================================

SELECT '=== POLÍTICAS RLS ATUAIS ===' as status;

SELECT 
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('clientes', 'emprestimos', 'pagamentos', 'configuracoes_juros')
ORDER BY tablename, policyname;

-- ============================================
-- 2. VERIFICAR DADOS POR USUÁRIO
-- ============================================

SELECT '=== DADOS POR USUÁRIO ===' as status;

-- Clientes por usuário
SELECT 
  'Clientes por usuário:' as info,
  user_id,
  COUNT(*) as total_clientes
FROM clientes
GROUP BY user_id
ORDER BY total_clientes DESC;

-- Empréstimos por usuário
SELECT 
  'Empréstimos por usuário:' as info,
  user_id,
  COUNT(*) as total_emprestimos
FROM emprestimos
GROUP BY user_id
ORDER BY total_emprestimos DESC;

-- Pagamentos por usuário
SELECT 
  'Pagamentos por usuário:' as info,
  user_id,
  COUNT(*) as total_pagamentos
FROM pagamentos
GROUP BY user_id
ORDER BY total_pagamentos DESC;

-- ============================================
-- 3. TESTE DE ACESSO COMPARTILHADO
-- ============================================

SELECT '=== TESTE DE ACESSO COMPARTILHADO ===' as status;

-- Verificar se conseguimos ver todos os clientes
SELECT 
  'Total de clientes visíveis:' as info,
  COUNT(*) as total
FROM clientes;

-- Verificar se conseguimos ver todos os empréstimos
SELECT 
  'Total de empréstimos visíveis:' as info,
  COUNT(*) as total
FROM emprestimos;

-- Verificar se conseguimos ver todos os pagamentos
SELECT 
  'Total de pagamentos visíveis:' as info,
  COUNT(*) as total
FROM pagamentos;

-- ============================================
-- 4. VERIFICAR USUÁRIOS NO SISTEMA
-- ============================================

SELECT '=== USUÁRIOS NO SISTEMA ===' as status;

SELECT 
  id as user_id,
  email,
  created_at,
  'Usuário ativo' as status
FROM auth.users
ORDER BY created_at DESC;

-- ============================================
-- 5. TESTE DE JOIN ENTRE TABELAS
-- ============================================

SELECT '=== TESTE DE JOIN ENTRE TABELAS ===' as status;

-- Verificar se conseguimos fazer join entre clientes e empréstimos
SELECT 
  'Join clientes-empréstimos:' as info,
  COUNT(*) as total_relacionamentos
FROM clientes c
JOIN emprestimos e ON c.id = e.cliente_id;

-- Verificar se conseguimos fazer join entre empréstimos e pagamentos
SELECT 
  'Join empréstimos-pagamentos:' as info,
  COUNT(*) as total_relacionamentos
FROM emprestimos e
JOIN pagamentos p ON e.id = p.emprestimo_id;
