import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { produtos, marcas, categorias, gruposProduto, produtosFornecedores, fornecedores, historicoPrecos } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [produto] = await db.select().from(produtos)
    .where(and(eq(produtos.id, params.id), eq(produtos.tenantId, session.user.tenantId)));

  if (!produto) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [marca, cat, grupo, pfRows, historico] = await Promise.all([
    produto.marcaId ? db.select().from(marcas).where(eq(marcas.id, produto.marcaId)).then(r => r[0]) : null,
    produto.categoriaId ? db.select().from(categorias).where(eq(categorias.id, produto.categoriaId)).then(r => r[0]) : null,
    produto.grupoId ? db.select().from(gruposProduto).where(eq(gruposProduto.id, produto.grupoId)).then(r => r[0]) : null,
    db.select().from(produtosFornecedores).where(eq(produtosFornecedores.produtoId, produto.id)),
    db.select().from(historicoPrecos).where(eq(historicoPrecos.produtoId, produto.id)).orderBy(historicoPrecos.vigenciaInicio),
  ]);

  const fornecedoresRows = await Promise.all(pfRows.map(async (pf) => {
    const [forn] = await db.select({ nome: fornecedores.nome }).from(fornecedores).where(eq(fornecedores.id, pf.fornecedorId));
    return { ...pf, fornecedor: forn };
  }));

  return NextResponse.json({ produto, marca, categoria: cat, grupo, fornecedores: fornecedoresRows, historico });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  const [updated] = await db.update(produtos).set({
    nome: body.nome,
    descricao: body.descricao,
    partNumber: body.partNumber,
    codigoBarras: body.codigoBarras,
    ncm: body.ncm,
    unidade: body.unidade,
    marcaId: body.marcaId || null,
    categoriaId: body.categoriaId || null,
    grupoId: body.grupoId || null,
    custoAtual: body.custoAtual ? String(body.custoAtual) : null,
    margemBrutaPadrao: body.margemBrutaPadrao ? String(body.margemBrutaPadrao) : "20",
    indicePadrao: body.indicePadrao ? String(body.indicePadrao) : "0",
    ativo: body.ativo ?? true,
    atualizadoEm: new Date(),
  })
    .where(and(eq(produtos.id, params.id), eq(produtos.tenantId, session.user.tenantId)))
    .returning();

  return NextResponse.json(updated);
}
