import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import {
  oportunidades, vendedores, clientes, statusOportunidade, tiposOportunidade,
  feedLeads, propostas
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [oportunidade] = await db.select().from(oportunidades)
    .where(and(eq(oportunidades.id, params.id), eq(oportunidades.tenantId, session.user.tenantId)));

  if (!oportunidade) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [vend, cli, stat, tipo, feedRows, propostasRows] = await Promise.all([
    oportunidade.vendedorId
      ? db.select({ nome: vendedores.nome }).from(vendedores).where(eq(vendedores.id, oportunidade.vendedorId)).then(r => r[0])
      : null,
    oportunidade.clienteId
      ? db.select().from(clientes).where(eq(clientes.id, oportunidade.clienteId)).then(r => r[0])
      : null,
    oportunidade.statusId
      ? db.select().from(statusOportunidade).where(eq(statusOportunidade.id, oportunidade.statusId)).then(r => r[0])
      : null,
    oportunidade.tipoId
      ? db.select().from(tiposOportunidade).where(eq(tiposOportunidade.id, oportunidade.tipoId)).then(r => r[0])
      : null,
    db.select().from(feedLeads).where(eq(feedLeads.oportunidadeId, oportunidade.id)).orderBy(feedLeads.criadoEm),
    db.select({ id: propostas.id, numero: propostas.numero, status: propostas.status })
      .from(propostas).where(eq(propostas.oportunidadeId, oportunidade.id)),
  ]);

  // Enrich feed with author names
  const feedComAutor = await Promise.all(
    feedRows.map(async (f) => {
      if (!f.autorId) return { ...f, autorNome: null };
      const autor = await db.select({ nome: vendedores.nome }).from(vendedores).where(eq(vendedores.id, f.autorId)).then(r => r[0]);
      return { ...f, autorNome: autor?.nome || null };
    })
  );

  return NextResponse.json({
    oportunidade,
    vendedor: vend,
    cliente: cli,
    status: stat,
    tipo,
    feed: feedComAutor,
    propostas: propostasRows,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const [updated] = await db.update(oportunidades)
    .set({
      titulo: body.titulo,
      valorEstimado: body.valorEstimado ? String(body.valorEstimado) : null,
      temperatura: body.temperatura,
      statusId: body.statusId || null,
      tipoId: body.tipoId || null,
      vendedorId: body.vendedorId || null,
      observacoes: body.observacoes,
      atualizadoEm: new Date(),
    })
    .where(and(eq(oportunidades.id, params.id), eq(oportunidades.tenantId, session.user.tenantId)))
    .returning();

  return NextResponse.json(updated);
}
