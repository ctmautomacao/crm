import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { campanhas } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

function uid() { return randomUUID().replace(/-/g, "").slice(0, 24); }

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const [r] = await db.insert(campanhas).values({ id: uid(), tenantId: session.user.tenantId, nome: body.nome }).returning();
  return NextResponse.json(r, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await db.delete(campanhas).where(and(eq(campanhas.id, id), eq(campanhas.tenantId, session.user.tenantId)));
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, nome } = await req.json();
  const [r] = await db.update(campanhas).set({ nome }).where(and(eq(campanhas.id, id), eq(campanhas.tenantId, session.user.tenantId))).returning();
  return NextResponse.json(r);
}
