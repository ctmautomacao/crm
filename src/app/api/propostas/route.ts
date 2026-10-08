import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { propostas, oportunidades, clientes, vendedores } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

function uid() { return randomUUID().replace(/-/g, "").slice(0, 24); }

async function gerarNumero(tenantId: string) {
  const ano = new Date().getFullYear();
  const rows = await db.select({ numero: propostas.numero }).from(propostas)
    .where(eq(propostas.tenantId, tenantId));
  const max = rows.reduce((acc, r) => {
    const n = parseInt(r.numero?.split("-")[1] || "0");
    return n > acc ? n : acc;
  }, 0);
  return `P${ano}-${String(max + 1).padStart(4, "0")}`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = session.user.tenantId;
  const isGerente = session.user.perfil === "GERENTE";

  const where = isGerente
    ? eq(propostas.tenantId, tenantId)
    : and(eq(propostas.tenantId, tenantId), eq(propostas.vendedorId, session.user.id!));

  const rows = await db.select().from(propostas).where(where as any).orderBy(propostas.criadoEm);

  const result = await Promise.all(rows.map(async (p) => {
    const [cli, vend, opor] = await Promise.all([
      p.clienteId ? db.select({ id: clientes.id, nome: clientes.nome }).from(clientes).where(eq(clientes.id, p.clienteId)).then(r => r[0]) : null,
      p.vendedorId ? db.select({ nome: vendedores.nome }).from(vendedores).where(eq(vendedores.id, p.vendedorId)).then(r => r[0]) : null,
      p.oportunidadeId ? db.select({ titulo: oportunidades.titulo }).from(oportunidades).where(eq(oportunidades.id, p.oportunidadeId)).then(r => r[0]) : null,
    ]);
    return { proposta: p, cliente: cli, vendedor: vend, oportunidade: opor };
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const tenantId = session.user.tenantId;
  const numero = await gerarNumero(tenantId);

  const [created] = await db.insert(propostas).values({
    id: uid(),
    tenantId,
    numero,
    oportunidadeId: body.oportunidadeId || null,
    clienteId: body.clienteId || null,
    vendedorId: body.vendedorId || session.user.id || null,
    status: "RASCUNHO",
    validadeAte: body.validadeAte ? new Date(body.validadeAte) : null,
    observacoes: body.observacoes || null,
    valorTotal: "0",
  }).returning();

  return NextResponse.json(created, { status: 201 });
}
