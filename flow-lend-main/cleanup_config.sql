-- Script para limpar configurações duplicadas e manter apenas uma global
-- Execute este script no SQL Editor do Supabase

-- ============================================
-- 1. VERIFICAR CONFIGURAÇÕES DUPLICADAS
-- ============================================

SELECT '=== CONFIGURAÇÕES DUPLICADAS ===' as status;

SELECT 
  user_id,
  COUNT(*) as total_configs,
  MAX(updated_at) as ultima_atualizacao
FROM system_config
GROUP BY user_id
ORDER BY total_configs DESC;

-- ============================================
-- 2. MANTER APENAS A CONFIGURAÇÃO MAIS RECENTE
-- ============================================

-- Criar tabela temporária com a configuração mais recente
CREATE TEMP TABLE temp_latest_config AS
SELECT 
  system_name,
  logo_url,
  favicon_url,
  primary_color,
  secondary_color,
  updated_at
FROM system_config
ORDER BY updated_at DESC, created_at DESC
LIMIT 1;

-- ============================================
-- 3. LIMPAR TODAS AS CONFIGURAÇÕES EXISTENTES
-- ============================================

-- Deletar todas as configurações existentes
DELETE FROM system_config;

-- ============================================
-- 4. INSERIR CONFIGURAÇÃO GLOBAL ÚNICA
-- ============================================

-- Inserir a configuração mais recente como configuração global
INSERT INTO system_config (
  user_id,
  system_name,
  logo_url,
  favicon_url,
  primary_color,
  secondary_color
)
SELECT 
  (SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1), -- Usar o primeiro usuário como criador
  system_name,
  logo_url,
  favicon_url,
  primary_color,
  secondary_color
FROM temp_latest_config;

-- ============================================
-- 5. VERIFICAÇÃO FINAL
-- ============================================

SELECT '=== CONFIGURAÇÃO GLOBAL FINAL ===' as status;

-- Verificar se há apenas uma configuração
SELECT 
  id,
  user_id,
  system_name,
  primary_color,
  secondary_color,
  created_at,
  updated_at
FROM system_config;

-- Testar a função
SELECT '=== TESTE DA FUNÇÃO ===' as status;
SELECT * FROM get_system_config();

-- ============================================
-- 6. LIMPEZA
-- ============================================

-- Remover tabela temporária
DROP TABLE IF EXISTS temp_latest_config;

SELECT '=== LIMPEZA CONCLUÍDA ===' as status;
