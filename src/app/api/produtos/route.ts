import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { produtos, marcas, categorias, gruposProduto } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

function uid() { return randomUUID().replace(/-/g, "").slice(0, 24); }

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select().from(produtos)
    .where(eq(produtos.tenantId, session.user.tenantId)).orderBy(produtos.nome);

  const result = await Promise.all(rows.map(async (p) => {
    const [marca, cat, grupo] = await Promise.all([
      p.marcaId ? db.select({ nome: marcas.nome }).from(marcas).where(eq(marcas.id, p.marcaId)).then(r => r[0]) : null,
      p.categoriaId ? db.select({ nome: categorias.nome }).from(categorias).where(eq(categorias.id, p.categoriaId)).then(r => r[0]) : null,
      p.grupoId ? db.select({ nome: gruposProduto.nome }).from(gruposProduto).where(eq(gruposProduto.id, p.grupoId)).then(r => r[0]) : null,
    ]);
    return { ...p, marca, categoria: cat, grupo };
  }));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  const [created] = await db.insert(produtos).values({
    id: uid(),
    tenantId: session.user.tenantId,
    nome: body.nome,
    descricao: body.descricao || null,
    partNumber: body.partNumber || null,
    codigoBarras: body.codigoBarras || null,
    ncm: body.ncm || null,
    unidade: body.unidade || "UN",
    marcaId: body.marcaId || null,
    categoriaId: body.categoriaId || null,
    grupoId: body.grupoId || null,
    custoAtual: body.custoAtual ? String(body.custoAtual) : null,
    margemBrutaPadrao: body.margemBrutaPadrao ? String(body.margemBrutaPadrao) : "20",
    indicePadrao: body.indicePadrao ? String(body.indicePadrao) : "0",
    ativo: true,
  }).returning();

  return NextResponse.json(created, { status: 201 });
}
