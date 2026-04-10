"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ChecklistRun, RunItem } from "@/lib/types";
import { getRunStatus, getTimeRemaining } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

function formatCheckedAt(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  if (sameDay) return time;
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) + ", " + time;
}

interface RunDetailProps {
  initialRun: ChecklistRun;
}

export function RunDetail({ initialRun }: RunDetailProps) {
  const router = useRouter();
  const [run, setRun] = useState(initialRun);
  const [completing, setCompleting] = useState(false);
  const [, setTick] = useState(0);

  // Re-render every 30s to update the countdown
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(interval);
  }, []);

  const status = getRunStatus(run);
  const isEditable = status === "active" || status === "pending";
  const checked = run.items.filter((i) => i.checked).length;
  const total = run.items.length;
  const pct = total === 0 ? 0 : Math.round((checked / total) * 100);
  const timeRemaining = getTimeRemaining(run);

  const toggleItem = useCallback(
    async (item: RunItem) => {
      if (!isEditable) return;

      // Optimistic update
      setRun((prev) => ({
        ...prev,
        items: prev.items.map((i) =>
          i.id === item.id
            ? { ...i, checked: !i.checked, checkedAt: !i.checked ? new Date().toISOString() : undefined }
            : i
        ),
      }));

      const res = await fetch(`/api/runs/${run.id}/items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked: !item.checked }),
      });

      if (!res.ok) {
        // Revert on error
        setRun(initialRun);
      } else {
        const updated: ChecklistRun = await res.json();
        setRun(updated);
      }
    },
    [run.id, isEditable, initialRun]
  );

  async function completeRun() {
    setCompleting(true);
    const res = await fetch(`/api/runs/${run.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete" }),
    });
    if (res.ok) {
      const updated: ChecklistRun = await res.json();
      setRun(updated);
    }
    setCompleting(false);
  }

  async function deleteRun() {
    await fetch(`/api/runs/${run.id}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{run.templateName}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{checked}/{total} items</span>
            {status === "active" && timeRemaining && (
              <span className="flex items-center gap-1 text-amber-600">
                <Clock className="h-3.5 w-3.5" />
                {timeRemaining} left
              </span>
            )}
            {status === "pending" && (
              <span className="text-muted-foreground">Timer starts on first check</span>
            )}
            {status === "completed" && (
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="h-3 w-3" /> Completed
              </Badge>
            )}
            {status === "expired" && <Badge variant="muted">Expired</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          {isEditable && checked === total && total > 0 && (
            <Button size="sm" onClick={completeRun} disabled={completing}>
              <CheckCircle2 className="h-4 w-4" />
              {completing ? "Marking…" : "Mark complete"}
            </Button>
          )}
          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={deleteRun}>
            Delete
          </Button>
        </div>
      </div>

      {/* Progress */}
      <Progress value={pct} className="h-2" />

      {/* Items */}
      <ul className="space-y-1">
        {run.items
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((item) => (
            <li
              key={item.id}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-3 transition-colors",
                isEditable && "cursor-pointer hover:bg-muted/50",
                item.checked && "opacity-60"
              )}
              onClick={() => toggleItem(item)}
            >
              <Checkbox
                checked={item.checked}
                onCheckedChange={() => toggleItem(item)}
                disabled={!isEditable}
                onClick={(e) => e.stopPropagation()}
                className="shrink-0"
              />
              <span
                className={cn(
                  "text-sm leading-snug",
                  item.checked && "line-through text-muted-foreground"
                )}
              >
                {item.text}
              </span>
              {item.checked && item.checkedAt && (
                <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                  {formatCheckedAt(item.checkedAt)}
                </span>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}
