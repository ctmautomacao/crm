import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { propostaItens, propostas } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { calcularMargem } from "@/lib/utils";

function uid() { return randomUUID().replace(/-/g, "").slice(0, 24); }

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [proposta] = await db.select().from(propostas)
    .where(and(eq(propostas.id, params.id), eq(propostas.tenantId, session.user.tenantId)));

  if (!proposta) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  const calc = calcularMargem({
    custo: Number(body.custo),
    margemBrutaPct: Number(body.margemBrutaPct),
    indicePct: Number(body.indicePct || 0),
    comissaoPct: Number(body.comissaoPct || 0),
    quantidade: Number(body.quantidade || 1),
  });

  const [item] = await db.insert(propostaItens).values({
    id: uid(),
    tenantId: session.user.tenantId,
    propostaId: params.id,
    produtoId: body.produtoId || null,
    descricao: body.descricao,
    quantidade: String(body.quantidade || 1),
    custo: String(body.custo),
    margemBrutaPct: String(body.margemBrutaPct),
    indicePct: String(body.indicePct || 0),
    comissaoPct: String(body.comissaoPct || 0),
    precoUnitario: String(calc.precoVenda),
    precoTotal: String(calc.precoVenda * Number(body.quantidade || 1)),
    margemBrutaRs: String(calc.margemBrutaRs),
    margemLiquidaRs: String(calc.margemLiquidaRs),
    comissaoRs: String(calc.comissaoRs),
    resultadoLiq: String(calc.resultadoLiq),
  }).returning();

  // Recalculate proposta total
  const allItens = await db.select({ precoTotal: propostaItens.precoTotal })
    .from(propostaItens).where(eq(propostaItens.propostaId, params.id));
  const total = allItens.reduce((acc, i) => acc + Number(i.precoTotal), 0);

  await db.update(propostas).set({ valorTotal: String(total), atualizadoEm: new Date() })
    .where(eq(propostas.id, params.id));

  return NextResponse.json(item, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { itemId } = await req.json();

  await db.delete(propostaItens)
    .where(and(eq(propostaItens.id, itemId), eq(propostaItens.propostaId, params.id)));

  // Recalculate total
  const allItens = await db.select({ precoTotal: propostaItens.precoTotal })
    .from(propostaItens).where(eq(propostaItens.propostaId, params.id));
  const total = allItens.reduce((acc, i) => acc + Number(i.precoTotal), 0);

  await db.update(propostas).set({ valorTotal: String(total), atualizadoEm: new Date() })
    .where(eq(propostas.id, params.id));

  return NextResponse.json({ ok: true });
}
