import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { leads, oportunidades, feedLeads, clientes, clientesTelefones, clientesEmails } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

function uid() {
  return randomUUID().replace(/-/g, "").slice(0, 24);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = session.user.tenantId;
  const vendedorId = session.user.id!;

  // Busca o lead
  const [lead] = await db
    .select()
    .from(leads)
    .where(and(eq(leads.id, params.id), eq(leads.tenantId, tenantId)));

  if (!lead) return NextResponse.json({ error: "Lead não encontrado" }, { status: 404 });
  if (lead.oportunidadeId) return NextResponse.json({ error: "Lead já convertido" }, { status: 400 });

  // Garante que tem um cliente vinculado
  let clienteId = lead.clienteId;
  if (!clienteId) {
    clienteId = uid();
    await db.insert(clientes).values({
      id: clienteId,
      tenantId,
      nome: lead.empresa || lead.nomeContato,
    });
    if (lead.telefone) {
      await db.insert(clientesTelefones).values({ id: uid(), clienteId, numero: lead.telefone, tipo: "celular" });
    }
    if (lead.email) {
      await db.insert(clientesEmails).values({ id: uid(), clienteId, email: lead.email });
    }
    // Atualiza o lead com o clienteId
    await db.update(leads).set({ clienteId }).where(eq(leads.id, lead.id));
  }

  // Cria a oportunidade
  const body = await req.json().catch(() => ({}));
  const oportunidadeId = uid();
  await db.insert(oportunidades).values({
    id: oportunidadeId,
    tenantId,
    vendedorId,
    clienteId,
    titulo: body.titulo || `Oportunidade - ${lead.nomeContato}`,
    temperatura: lead.temperatura,
    tipoId: body.tipoId,
    observacoes: lead.observacoes,
  });

  // Atualiza lead como convertido
  await db.update(leads).set({
    status: "CONVERTIDO",
    oportunidadeId,
    atualizadoEm: new Date(),
  }).where(eq(leads.id, lead.id));

  // Registra no feed
  await db.insert(feedLeads).values({
    id: uid(),
    tenantId,
    leadId: lead.id,
    oportunidadeId,
    vendedorId,
    texto: `Lead convertido em Oportunidade por ${session.user.name}`,
    tipo: "CONVERSAO",
  });

  return NextResponse.json({ oportunidadeId });
}
