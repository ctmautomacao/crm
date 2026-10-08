import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import {
  origensLead, campanhas, indicadores, tiposOportunidade, statusOportunidade,
  motivosEncerramento, formasPagamento, marcas, categorias, gruposProduto,
  vendedores
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tid = session.user.tenantId;

  const [
    origens, campanhasArr, indicadoresArr, tipos, status, motivos,
    formas, marcasArr, categoriasArr, grupos, vendedoresArr
  ] = await Promise.all([
    db.select().from(origensLead).where(eq(origensLead.tenantId, tid)),
    db.select().from(campanhas).where(eq(campanhas.tenantId, tid)),
    db.select().from(indicadores).where(eq(indicadores.tenantId, tid)),
    db.select().from(tiposOportunidade).where(eq(tiposOportunidade.tenantId, tid)),
    db.select().from(statusOportunidade).where(eq(statusOportunidade.tenantId, tid)),
    db.select().from(motivosEncerramento).where(eq(motivosEncerramento.tenantId, tid)),
    db.select().from(formasPagamento).where(eq(formasPagamento.tenantId, tid)),
    db.select().from(marcas).where(eq(marcas.tenantId, tid)),
    db.select().from(categorias).where(eq(categorias.tenantId, tid)),
    db.select().from(gruposProduto).where(eq(gruposProduto.tenantId, tid)),
    db.select({ id: vendedores.id, nome: vendedores.nome, email: vendedores.email, perfil: vendedores.perfil, ativo: vendedores.ativo, sistema: vendedores.sistema, codigoVendedor: vendedores.codigoVendedor })
      .from(vendedores).where(eq(vendedores.tenantId, tid)),
  ]);

  return NextResponse.json({
    origens, campanhas: campanhasArr, indicadores: indicadoresArr, tipos, status, motivos,
    formas, marcas: marcasArr, categorias: categoriasArr, grupos, vendedores: vendedoresArr,
  });
}
