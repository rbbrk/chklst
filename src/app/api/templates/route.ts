import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTemplates, saveTemplate } from "@/lib/kv";
import { generateId } from "@/lib/utils";
import type { ChecklistTemplate } from "@/lib/types";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const templates = await getTemplates();
  return NextResponse.json(templates);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const now = new Date().toISOString();

  const template: ChecklistTemplate = {
    id: generateId(),
    name: body.name,
    description: body.description,
    expiryConfig: body.expiryConfig,
    supplies: Array.isArray(body.supplies) ? body.supplies : undefined,
    items: (body.items ?? []).map((item: { id: string; text: string }, i: number) => ({
      id: item.id ?? generateId(),
      text: item.text,
      order: i,
    })),
    createdAt: now,
    updatedAt: now,
  };

  await saveTemplate(template);
  return NextResponse.json(template, { status: 201 });
}
