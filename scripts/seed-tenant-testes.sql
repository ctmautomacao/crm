-- ============================================================
-- TENANT DE TESTES — CTM Automação CRM
-- Execute no banco do CRM (psql ou cliente de sua preferência)
-- Para desfazer: DELETE FROM tenants WHERE slug = 'ctm-testes';
--   (CASCADE apaga tudo pelo tenant_id)
-- ============================================================

BEGIN;

-- ─── IDs fixos para facilitar referência ───────────────────
-- Gere novos se quiser, mas esses funcionam como estão

\set tenant_id    'aaaaaaaa-0000-0000-0000-000000000001'
\set vendedor_id  'aaaaaaaa-0000-0000-0000-000000000002'

-- ─── 1. TENANT ─────────────────────────────────────────────
INSERT INTO tenants (id, nome, slug, ativo)
VALUES (:'tenant_id', 'CTM Testes', 'ctm-testes', true)
ON CONFLICT (slug) DO NOTHING;

-- ─── 2. VENDEDOR ADMIN ─────────────────────────────────────
-- Senha: Testes@2024
INSERT INTO vendedores (id, tenant_id, nome, email, senha_hash, perfil, comissao_pct, ativo)
VALUES (
  :'vendedor_id',
  :'tenant_id',
  'Admin Testes',
  'testes@ctmautomacao.com.br',
  '$2b$12$uu.rDoEOSAj8qAizc5p1huZb4bKnDP5fGyeIHYmfRBqigwsthyByG',
  'GERENTE',
  5,
  true
)
ON CONFLICT DO NOTHING;

-- ─── 3. ORIGENS DE LEAD ────────────────────────────────────
INSERT INTO origens_lead (id, tenant_id, nome) VALUES
  (gen_random_uuid()::text, :'tenant_id', 'Instagram'),
  (gen_random_uuid()::text, :'tenant_id', 'Site'),
  (gen_random_uuid()::text, :'tenant_id', 'Indicação'),
  (gen_random_uuid()::text, :'tenant_id', 'WhatsApp'),
  (gen_random_uuid()::text, :'tenant_id', 'Ligação Ativa');

-- ─── 4. FORMAS DE PAGAMENTO ────────────────────────────────
INSERT INTO formas_pagamento (id, tenant_id, nome) VALUES
  (gen_random_uuid()::text, :'tenant_id', 'PIX'),
  (gen_random_uuid()::text, :'tenant_id', 'Boleto'),
  (gen_random_uuid()::text, :'tenant_id', 'Cartão de Crédito'),
  (gen_random_uuid()::text, :'tenant_id', 'Transferência Bancária'),
  (gen_random_uuid()::text, :'tenant_id', 'Dinheiro');

-- ─── 5. STATUS DE OPORTUNIDADE (kanban) ────────────────────
INSERT INTO status_oportunidade (id, tenant_id, nome, ordem) VALUES
  (gen_random_uuid()::text, :'tenant_id', 'Prospecção',   1),
  (gen_random_uuid()::text, :'tenant_id', 'Qualificação', 2),
  (gen_random_uuid()::text, :'tenant_id', 'Proposta',     3),
  (gen_random_uuid()::text, :'tenant_id', 'Negociação',   4),
  (gen_random_uuid()::text, :'tenant_id', 'Fechado',      5);

-- ─── 6. TIPOS DE OPORTUNIDADE ──────────────────────────────
INSERT INTO tipos_oportunidade (id, tenant_id, nome) VALUES
  (gen_random_uuid()::text, :'tenant_id', 'Automação Comercial'),
  (gen_random_uuid()::text, :'tenant_id', 'PDV / Software'),
  (gen_random_uuid()::text, :'tenant_id', 'Manutenção'),
  (gen_random_uuid()::text, :'tenant_id', 'Outros');

-- ─── 7. MOTIVOS DE ENCERRAMENTO ────────────────────────────
INSERT INTO motivos_encerramento (id, tenant_id, nome) VALUES
  (gen_random_uuid()::text, :'tenant_id', 'Preço'),
  (gen_random_uuid()::text, :'tenant_id', 'Concorrência'),
  (gen_random_uuid()::text, :'tenant_id', 'Sem interesse'),
  (gen_random_uuid()::text, :'tenant_id', 'Sem retorno'),
  (gen_random_uuid()::text, :'tenant_id', 'Budget insuficiente');

-- ─── 8. GRUPOS DE PRODUTO ──────────────────────────────────
INSERT INTO grupos_produto (id, tenant_id, nome) VALUES
  (gen_random_uuid()::text, :'tenant_id', 'Hardware'),
  (gen_random_uuid()::text, :'tenant_id', 'Software'),
  (gen_random_uuid()::text, :'tenant_id', 'Serviço');

-- ─── 9. MARCAS ─────────────────────────────────────────────
INSERT INTO marcas (id, tenant_id, nome) VALUES
  (gen_random_uuid()::text, :'tenant_id', 'Elgin'),
  (gen_random_uuid()::text, :'tenant_id', 'Epson'),
  (gen_random_uuid()::text, :'tenant_id', 'Bematech'),
  (gen_random_uuid()::text, :'tenant_id', 'Genérico');

-- ─── 10. CATEGORIAS ────────────────────────────────────────
INSERT INTO categorias (id, tenant_id, nome) VALUES
  (gen_random_uuid()::text, :'tenant_id', 'Impressora Fiscal'),
  (gen_random_uuid()::text, :'tenant_id', 'Leitor de Código de Barras'),
  (gen_random_uuid()::text, :'tenant_id', 'Computador / Terminal'),
  (gen_random_uuid()::text, :'tenant_id', 'Licença de Software'),
  (gen_random_uuid()::text, :'tenant_id', 'Serviço Técnico');

-- ─── 11. ALERTAS PADRÃO ────────────────────────────────────
INSERT INTO configuracoes_alerta (id, tenant_id, entidade, nivel, dias, cor) VALUES
  (gen_random_uuid()::text, :'tenant_id', 'LEAD',         'ATENCAO', 3,  '#F59E0B'),
  (gen_random_uuid()::text, :'tenant_id', 'LEAD',         'CRITICO',  7,  '#EF4444'),
  (gen_random_uuid()::text, :'tenant_id', 'OPORTUNIDADE', 'ATENCAO', 5,  '#F59E0B'),
  (gen_random_uuid()::text, :'tenant_id', 'OPORTUNIDADE', 'CRITICO',  14, '#EF4444');

COMMIT;

-- ============================================================
-- RESULTADO ESPERADO:
--   tenant:    CTM Testes  (slug: ctm-testes)
--   login:     testes@ctmautomacao.com.br
--   senha:     Testes@2024
-- ============================================================
