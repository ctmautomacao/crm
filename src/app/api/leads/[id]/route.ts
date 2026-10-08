import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { leads, feedLeads, clientes, clientesTelefones, clientesEmails, vendedores, origensLead, campanhas, indicadores } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [row] = await db
    .select({
      lead: leads,
      vendedor: vendedores,
      origem: origensLead,
      campanha: campanhas,
      indicador: indicadores,
      cliente: clientes,
    })
    .from(leads)
    .leftJoin(vendedores, eq(leads.vendedorId, vendedores.id))
    .leftJoin(origensLead, eq(leads.origemId, origensLead.id))
    .leftJoin(campanhas, eq(leads.campanhaId, campanhas.id))
    .leftJoin(indicadores, eq(leads.indicadorId, indicadores.id))
    .leftJoin(clientes, eq(leads.clienteId, clientes.id))
    .where(and(eq(leads.id, params.id), eq(leads.tenantId, session.user.tenantId)));

  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // feed
  const feed = await db
    .select({ feed: feedLeads, vendedor: vendedores })
    .from(feedLeads)
    .leftJoin(vendedores, eq(feedLeads.vendedorId, vendedores.id))
    .where(and(eq(feedLeads.leadId, params.id), eq(feedLeads.tenantId, session.user.tenantId)))
    .orderBy(asc(feedLeads.dataHora));

  // telefones / emails do cliente
  let telefones: any[] = [];
  let emails: any[] = [];
  if (row.lead.clienteId) {
    telefones = await db.select().from(clientesTelefones).where(eq(clientesTelefones.clienteId, row.lead.clienteId));
    emails = await db.select().from(clientesEmails).where(eq(clientesEmails.clienteId, row.lead.clienteId));
  }

  return NextResponse.json({ ...row, feed, telefones, emails });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const [updated] = await db
    .update(leads)
    .set({ ...body, atualizadoEm: new Date() })
    .where(and(eq(leads.id, params.id), eq(leads.tenantId, session.user.tenantId)))
    .returning();

  return NextResponse.json(updated);
}
