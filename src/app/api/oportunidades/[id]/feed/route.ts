import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { feedLeads, oportunidades, leads } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";

function uid() { return randomUUID().replace(/-/g, "").slice(0, 24); }

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [oportunidade] = await db.select().from(oportunidades)
    .where(and(eq(oportunidades.id, params.id), eq(oportunidades.tenantId, session.user.tenantId)));

  if (!oportunidade) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Find associated lead
  const [lead] = await db.select().from(leads)
    .where(and(eq(leads.oportunidadeId, oportunidade.id), eq(leads.tenantId, session.user.tenantId)));

  const body = await req.json();

  const [entry] = await db.insert(feedLeads).values({
    id: uid(),
    tenantId: session.user.tenantId,
    leadId: lead?.id || oportunidade.id, // fallback
    oportunidadeId: oportunidade.id,
    tipo: body.tipo || "OBSERVACAO",
    texto: body.texto,
    autorId: session.user.id || null,
  }).returning();

  return NextResponse.json(entry, { status: 201 });
}
