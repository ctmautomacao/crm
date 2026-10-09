import {
  pgTable,
  text,
  varchar,
  boolean,
  integer,
  real,
  timestamp,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── ENUMS ────────────────────────────────────────────────────────────────────

export const perfilEnum = pgEnum("perfil", ["GERENTE", "VENDEDOR"]);
export const entidadeAlertaEnum = pgEnum("entidade_alerta", ["LEAD", "OPORTUNIDADE"]);
export const nivelAlertaEnum = pgEnum("nivel_alerta", ["ATENCAO", "CRITICO"]);
export const statusLeadEnum = pgEnum("status_lead", [
  "NOVO", "CONTATO_REALIZADO", "EM_NEGOCIACAO", "CONVERTIDO", "PERDIDO", "DESCARTADO",
]);
export const tipoFeedEnum = pgEnum("tipo_feed", ["ANOTACAO", "MUDANCA_STATUS", "CONVERSAO", "LIGACAO", "MENSAGEM", "EMAIL_MANUAL", "VISITA"]);
export const statusPropostaEnum = pgEnum("status_proposta", [
  "RASCUNHO", "ENVIADA", "APROVADA", "REPROVADA", "CANCELADA",
]);
export const statusPedidoEnum = pgEnum("status_pedido", [
  "PENDENTE", "FATURADO", "ENTREGUE", "CANCELADO",
]);
export const statusParcelaEnum = pgEnum("status_parcela", [
  "PENDENTE", "RECEBIDO", "ATRASADO",
]);

// ─── TENANTS ──────────────────────────────────────────────────────────────────

export const tenants = pgTable("tenants", {
  id: text("id").primaryKey(),
  nome: text("nome").notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

// ─── VENDEDORES ───────────────────────────────────────────────────────────────

export const vendedores = pgTable("vendedores", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  nome: text("nome").notNull(),
  email: text("email").notNull(),
  senhaHash: text("senha_hash").notNull(),
  perfil: perfilEnum("perfil").notNull().default("VENDEDOR"),
  codigoVendedor: text("codigo_vendedor"),
  comissaoPct: real("comissao_pct").notNull().default(5),
  ativo: boolean("ativo").notNull().default(true),
  sistema: boolean("sistema").notNull().default(false),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow(),
}, (t) => [uniqueIndex("vendedores_tenant_email_idx").on(t.tenantId, t.email)]);

// ─── CONFIGURAÇÕES ────────────────────────────────────────────────────────────

export const configuracoesAlerta = pgTable("configuracoes_alerta", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  entidade: entidadeAlertaEnum("entidade").notNull(),
  nivel: nivelAlertaEnum("nivel").notNull(),
  dias: integer("dias").notNull(),
  cor: varchar("cor", { length: 7 }).notNull(), // hex
  ativo: boolean("ativo").notNull().default(true),
}, (t) => [uniqueIndex("alerta_tenant_entidade_nivel_idx").on(t.tenantId, t.entidade, t.nivel)]);

// ─── TABELAS DE APOIO ─────────────────────────────────────────────────────────

export const origensLead = pgTable("origens_lead", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  nome: text("nome").notNull(),
  ativo: boolean("ativo").notNull().default(true),
});

export const campanhas = pgTable("campanhas", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  nome: text("nome").notNull(),
  ativo: boolean("ativo").notNull().default(true),
});

export const indicadores = pgTable("indicadores", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  nome: text("nome").notNull(),
  email: text("email"),
  ativo: boolean("ativo").notNull().default(true),
});

export const gruposProduto = pgTable("grupos_produto", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  nome: text("nome").notNull(),
  ativo: boolean("ativo").notNull().default(true),
});

export const motivosEncerramento = pgTable("motivos_encerramento", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  nome: text("nome").notNull(),
  ativo: boolean("ativo").notNull().default(true),
});

export const tiposOportunidade = pgTable("tipos_oportunidade", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  nome: text("nome").notNull(),
  ativo: boolean("ativo").notNull().default(true),
});

export const statusOportunidade = pgTable("status_oportunidade", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  nome: text("nome").notNull(),
  ordem: integer("ordem").notNull().default(0),
  ativo: boolean("ativo").notNull().default(true),
});

export const formasPagamento = pgTable("formas_pagamento", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  nome: text("nome").notNull(),
  ativo: boolean("ativo").notNull().default(true),
});

export const marcas = pgTable("marcas", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  nome: text("nome").notNull(),
  ativo: boolean("ativo").notNull().default(true),
});

export const categorias = pgTable("categorias", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  nome: text("nome").notNull(),
  ativo: boolean("ativo").notNull().default(true),
});

// ─── CLIENTES ─────────────────────────────────────────────────────────────────

