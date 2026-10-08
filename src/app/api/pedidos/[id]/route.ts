import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { pedidos, clientes, vendedores, propostas, parcelas, liquidacoes } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [pedido] = await db.select().from(pedidos)
    .where(and(eq(pedidos.id, params.id), eq(pedidos.tenantId, session.user.tenantId)));

  if (!pedido) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [cli, vend, prop, parcelasRows] = await Promise.all([
    pedido.clienteId ? db.select().from(clientes).where(eq(clientes.id, pedido.clienteId)).then(r => r[0]) : null,
    pedido.vendedorId ? db.select({ nome: vendedores.nome }).from(vendedores).where(eq(vendedores.id, pedido.vendedorId)).then(r => r[0]) : null,
    pedido.propostaId ? db.select({ numero: propostas.numero }).from(propostas).where(eq(propostas.id, pedido.propostaId)).then(r => r[0]) : null,
    db.select().from(parcelas).where(eq(parcelas.pedidoId, pedido.id)).orderBy(parcelas.numero),
  ]);

  const parcelasComLiquidacoes = await Promise.all(parcelasRows.map(async (p) => {
    const liqs = await db.select().from(liquidacoes).where(eq(liquidacoes.parcelaId, p.id));
    return { ...p, liquidacoes: liqs };
  }));

  return NextResponse.json({ pedido, cliente: cli, vendedor: vend, proposta: prop, parcelas: parcelasComLiquidacoes });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const [updated] = await db.update(pedidos).set({
    status: body.status,
    observacoes: body.observacoes,
    atualizadoEm: new Date(),
  })
    .where(and(eq(pedidos.id, params.id), eq(pedidos.tenantId, session.user.tenantId)))
    .returning();

  return NextResponse.json(updated);
}
