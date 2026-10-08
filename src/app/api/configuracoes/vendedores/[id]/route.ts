import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { vendedores } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.perfil !== "GERENTE") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const updateData: any = {
    nome: body.nome,
    email: body.email,
    perfil: body.perfil,
    comissaoPct: body.comissaoPct ? Number(body.comissaoPct) : 0,
    ativo: body.ativo ?? true,
    atualizadoEm: new Date(),
  };

  if (body.senha) {
    updateData.senhaHash = await bcrypt.hash(body.senha, 10);
  }

  const [updated] = await db.update(vendedores).set(updateData)
    .where(and(eq(vendedores.id, params.id), eq(vendedores.tenantId, session.user.tenantId)))
    .returning();

  return NextResponse.json(updated);
}