export const clientes = pgTable("clientes", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  nome: text("nome").notNull(),
  documento: text("documento"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const clientesTelefones = pgTable("clientes_telefones", {
  id: text("id").primaryKey(),
  clienteId: text("cliente_id").notNull().references(() => clientes.id, { onDelete: "cascade" }),
  numero: text("numero").notNull(),
  tipo: text("tipo"),
});

export const clientesEmails = pgTable("clientes_emails", {
  id: text("id").primaryKey(),
  clienteId: text("cliente_id").notNull().references(() => clientes.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
});

export const clientesEnderecos = pgTable("clientes_enderecos", {
  id: text("id").primaryKey(),
  clienteId: text("cliente_id").notNull().references(() => clientes.id, { onDelete: "cascade" }),
  logradouro: text("logradouro"),
  numero: text("numero"),
  complemento: text("complemento"),
  bairro: text("bairro"),
  cidade: text("cidade"),
  estado: text("estado"),
  cep: text("cep"),
});

// ─── FORNECEDORES ─────────────────────────────────────────────────────────────

export const fornecedores = pgTable("fornecedores", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  nome: text("nome").notNull(),
  documento: text("documento"),
  contato: text("contato"),
  email: text("email"),
  telefone: text("telefone"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
});

export const fornecedoresEnderecos = pgTable("fornecedores_enderecos", {
  id: text("id").primaryKey(),
  fornecedorId: text("fornecedor_id").notNull().references(() => fornecedores.id, { onDelete: "cascade" }),
  logradouro: text("logradouro"),
  numero: text("numero"),
  complemento: text("complemento"),
  bairro: text("bairro"),
  cidade: text("cidade"),
  estado: text("estado"),
  cep: text("cep"),
});

// ─── PRODUTOS ─────────────────────────────────────────────────────────────────

export const produtos = pgTable("produtos", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  descricao: text("descricao").notNull(),
  partNumber: text("part_number").notNull(),
  marcaId: text("marca_id").references(() => marcas.id),
  categoriaId: text("categoria_id").references(() => categorias.id),
  precoLista: real("preco_lista").notNull().default(0),
  margemBrutaPct: real("margem_bruta_pct").notNull().default(20),
  indicePct: real("indice_pct").notNull().default(25),
  ativo: boolean("ativo").notNull().default(true),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
}, (t) => [uniqueIndex("produto_tenant_partnumber_idx").on(t.tenantId, t.partNumber)]);

export const produtosFornecedores = pgTable("produtos_fornecedores", {
  id: text("id").primaryKey(),
  produtoId: text("produto_id").notNull().references(() => produtos.id, { onDelete: "cascade" }),
  fornecedorId: text("fornecedor_id").notNull().references(() => fornecedores.id),
  icmsPct: real("icms_pct").notNull().default(0),
  precoFornecedor: real("preco_fornecedor"),
  principal: boolean("principal").notNull().default(false),
}, (t) => [uniqueIndex("produto_fornecedor_idx").on(t.produtoId, t.fornecedorId)]);

export const historicoPrecos = pgTable("historico_precos", {
  id: text("id").primaryKey(),
  produtoId: text("produto_id").notNull(),
  precoLista: real("preco_lista").notNull(),
  registradoEm: timestamp("registrado_em").notNull().defaultNow(),
  registradoPor: text("registrado_por"),
});

// ─── LEADS ────────────────────────────────────────────────────────────────────

export const leads = pgTable("leads", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  vendedorId: text("vendedor_id").notNull().references(() => vendedores.id),
  clienteId: text("cliente_id").references(() => clientes.id),
  origemId: text("origem_id").references(() => origensLead.id),
  campanhaId: text("campanha_id").references(() => campanhas.id),
  indicadorId: text("indicador_id").references(() => indicadores.id),
  grupoProdutoId: text("grupo_produto_id").references(() => gruposProduto.id),
  categoriaId: text("categoria_id").references(() => categorias.id),
  nomeContato: text("nome_contato").notNull(),
  empresa: text("empresa"),
  telefone: text("telefone"),
  email: text("email"),
  status: statusLeadEnum("status").notNull().default("NOVO"),
  temperatura: integer("temperatura").notNull().default(1),
  observacoes: text("observacoes"),
  oportunidadeId: text("oportunidade_id"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow(),
});

// ─── FEED (IMUTÁVEL) ──────────────────────────────────────────────────────────

export const feedLeads = pgTable("feed_leads", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  leadId: text("lead_id").notNull().references(() => leads.id),
  oportunidadeId: text("oportunidade_id"),
  vendedorId: text("vendedor_id").notNull().references(() => vendedores.id),
  dataHora: timestamp("data_hora").notNull().defaultNow(),
  texto: text("texto").notNull(),
  tipo: tipoFeedEnum("tipo").notNull().default("ANOTACAO"),
});

// ─── OPORTUNIDADES ────────────────────────────────────────────────────────────

export const oportunidades = pgTable("oportunidades", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  vendedorId: text("vendedor_id").notNull().references(() => vendedores.id),
  clienteId: text("cliente_id").notNull().references(() => clientes.id),
  tipoId: text("tipo_id").references(() => tiposOportunidade.id),
  statusId: text("status_id").references(() => statusOportunidade.id),
  motivoEncerramentoId: text("motivo_encerramento_id").references(() => motivosEncerramento.id),
  titulo: text("titulo").notNull(),
  temperatura: integer("temperatura").notNull().default(1),
  valorEstimado: real("valor_estimado"),
  dataFechamentoPrevisto: timestamp("data_fechamento_previsto"),
  observacoes: text("observacoes"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow(),
});

// ─── COTAÇÕES ─────────────────────────────────────────────────────────────────

export const cotacoes = pgTable("cotacoes", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  oportunidadeId: text("oportunidade_id").notNull().references(() => oportunidades.id),
  vendedorId: text("vendedor_id").notNull().references(() => vendedores.id),
  numero: integer("numero").notNull(),
  descricao: text("descricao"),
  observacoes: text("observacoes"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow(),
});

export const cotacaoItens = pgTable("cotacao_itens", {
  id: text("id").primaryKey(),
  cotacaoId: text("cotacao_id").notNull().references(() => cotacoes.id, { onDelete: "cascade" }),
  produtoId: text("produto_id").references(() => produtos.id),
  descricao: text("descricao").notNull(),
  quantidade: real("quantidade").notNull().default(1),
  custoUnitario: real("custo_unitario").notNull().default(0),
  observacoes: text("observacoes"),
});

export const cotacaoItemFornecedores = pgTable("cotacao_item_fornecedores", {
  id: text("id").primaryKey(),
  cotacaoItemId: text("cotacao_item_id").notNull().references(() => cotacaoItens.id, { onDelete: "cascade" }),
  fornecedorNome: text("fornecedor_nome").notNull(),
  preco: real("preco").notNull(),
  prazoEntrega: integer("prazo_entrega"),
  observacoes: text("observacoes"),
});

// ─── PROPOSTAS ────────────────────────────────────────────────────────────────

export const propostas = pgTable("propostas", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  oportunidadeId: text("oportunidade_id").notNull().references(() => oportunidades.id),
  vendedorId: text("vendedor_id").notNull().references(() => vendedores.id),
  formaPagamentoId: text("forma_pagamento_id").references(() => formasPagamento.id),
  numero: integer("numero").notNull(),
  descricao: text("descricao"),
  validadeAte: timestamp("validade_ate"),
  status: statusPropostaEnum("status").notNull().default("RASCUNHO"),
  observacoes: text("observacoes"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow(),
});

export const propostaItens = pgTable("proposta_itens", {
  id: text("id").primaryKey(),
  propostaId: text("proposta_id").notNull().references(() => propostas.id, { onDelete: "cascade" }),
  produtoId: text("produto_id").references(() => produtos.id),
  descricao: text("descricao").notNull(),
  quantidade: real("quantidade").notNull().default(1),
  custoUnitario: real("custo_unitario").notNull().default(0),
  margemBrutaPct: real("margem_bruta_pct").notNull().default(20),
  indicePct: real("indice_pct").notNull().default(25),
  precoVenda: real("preco_venda").notNull().default(0),
  margemBrutaRs: real("margem_bruta_rs").notNull().default(0),
  deducaoIndiceRs: real("deducao_indice_rs").notNull().default(0),
  margemLiquidaRs: real("margem_liquida_rs").notNull().default(0),
  comissaoPct: real("comissao_pct").notNull().default(5),
  comissaoRs: real("comissao_rs").notNull().default(0),
  resultadoLiq: real("resultado_liq").notNull().default(0),
});

export const propostaHistorico = pgTable("proposta_historico", {
  id: text("id").primaryKey(),
  propostaId: text("proposta_id").notNull().references(() => propostas.id),
  status: statusPropostaEnum("status").notNull(),
  observacao: text("observacao"),
  registradoEm: timestamp("registrado_em").notNull().defaultNow(),
  registradoPor: text("registrado_por"),
});

// ─── PEDIDOS ──────────────────────────────────────────────────────────────────

export const pedidos = pgTable("pedidos", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull().references(() => tenants.id),
  propostaId: text("proposta_id").references(() => propostas.id),
  vendedorId: text("vendedor_id").notNull().references(() => vendedores.id),
  formaPagamentoId: text("forma_pagamento_id").references(() => formasPagamento.id),
  numeroPedido: integer("numero_pedido").notNull(),
  status: statusPedidoEnum("status").notNull().default("PENDENTE"),
  valorTotal: real("valor_total").notNull().default(0),
  observacoes: text("observacoes"),
  criadoEm: timestamp("criado_em").notNull().defaultNow(),
  atualizadoEm: timestamp("atualizado_em").notNull().defaultNow(),
});

export const parcelas = pgTable("parcelas", {
  id: text("id").primaryKey(),
  pedidoId: text("pedido_id").notNull().references(() => pedidos.id, { onDelete: "cascade" }),
  numero: integer("numero").notNull(),
  valor: real("valor").notNull(),
  vencimento: timestamp("vencimento").notNull(),
  status: statusParcelaEnum("status").notNull().default("PENDENTE"),
});

export const liquidacoes = pgTable("liquidacoes", {
  id: text("id").primaryKey(),
  parcelaId: text("parcela_id").notNull().references(() => parcelas.id),
  valor: real("valor").notNull(),
  dataPagamento: timestamp("data_pagamento").notNull(),
  observacao: text("observacao"),
  registradoEm: timestamp("registrado_em").notNull().defaultNow(),
});
