import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { oportunidades, vendedores, clientes, statusOportunidade, tiposOportunidade } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = session.user.tenantId;
  const isGerente = session.user.perfil === "GERENTE";

  const where = isGerente
    ? eq(oportunidades.tenantId, tenantId)
    : and(eq(oportunidades.tenantId, tenantId), eq(oportunidades.vendedorId, session.user.id!));

  const rows = await db.select().from(oportunidades).where(where as any).orderBy(oportunidades.criadoEm);

  // Enrich with related data
  const result = await Promise.all(
    rows.map(async (o) => {
      const [vend, cli, stat, tipo] = await Promise.all([
        o.vendedorId ? db.select({ nome: vendedores.nome }).from(vendedores).where(eq(vendedores.id, o.vendedorId)).then(r => r[0]) : null,
        o.clienteId ? db.select({ id: clientes.id, nome: clientes.nome }).from(clientes).where(eq(clientes.id, o.clienteId)).then(r => r[0]) : null,
        o.statusId ? db.select({ nome: statusOportunidade.nome }).from(statusOportunidade).where(eq(statusOportunidade.id, o.statusId)).then(r => r[0]) : null,
        o.tipoId ? db.select({ nome: tiposOportunidade.nome }).from(tiposOportunidade).where(eq(tiposOportunidade.id, o.tipoId)).then(r => r[0]) : null,
      ]);
      return { oportunidade: o, vendedor: vend, cliente: cli, status: stat, tipo };
    })
  );

  return NextResponse.json(result);
}
