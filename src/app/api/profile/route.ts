import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getProfile, saveProfile } from "@/lib/kv";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getProfile();
  return NextResponse.json(profile);
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const existing = await getProfile();

  const displayName = typeof body.displayName === "string"
    ? body.displayName.trim()
    : existing?.displayName ?? "";

  if (!displayName) {
    return NextResponse.json({ error: "displayName is required" }, { status: 400 });
  }

  const showShortcuts = body.showShortcuts === "modal" ? "modal" as const : "always" as const;

  const profile = { displayName, showShortcuts };
  await saveProfile(profile);
  return NextResponse.json(profile);
}
