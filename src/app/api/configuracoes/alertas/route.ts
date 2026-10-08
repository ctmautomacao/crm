import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { configuracoesAlerta } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

function uid() {
  return randomUUID().replace(/-/g, "").slice(0, 24);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const rows = await db.select().from(configuracoesAlerta)
    .where(eq(configuracoesAlerta.tenantId, session.user.tenantId));

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.perfil !== "GERENTE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const tenantId = session.user.tenantId;

  // upsert
  const existing = await db.select().from(configuracoesAlerta)
    .where(and(
      eq(configuracoesAlerta.tenantId, tenantId),
      eq(configuracoesAlerta.entidade, body.entidade),
      eq(configuracoesAlerta.nivel, body.nivel),
    ));

  if (existing.length > 0) {
    const [updated] = await db.update(configuracoesAlerta)
      .set({ dias: body.dias, cor: body.cor, ativo: body.ativo ?? true })
      .where(eq(configuracoesAlerta.id, existing[0].id))
      .returning();
    return NextResponse.json(updated);
  }

  const [created] = await db.insert(configuracoesAlerta).values({
    id: uid(),
    tenantId,
    entidade: body.entidade,
    nivel: body.nivel,
    dias: body.dias,
    cor: body.cor,
    ativo: body.ativo ?? true,
  }).returning();

  return NextResponse.json(created, { status: 201 });
}
