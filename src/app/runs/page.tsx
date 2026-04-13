"use client";

import { useEffect, useState } from "react";
import { ChecklistRun, getRunStatus, RunStatus } from "@/lib/types";
import { RunCard } from "@/components/run-card";
import { Button } from "@/components/ui/button";

const FILTERS: { label: string; value: RunStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Active", value: "active" },
  { label: "Pending", value: "pending" },
  { label: "Completed", value: "completed" },
  { label: "Expired", value: "expired" },
  { label: "Abandoned", value: "abandoned" },
];

export default function RunsPage() {
  const [runs, setRuns] = useState<ChecklistRun[]>([]);
  const [filter, setFilter] = useState<RunStatus | "all">("all");

  useEffect(() => {
    fetch("/api/runs")
      .then((r) => r.json())
      .then(setRuns);
  }, []);

  const filtered =
    filter === "all" ? runs : runs.filter((r) => getRunStatus(r) === filter);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Run history</h1>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
          No runs found.
        </p>
      ) : (
        <ul className="space-y-3">
          {filtered.map((run) => (
            <li key={run.id}>
              <RunCard run={run} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
