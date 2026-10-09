-- ============================================================
-- Migration 001: Melhorias gerais no CRM CTM
-- Execute: docker exec -i crm_postgres psql -U crmuser -d crmdb < scripts/migration-001-feed-tipos.sql
-- ============================================================

-- 1. Estender enum tipo_feed com novos tipos de atividade
-- ALTER TYPE ... ADD VALUE não pode estar dentro de transação
ALTER TYPE tipo_feed ADD VALUE IF NOT EXISTS 'LIGACAO';
ALTER TYPE tipo_feed ADD VALUE IF NOT EXISTS 'MENSAGEM';
ALTER TYPE tipo_feed ADD VALUE IF NOT EXISTS 'EMAIL_MANUAL';
ALTER TYPE tipo_feed ADD VALUE IF NOT EXISTS 'VISITA';

-- 2. Adicionar campos de produto no lead
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS grupo_produto_id TEXT REFERENCES grupos_produto(id),
  ADD COLUMN IF NOT EXISTS categoria_id TEXT REFERENCES categorias(id);

-- ============================================================
-- RESULTADO ESPERADO:
--   - Enum tipo_feed: ANOTACAO, MUDANCA_STATUS, CONVERSAO, LIGACAO, MENSAGEM, EMAIL_MANUAL, VISITA
--   - Tabela leads: novos campos grupo_produto_id, categoria_id
-- ============================================================
