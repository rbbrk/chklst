import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRuns, saveRun, getTemplate } from "@/lib/kv";
import { generateId, endOfDay } from "@/lib/utils";
import type { ChecklistRun } from "@/lib/types";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const runs = await getRuns();
  return NextResponse.json(runs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { templateId } = await req.json();
  const template = await getTemplate(templateId);
  if (!template) return NextResponse.json({ error: "Template not found" }, { status: 404 });

  const now = new Date().toISOString();

  const run: ChecklistRun = {
    id: generateId(),
    templateId: template.id,
    templateName: template.name,
    expiryConfig: template.expiryConfig,
    supplies: template.supplies,
    items: template.items.map((item) => ({
      id: generateId(),
      text: item.text,
      order: item.order,
      checked: false,
    })),
    // For end-of-day, set expiresAt immediately; for duration, defer until first check
    expiresAt:
      template.expiryConfig.type === "end-of-day" ? endOfDay().toISOString() : undefined,
    createdAt: now,
  };

  await saveRun(run);
  return NextResponse.json(run, { status: 201 });
}
