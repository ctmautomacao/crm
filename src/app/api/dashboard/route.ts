import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { leads, oportunidades, propostas, pedidos, vendedores } from "@/db/schema";
import { eq, and, count, sum } from "drizzle-orm";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = session.user.tenantId;
  const vendedorId = session.user.id!;
  const isGerente = session.user.perfil === "GERENTE";

  const whereLeads = isGerente
    ? eq(leads.tenantId, tenantId)
    : and(eq(leads.tenantId, tenantId), eq(leads.vendedorId, vendedorId));

  const whereOpor = isGerente
    ? eq(oportunidades.tenantId, tenantId)
    : and(eq(oportunidades.tenantId, tenantId), eq(oportunidades.vendedorId, vendedorId));

  const wherePropostas = isGerente
    ? eq(propostas.tenantId, tenantId)
    : and(eq(propostas.tenantId, tenantId), eq(propostas.vendedorId, vendedorId));

  const wherePedidos = isGerente
    ? eq(pedidos.tenantId, tenantId)
    : and(eq(pedidos.tenantId, tenantId), eq(pedidos.vendedorId, vendedorId));

  const [totalLeads] = await db.select({ count: count() }).from(leads).where(whereLeads);
  const [totalOportunidades] = await db.select({ count: count() }).from(oportunidades).where(whereOpor);
  const [propostasAprovadas] = await db
    .select({ count: count() })
    .from(propostas)
    .where(and(wherePropostas as any, eq(propostas.status, "APROVADA")));

  const [pedidosMes] = await db.select({ count: count(), total: sum(pedidos.valorTotal) }).from(pedidos).where(wherePedidos);

  return NextResponse.json({
    totalLeads: totalLeads.count,
    totalOportunidades: totalOportunidades.count,
    propostasAprovadas: propostasAprovadas.count,
    pedidosMes: {
      count: pedidosMes.count,
      total: pedidosMes.total ?? 0,
    },
  });
}
