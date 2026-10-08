import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { clientes, clientesTelefones, clientesEmails, leads, pedidos } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [cliente] = await db.select().from(clientes)
    .where(and(eq(clientes.id, params.id), eq(clientes.tenantId, session.user.tenantId)));

  if (!cliente) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [telefones, emails, leadsRows, pedidosRows] = await Promise.all([
    db.select().from(clientesTelefones).where(eq(clientesTelefones.clienteId, cliente.id)),
    db.select().from(clientesEmails).where(eq(clientesEmails.clienteId, cliente.id)),
    db.select({ id: leads.id, nomeContato: leads.nomeContato, status: leads.status, criadoEm: leads.criadoEm })
      .from(leads).where(and(eq(leads.clienteId, cliente.id), eq(leads.tenantId, session.user.tenantId))),
    db.select({ id: pedidos.id, numero: pedidos.numero, status: pedidos.status, valorTotal: pedidos.valorTotal })
      .from(pedidos).where(and(eq(pedidos.clienteId, cliente.id), eq(pedidos.tenantId, session.user.tenantId))),
  ]);

  return NextResponse.json({ cliente, telefones, emails, leads: leadsRows, pedidos: pedidosRows });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const [updated] = await db.update(clientes).set({
    nome: body.nome,
    cpfCnpj: body.cpfCnpj,
    email: body.email,
    telefone: body.telefone,
    endereco: body.endereco,
    cidade: body.cidade,
    estado: body.estado,
    cep: body.cep,
    observacoes: body.observacoes,
    ativo: body.ativo ?? true,
    atualizadoEm: new Date(),
  })
    .where(and(eq(clientes.id, params.id), eq(clientes.tenantId, session.user.tenantId)))
    .returning();

  return NextResponse.json(updated);
}
