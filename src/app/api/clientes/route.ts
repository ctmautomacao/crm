import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { clientes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

function uid() { return randomUUID().replace(/-/g, "").slice(0, 24); }

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select().from(clientes)
    .where(eq(clientes.tenantId, session.user.tenantId))
    .orderBy(clientes.nome);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const [created] = await db.insert(clientes).values({
    id: uid(),
    tenantId: session.user.tenantId,
    nome: body.nome,
    cpfCnpj: body.cpfCnpj || null,
    email: body.email || null,
    telefone: body.telefone || null,
    endereco: body.endereco || null,
    cidade: body.cidade || null,
    estado: body.estado || null,
    cep: body.cep || null,
    observacoes: body.observacoes || null,
    ativo: true,
  }).returning();

  return NextResponse.json(created, { status: 201 });
}
