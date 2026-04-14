"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type ResetMode = "runs" | "all";

export function AccountReset() {
  const router = useRouter();
  const [confirming, setConfirming] = useState<ResetMode | null>(null);
  const [resetting, setResetting] = useState(false);
  const [result, setResult] = useState("");

  async function handleReset(mode: ResetMode) {
    setResetting(true);
    setResult("");
    try {
      const res = await fetch("/api/account/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      if (!res.ok) throw new Error("Reset failed");
      const data = await res.json();
      const parts: string[] = [];
      if (data.deleted.runs !== undefined) parts.push(`${data.deleted.runs} run(s)`);
      if (data.deleted.templates !== undefined) parts.push(`${data.deleted.templates} template(s)`);
      setResult(`Deleted ${parts.join(" and ")}.`);
      setConfirming(null);
      router.refresh();
    } catch {
      setResult("Something went wrong. Please try again.");
    } finally {
      setResetting(false);
    }
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-red-800">Danger zone</h2>
        <p className="mt-1 text-xs text-red-600">
          These actions cannot be undone from the UI.
        </p>
      </div>

      <div className="space-y-3">
        {/* Reset Runs */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-red-800">Reset runs</p>
            <p className="text-xs text-red-600">
              Deletes all runs but keeps your templates.
            </p>
          </div>
          {confirming === "runs" ? (
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="destructive"
                disabled={resetting}
                onClick={() => handleReset("runs")}
              >
                {resetting ? "Deleting..." : "Confirm"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={resetting}
                onClick={() => setConfirming(null)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800"
              onClick={() => { setConfirming("runs"); setResult(""); }}
            >
              Reset runs
            </Button>
          )}
        </div>

        {/* Reset Everything */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-red-800">Reset entire account</p>
            <p className="text-xs text-red-600">
              Deletes all templates and all runs.
            </p>
          </div>
          {confirming === "all" ? (
            <div className="flex gap-2 shrink-0">
              <Button
                size="sm"
                variant="destructive"
                disabled={resetting}
                onClick={() => handleReset("all")}
              >
                {resetting ? "Deleting..." : "Confirm"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={resetting}
                onClick={() => setConfirming(null)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="shrink-0 border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800"
              onClick={() => { setConfirming("all"); setResult(""); }}
            >
              Reset account
            </Button>
          )}
        </div>
      </div>

      {result && (
        <p className="text-xs text-red-700">{result}</p>
      )}
    </div>
  );
}
