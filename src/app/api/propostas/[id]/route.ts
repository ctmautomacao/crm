import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { propostas, propostaItens, propostaHistorico, clientes, vendedores, oportunidades, produtos, formasPagamento } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

function uid() { return randomUUID().replace(/-/g, "").slice(0, 24); }

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [proposta] = await db.select().from(propostas)
    .where(and(eq(propostas.id, params.id), eq(propostas.tenantId, session.user.tenantId)));

  if (!proposta) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [cli, vend, opor, itens, historico, formaRows] = await Promise.all([
    proposta.clienteId ? db.select().from(clientes).where(eq(clientes.id, proposta.clienteId)).then(r => r[0]) : null,
    proposta.vendedorId ? db.select({ nome: vendedores.nome }).from(vendedores).where(eq(vendedores.id, proposta.vendedorId)).then(r => r[0]) : null,
    proposta.oportunidadeId ? db.select({ titulo: oportunidades.titulo }).from(oportunidades).where(eq(oportunidades.id, proposta.oportunidadeId)).then(r => r[0]) : null,
    db.select().from(propostaItens).where(eq(propostaItens.propostaId, proposta.id)),
    db.select().from(propostaHistorico).where(eq(propostaHistorico.propostaId, proposta.id)).orderBy(propostaHistorico.criadoEm),
    proposta.formaPagamentoId ? db.select().from(formasPagamento).where(eq(formasPagamento.id, proposta.formaPagamentoId)).then(r => r[0]) : null,
  ]);

  // Enrich items with product names
  const itensEnriquecidos = await Promise.all(itens.map(async (item) => {
    const prod = item.produtoId
      ? await db.select({ nome: produtos.nome, partNumber: produtos.partNumber }).from(produtos).where(eq(produtos.id, item.produtoId)).then(r => r[0])
      : null;
    return { ...item, produto: prod };
  }));

  return NextResponse.json({
    proposta, cliente: cli, vendedor: vend, oportunidade: opor,
    itens: itensEnriquecidos, historico, formaPagamento: formaRows,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  // Log status change
  if (body.status) {
    const [current] = await db.select({ status: propostas.status }).from(propostas)
      .where(eq(propostas.id, params.id));
    if (current && current.status !== body.status) {
      await db.insert(propostaHistorico).values({
        id: uid(),
        tenantId: session.user.tenantId,
        propostaId: params.id,
        status: body.status,
        texto: body.motivoStatus || `Status alterado para ${body.status}`,
        autorId: session.user.id || null,
      });
    }
  }

  const [updated] = await db.update(propostas).set({
    status: body.status,
    validadeAte: body.validadeAte ? new Date(body.validadeAte) : undefined,
    observacoes: body.observacoes,
    formaPagamentoId: body.formaPagamentoId || null,
    condicaoPagamento: body.condicaoPagamento,
    valorTotal: body.valorTotal ? String(body.valorTotal) : undefined,
    atualizadoEm: new Date(),
  })
    .where(and(eq(propostas.id, params.id), eq(propostas.tenantId, session.user.tenantId)))
    .returning();

  return NextResponse.json(updated);
}
