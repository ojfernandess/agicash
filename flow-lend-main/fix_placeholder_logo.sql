-- Script para corrigir logo placeholder e configurações
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. VERIFICAR CONFIGURAÇÕES EXISTENTES
-- ============================================

SELECT '=== CONFIGURAÇÕES EXISTENTES ===' as status;

SELECT 
  id,
  user_id,
  system_name,
  logo_url,
  favicon_url,
  primary_color,
  secondary_color,
  created_at,
  updated_at
FROM system_config
ORDER BY updated_at DESC;

-- ============================================
-- 2. LIMPAR LOGOS PLACEHOLDER INVÁLIDAS
-- ============================================

-- Atualizar configurações que têm URLs de placeholder inválidas
UPDATE system_config 
SET 
  logo_url = NULL,
  favicon_url = NULL,
  updated_at = NOW()
WHERE 
  logo_url LIKE '%via.placeholder.com%' 
  OR logo_url LIKE '%placeholder%'
  OR favicon_url LIKE '%via.placeholder.com%'
  OR favicon_url LIKE '%placeholder%';

-- ============================================
-- 3. VERIFICAR SE HÁ MÚLTIPLAS CONFIGURAÇÕES
-- ============================================

SELECT '=== CONFIGURAÇÕES APÓS LIMPEZA ===' as status;

SELECT 
  id,
  user_id,
  system_name,
  logo_url,
  favicon_url,
  primary_color,
  secondary_color,
  updated_at
FROM system_config
ORDER BY updated_at DESC;

-- ============================================
-- 4. MANTER APENAS UMA CONFIGURAÇÃO GLOBAL
-- ============================================

-- Se há múltiplas configurações, manter apenas a mais recente
WITH latest_config AS (
  SELECT 
    system_name,
    logo_url,
    favicon_url,
    primary_color,
    secondary_color,
    updated_at
  FROM system_config
  ORDER BY updated_at DESC, created_at DESC
  LIMIT 1
)
-- Deletar configurações antigas e manter apenas a mais recente
DELETE FROM system_config 
WHERE id NOT IN (
  SELECT id FROM system_config
  ORDER BY updated_at DESC, created_at DESC
  LIMIT 1
);

-- ============================================
-- 5. TESTAR FUNÇÃO GET_SYSTEM_CONFIG
-- ============================================

SELECT '=== TESTE DA FUNÇÃO ===' as status;
SELECT * FROM get_system_config();

-- ============================================
-- 6. VERIFICAÇÃO FINAL
-- ============================================

SELECT '=== CONFIGURAÇÃO FINAL ===' as status;

SELECT 
  id,
  user_id,
  system_name,
  logo_url,
  favicon_url,
  primary_color,
  secondary_color,
  updated_at
FROM system_config;

-- Verificar se há URLs inválidas
SELECT '=== VERIFICAÇÃO DE URLs ===' as status;

SELECT 
  CASE 
    WHEN logo_url IS NULL THEN '✅ Logo URL está NULL (correto)'
    WHEN logo_url LIKE '%via.placeholder.com%' THEN '❌ Logo URL é placeholder inválido'
    WHEN logo_url LIKE '%placeholder%' THEN '❌ Logo URL contém placeholder'
    ELSE '✅ Logo URL parece válida'
  END as status_logo,
  CASE 
    WHEN favicon_url IS NULL THEN '✅ Favicon URL está NULL (correto)'
    WHEN favicon_url LIKE '%via.placeholder.com%' THEN '❌ Favicon URL é placeholder inválido'
    WHEN favicon_url LIKE '%placeholder%' THEN '❌ Favicon URL contém placeholder'
    ELSE '✅ Favicon URL parece válida'
  END as status_favicon
FROM system_config
LIMIT 1;
