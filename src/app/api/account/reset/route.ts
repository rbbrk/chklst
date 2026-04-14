import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { softDeleteAllRuns, softDeleteAllTemplates } from "@/lib/kv";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mode } = await req.json();

  if (mode === "runs") {
    const count = await softDeleteAllRuns();
    return NextResponse.json({ deleted: { runs: count } });
  }

  if (mode === "all") {
    const [runs, templates] = await Promise.all([
      softDeleteAllRuns(),
      softDeleteAllTemplates(),
    ]);
    return NextResponse.json({ deleted: { runs, templates } });
  }

  return NextResponse.json({ error: "Invalid mode. Use 'runs' or 'all'." }, { status: 400 });
}
