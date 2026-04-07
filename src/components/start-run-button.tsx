"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export function StartRunButton({ templateId }: { templateId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function start() {
    setLoading(true);
    const res = await fetch("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId }),
    });
    if (res.ok) {
      const run = await res.json();
      router.push(`/runs/${run.id}`);
      router.refresh();
    } else {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" onClick={start} disabled={loading}>
      <Play className="h-3.5 w-3.5" />
      {loading ? "Starting…" : "Start run"}
    </Button>
  );
}
