import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { formasPagamento } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

function uid() { return randomUUID().replace(/-/g, "").slice(0, 24); }

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const [r] = await db.insert(formasPagamento).values({ id: uid(), tenantId: session.user.tenantId, nome: body.nome }).returning();
  return NextResponse.json(r, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await db.delete(formasPagamento).where(and(eq(formasPagamento.id, id), eq(formasPagamento.tenantId, session.user.tenantId)));
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, nome } = await req.json();
  const [r] = await db.update(formasPagamento).set({ nome }).where(and(eq(formasPagamento.id, id), eq(formasPagamento.tenantId, session.user.tenantId))).returning();
  return NextResponse.json(r);
}
