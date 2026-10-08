import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { pedidos, clientes, vendedores, propostas, parcelas } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

function uid() { return randomUUID().replace(/-/g, "").slice(0, 24); }

async function gerarNumero(tenantId: string) {
  const ano = new Date().getFullYear();
  const rows = await db.select({ numero: pedidos.numero }).from(pedidos).where(eq(pedidos.tenantId, tenantId));
  const max = rows.reduce((acc, r) => {
    const n = parseInt(r.numero?.split("-")[1] || "0");
    return n > acc ? n : acc;
  }, 0);
  return `PED${ano}-${String(max + 1).padStart(4, "0")}`;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantId = session.user.tenantId;
  const isGerente = session.user.perfil === "GERENTE";

  const where = isGerente
    ? eq(pedidos.tenantId, tenantId)
    : and(eq(pedidos.tenantId, tenantId), eq(pedidos.vendedorId, session.user.id!));

  const rows = await db.select().from(pedidos).where(where as any).orderBy(pedidos.criadoEm);

  const result = await Promise.all(rows.map(async (p) => {
    const [cli, vend, prop] = await Promise.all([
      p.clienteId ? db.select({ id: clientes.id, nome: clientes.nome }).from(clientes).where(eq(clientes.id, p.clienteId)).then(r => r[0]) : null,
      p.vendedorId ? db.select({ nome: vendedores.nome }).from(vendedores).where(eq(vendedores.id, p.vendedorId)).then(r => r[0]) : null,
      p.propostaId ? db.select({ numero: propostas.numero }).from(propostas).where(eq(propostas.id, p.propostaId)).then(r => r[0]) : null,
    ]);
    return { pedido: p, cliente: cli, vendedor: vend, proposta: prop };
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const tenantId = session.user.tenantId;
  const numero = await gerarNumero(tenantId);

  const [created] = await db.insert(pedidos).values({
    id: uid(),
    tenantId,
    numero,
    propostaId: body.propostaId || null,
    clienteId: body.clienteId || null,
    vendedorId: body.vendedorId || session.user.id || null,
    status: "AGUARDANDO",
    valorTotal: String(body.valorTotal || 0),
    observacoes: body.observacoes || null,
  }).returning();

  // Create parcelas if provided
  if (body.parcelas && body.parcelas.length > 0) {
    for (const parc of body.parcelas) {
      await db.insert(parcelas).values({
        id: uid(),
        tenantId,
        pedidoId: created.id,
        numero: parc.numero,
        valor: String(parc.valor),
        vencimento: new Date(parc.vencimento),
        status: "PENDENTE",
      });
    }
  }

  return NextResponse.json(created, { status: 201 });
}
