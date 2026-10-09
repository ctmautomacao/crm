import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { leads, clientes, clientesTelefones, clientesEmails, vendedores, origensLead, campanhas, indicadores } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";

function uid() {
  return randomUUID().replace(/-/g, "").slice(0, 24);
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = session.user.tenantId;
  const isGerente = session.user.perfil === "GERENTE";

  const rows = await db
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
    .where(
      isGerente
        ? eq(leads.tenantId, tenantId)
        : and(eq(leads.tenantId, tenantId), eq(leads.vendedorId, session.user.id!))
    )
    .orderBy(desc(leads.criadoEm));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const tenantId = session.user.tenantId;
  const vendedorId = body.vendedorId || session.user.id!;

  // Se não tem clienteId, cria um cliente
  let clienteId = body.clienteId;
  if (!clienteId && (body.nomeContato || body.empresa)) {
    clienteId = uid();
    await db.insert(clientes).values({
      id: clienteId,
      tenantId,
      nome: body.empresa || body.nomeContato,
      documento: body.documento,
    });

    if (body.telefone) {
      await db.insert(clientesTelefones).values({
        id: uid(),
        clienteId,
        numero: body.telefone,
        tipo: "celular",
      });
    }
    if (body.email) {
      await db.insert(clientesEmails).values({
        id: uid(),
        clienteId,
        email: body.email,
      });
    }
  }

  const leadId = uid();
  const [lead] = await db.insert(leads).values({
    id: leadId,
    tenantId,
    vendedorId,
    clienteId,
    origemId: body.origemId || null,
    campanhaId: body.campanhaId || null,
    indicadorId: body.indicadorId || null,
    grupoProdutoId: body.grupoProdutoId || null,
    categoriaId: body.categoriaId || null,
    nomeContato: body.nomeContato,
    empresa: body.empresa,
    telefone: body.telefone,
    email: body.email,
    status: body.status || "NOVO",
    temperatura: body.temperatura || 1,
    observacoes: body.observacoes,
  }).returning();

  return NextResponse.json(lead, { status: 201 });
}
