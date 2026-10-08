import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { feedLeads } from "@/db/schema";
import { randomUUID } from "crypto";

function uid() {
  return randomUUID().replace(/-/g, "").slice(0, 24);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const [entry] = await db.insert(feedLeads).values({
    id: uid(),
    tenantId: session.user.tenantId,
    leadId: params.id,
    oportunidadeId: body.oportunidadeId,
    vendedorId: session.user.id!,
    texto: body.texto,
    tipo: body.tipo || "ANOTACAO",
  }).returning();

  return NextResponse.json(entry, { status: 201 });
}
