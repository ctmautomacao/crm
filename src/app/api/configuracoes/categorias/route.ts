import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { categorias } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

function uid() { return randomUUID().replace(/-/g, "").slice(0, 24); }

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const [r] = await db.insert(categorias).values({ id: uid(), tenantId: session.user.tenantId, nome: body.nome }).returning();
  return NextResponse.json(r, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await db.delete(categorias).where(and(eq(categorias.id, id), eq(categorias.tenantId, session.user.tenantId)));
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, nome } = await req.json();
  const [r] = await db.update(categorias).set({ nome }).where(and(eq(categorias.id, id), eq(categorias.tenantId, session.user.tenantId))).returning();
  return NextResponse.json(r);
}
