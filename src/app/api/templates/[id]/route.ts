import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTemplate, saveTemplate, deleteTemplate } from "@/lib/kv";
import type { ChecklistTemplate } from "@/lib/types";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const template = await getTemplate(id);
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(template);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await getTemplate(id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const updated: ChecklistTemplate = {
    ...existing,
    name: body.name ?? existing.name,
    description: body.description ?? existing.description,
    expiryConfig: body.expiryConfig ?? existing.expiryConfig,
    items: body.items ?? existing.items,
    updatedAt: new Date().toISOString(),
  };

  await saveTemplate(updated);
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await deleteTemplate(id);
  return new NextResponse(null, { status: 204 });
}
