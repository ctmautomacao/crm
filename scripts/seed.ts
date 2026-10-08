import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/db/schema";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://crm_user:crm_pass@localhost:5432/crm_ctm",
});

const db = drizzle(pool, { schema });

function uid() {
  return randomUUID().replace(/-/g, "").slice(0, 24);
}

async function main() {
  console.log("🌱 Iniciando seed...");

  // ─── TENANT CTM ────────────────────────────────────────────────────────────
  const tenantId = uid();
  await db.insert(schema.tenants).values({
    id: tenantId,
    nome: "CTM Automação",
    slug: "ctm",
    ativo: true,
  }).onConflictDoNothing();

  console.log("✓ Tenant CTM criado");

  // ─── VENDEDORES ────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("admin123", 12);
  const vendedorHash = await bcrypt.hash("vendedor123", 12);

  const adminId = uid();
  const gerenteId = uid();
  const vendedorId = uid();

  await db.insert(schema.vendedores).values([
    {
      id: adminId,
      tenantId,
      nome: "Admin CTM",
      email: "admin@crm.com",
      senhaHash: adminHash,
      perfil: "GERENTE",
      codigoVendedor: "ADM",
      comissaoPct: 0,
      ativo: true,
      sistema: true,
    },
    {
      id: gerenteId,
      tenantId,
      nome: "Maximiliano Brungari",
      email: "max@ctmautomacao.com.br",
      senhaHash: adminHash,
      perfil: "GERENTE",
      codigoVendedor: "MAX",
      comissaoPct: 5,
      ativo: true,
      sistema: false,
    },
    {
      id: vendedorId,
      tenantId,
      nome: "João Vendedor",
      email: "joao@ctmautomacao.com.br",
      senhaHash: vendedorHash,
      perfil: "VENDEDOR",
      codigoVendedor: "JOA",
      comissaoPct: 5,
      ativo: true,
      sistema: false,
    },
  ]).onConflictDoNothing();

  console.log("✓ Vendedores criados");

  // ─── CONFIGURAÇÕES DE ALERTA ────────────────────────────────────────────────
  await db.insert(schema.configuracoesAlerta).values([
    { id: uid(), tenantId, entidade: "LEAD", nivel: "ATENCAO", dias: 3, cor: "#FEF08A", ativo: true },
    { id: uid(), tenantId, entidade: "LEAD", nivel: "CRITICO", dias: 7, cor: "#FCA5A5", ativo: true },
    { id: uid(), tenantId, entidade: "OPORTUNIDADE", nivel: "ATENCAO", dias: 5, cor: "#FEF08A", ativo: true },
    { id: uid(), tenantId, entidade: "OPORTUNIDADE", nivel: "CRITICO", dias: 14, cor: "#FCA5A5", ativo: true },
  ]).onConflictDoNothing();

  // ─── ORIGENS DE LEAD ────────────────────────────────────────────────────────
  const origens = ["Site", "Indicação", "Cold Call", "WhatsApp", "Instagram", "LinkedIn", "Feira/Evento", "Email Marketing"];
  for (const nome of origens) {
    await db.insert(schema.origensLead).values({ id: uid(), tenantId, nome }).onConflictDoNothing();
  }

  // ─── CAMPANHAS ──────────────────────────────────────────────────────────────
  const campanhas = ["Black Friday 2024", "Lançamento 2025", "Prospecção Q1", "Reativação de Clientes"];
  for (const nome of campanhas) {
    await db.insert(schema.campanhas).values({ id: uid(), tenantId, nome }).onConflictDoNothing();
  }

  // ─── INDICADORES ────────────────────────────────────────────────────────────
  await db.insert(schema.indicadores).values([
    { id: uid(), tenantId, nome: "Carlos Silva", email: "carlos@exemplo.com" },
    { id: uid(), tenantId, nome: "Ana Oliveira", email: "ana@exemplo.com" },
    { id: uid(), tenantId, nome: "Roberto Santos" },
  ]).onConflictDoNothing();

  // ─── TIPOS DE OPORTUNIDADE ──────────────────────────────────────────────────
  const tipos = ["Automação Industrial", "Elétrica", "Hidráulica", "Pneumática", "Manutenção", "Projeto"];
  for (const nome of tipos) {
    await db.insert(schema.tiposOportunidade).values({ id: uid(), tenantId, nome }).onConflictDoNothing();
  }

  // ─── STATUS DE OPORTUNIDADE ─────────────────────────────────────────────────
  const statusList = [
    { nome: "Qualificação", ordem: 1 },
    { nome: "Proposta", ordem: 2 },
    { nome: "Negociação", ordem: 3 },
    { nome: "Fechamento", ordem: 4 },
    { nome: "Ganho", ordem: 5 },
    { nome: "Perdido", ordem: 6 },
  ];
  for (const s of statusList) {
    await db.insert(schema.statusOportunidade).values({ id: uid(), tenantId, ...s }).onConflictDoNothing();
  }

  // ─── MOTIVOS DE ENCERRAMENTO ─────────────────────────────────────────────────
  const motivos = ["Preço alto", "Comprou concorrente", "Sem orçamento", "Projeto cancelado", "Sem retorno", "Ganhou a proposta"];
  for (const nome of motivos) {
    await db.insert(schema.motivosEncerramento).values({ id: uid(), tenantId, nome }).onConflictDoNothing();
  }

  // ─── FORMAS DE PAGAMENTO ─────────────────────────────────────────────────────
  const formas = ["À Vista", "Boleto 30dd", "Boleto 30/60dd", "Cartão de Crédito", "Pix", "Transferência"];
  for (const nome of formas) {
    await db.insert(schema.formasPagamento).values({ id: uid(), tenantId, nome }).onConflictDoNothing();
  }

  // ─── MARCAS ──────────────────────────────────────────────────────────────────
  const marcasArr = ["Schneider Electric", "Siemens", "ABB", "WEG", "Rockwell", "Omron", "Festo", "SMC"];
  for (const nome of marcasArr) {
    await db.insert(schema.marcas).values({ id: uid(), tenantId, nome }).onConflictDoNothing();
  }

  // ─── CATEGORIAS ──────────────────────────────────────────────────────────────
  const categoriasArr = ["Inversor de Frequência", "CLP / PLC", "IHM", "Sensor", "Atuador Pneumático", "Válvula", "Relé", "Contatora", "Servomotor", "Cabo / Conector"];
  for (const nome of categoriasArr) {
    await db.insert(schema.categorias).values({ id: uid(), tenantId, nome }).onConflictDoNothing();
  }

  // ─── GRUPOS DE PRODUTO ───────────────────────────────────────────────────────
  const grupos = ["Automação", "Elétrica Industrial", "Pneumática", "Hidráulica", "Instrumentação"];
  for (const nome of grupos) {
    await db.insert(schema.gruposProduto).values({ id: uid(), tenantId, nome }).onConflictDoNothing();
  }

  console.log("✓ Tabelas de apoio criadas");

  // ─── CLIENTES DE EXEMPLO ────────────────────────────────────────────────────
  const cliente1Id = uid();
  const cliente2Id = uid();
  await db.insert(schema.clientes).values([
    { id: cliente1Id, tenantId, nome: "Indústria ABC Ltda", documento: "12.345.678/0001-99" },
    { id: cliente2Id, tenantId, nome: "Metalúrgica XYZ S.A.", documento: "98.765.432/0001-11" },
  ]).onConflictDoNothing();

  await db.insert(schema.clientesTelefones).values([
    { id: uid(), clienteId: cliente1Id, numero: "(11) 3333-4444", tipo: "fixo" },
    { id: uid(), clienteId: cliente1Id, numero: "(11) 99999-8888", tipo: "whatsapp" },
    { id: uid(), clienteId: cliente2Id, numero: "(21) 4444-5555", tipo: "fixo" },
  ]).onConflictDoNothing();

  await db.insert(schema.clientesEmails).values([
    { id: uid(), clienteId: cliente1Id, email: "compras@industriaabc.com.br" },
    { id: uid(), clienteId: cliente2Id, email: "manutencao@metalurgicaxyz.com.br" },
  ]).onConflictDoNothing();

  // ─── FORNECEDORES DE EXEMPLO ────────────────────────────────────────────────
  const forn1Id = uid();
  await db.insert(schema.fornecedores).values([
    {
      id: forn1Id,
      tenantId,
      nome: "Distribuidora Eletro SP",
      documento: "11.222.333/0001-44",
      contato: "Maria",
      email: "maria@eletrosp.com.br",
      telefone: "(11) 5555-6666",
    },
  ]).onConflictDoNothing();

  console.log("✓ Clientes e fornecedores criados");

  // ─── LEADS DE EXEMPLO ────────────────────────────────────────────────────────
  const lead1Id = uid();
  const lead2Id = uid();
  await db.insert(schema.leads).values([
    {
      id: lead1Id,
      tenantId,
      vendedorId: gerenteId,
      clienteId: cliente1Id,
      nomeContato: "Roberto Pereira",
      empresa: "Indústria ABC Ltda",
      telefone: "(11) 99999-8888",
      email: "roberto@industriaabc.com.br",
      status: "EM_NEGOCIACAO",
      temperatura: 4,
      observacoes: "Interessado em inversores de frequência",
    },
    {
      id: lead2Id,
      tenantId,
      vendedorId: vendedorId,
      nomeContato: "Fernanda Costa",
      empresa: "Plásticos Modern Ltda",
      telefone: "(11) 98888-7777",
      status: "NOVO",
      temperatura: 2,
    },
  ]).onConflictDoNothing();

  // Feed do lead 1
  await db.insert(schema.feedLeads).values([
    {
      id: uid(),
      tenantId,
      leadId: lead1Id,
      vendedorId: gerenteId,
      texto: "Lead recebido pelo site. Interesse em automação de linha de produção.",
      tipo: "ANOTACAO",
    },
    {
      id: uid(),
      tenantId,
      leadId: lead1Id,
      vendedorId: gerenteId,
      texto: "Primeiro contato realizado. Agendou visita técnica para semana que vem.",
      tipo: "MUDANCA_STATUS",
    },
  ]).onConflictDoNothing();

  console.log("✓ Leads e feed criados");
  console.log("\n🎉 Seed concluído!");
  console.log("\n📋 Credenciais:");
  console.log("  admin@crm.com           / admin123     (gerente sistema)");
  console.log("  max@ctmautomacao.com.br / admin123     (gerente CTM)");
  console.log("  joao@ctmautomacao.com.br / vendedor123  (vendedor)");
}

main()
  .catch(console.error)
  .finally(() => pool.end());
