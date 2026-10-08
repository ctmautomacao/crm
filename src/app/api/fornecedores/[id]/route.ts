import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { fornecedores, produtosFornecedores, produtos } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [fornecedor] = await db.select().from(fornecedores)
    .where(and(eq(fornecedores.id, params.id), eq(fornecedores.tenantId, session.user.tenantId)));

  if (!fornecedor) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const pfRows = await db.select().from(produtosFornecedores).where(eq(produtosFornecedores.fornecedorId, fornecedor.id));
  const produtosRows = await Promise.all(pfRows.map(async (pf) => {
    const [prod] = await db.select({ id: produtos.id, nome: produtos.nome, partNumber: produtos.partNumber })
      .from(produtos).where(eq(produtos.id, pf.produtoId));
    return { ...pf, produto: prod };
  }));

  return NextResponse.json({ fornecedor, produtos: produtosRows });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const [updated] = await db.update(fornecedores).set({
    nome: body.nome, cnpj: body.cnpj, email: body.email, telefone: body.telefone,
    contato: body.contato, observacoes: body.observacoes, ativo: body.ativo ?? true, atualizadoEm: new Date(),
  }).where(and(eq(fornecedores.id, params.id), eq(fornecedores.tenantId, session.user.tenantId))).returning();
  return NextResponse.json(updated);
}
