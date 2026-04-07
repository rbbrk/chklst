import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getRun, saveRun } from "@/lib/kv";
import { getRunStatus } from "@/lib/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, itemId } = await params;
  const run = await getRun(id);
  if (!run) return NextResponse.json({ error: "Run not found" }, { status: 404 });

  const status = getRunStatus(run);
  if (status !== "active" && status !== "pending") {
    return NextResponse.json({ error: "Run is not editable" }, { status: 409 });
  }

  const { checked } = await req.json();
  const now = new Date();

  const itemIdx = run.items.findIndex((i) => i.id === itemId);
  if (itemIdx === -1) return NextResponse.json({ error: "Item not found" }, { status: 404 });

  run.items[itemIdx] = {
    ...run.items[itemIdx],
    checked,
    checkedAt: checked ? now.toISOString() : undefined,
  };

  // On first check of a duration-based run, start the timer
  if (checked && !run.startedAt && run.expiryConfig.type === "duration") {
    run.startedAt = now.toISOString();
    run.expiresAt = new Date(
      now.getTime() + run.expiryConfig.minutes * 60_000
    ).toISOString();
  }

  // Auto-complete when all items are checked
  const allChecked = run.items.every((i) => i.checked);
  if (allChecked && !run.completedAt) {
    run.completedAt = now.toISOString();
  } else if (!allChecked && run.completedAt) {
    run.completedAt = undefined;
  }

  await saveRun(run);
  return NextResponse.json(run);
}
