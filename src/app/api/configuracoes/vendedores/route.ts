import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { vendedores } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

function uid() { return randomUUID().replace(/-/g, "").slice(0, 24); }

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.perfil !== "GERENTE") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const rows = await db.select({
    id: vendedores.id,
    nome: vendedores.nome,
    email: vendedores.email,
    perfil: vendedores.perfil,
    comissaoPct: vendedores.comissaoPct,
    ativo: vendedores.ativo,
    sistema: vendedores.sistema,
  }).from(vendedores).where(eq(vendedores.tenantId, session.user.tenantId)).orderBy(vendedores.nome);

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.perfil !== "GERENTE") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const hash = await bcrypt.hash(body.senha || "senha123", 10);

  const [created] = await db.insert(vendedores).values({
    id: uid(),
    tenantId: session.user.tenantId,
    nome: body.nome,
    email: body.email,
    senhaHash: hash,
    perfil: body.perfil || "VENDEDOR",
    comissaoPct: body.comissaoPct ? Number(body.comissaoPct) : 0,
    ativo: true,
    sistema: false,
  }).returning();

  return NextResponse.json(created, { status: 201 });
}
