import Link from "next/link";
import { auth } from "@/auth";
import { getRuns, getTemplates } from "@/lib/kv";
import { getRunStatus } from "@/lib/types";
import { RunCard } from "@/components/run-card";
import { Button } from "@/components/ui/button";
import { StartRunButton } from "@/components/start-run-button";
import { Separator } from "@/components/ui/separator";
import { CheckSquare, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <CheckSquare className="h-12 w-12 mb-4" />
        <h1 className="text-3xl font-bold tracking-tight mb-2">chklst</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">
          A simple daily checklist app. Create templates, run them each day, and
          stay on top of what matters.
        </p>
        <Button asChild>
          <Link href="/api/auth/signin">Sign in</Link>
        </Button>
      </div>
    );
  }

  const [runs, templates] = await Promise.all([getRuns(), getTemplates()]);

  const activeRuns = runs.filter((r) => {
    const s = getRunStatus(r);
    return s === "active" || s === "pending";
  });

  return (
    <div className="space-y-8">
      {/* Active runs */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Active runs</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/runs">History</Link>
          </Button>
        </div>
        {activeRuns.length === 0 ? (
          <p className="rounded-xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
            No active runs. Start one from a template below.
          </p>
        ) : (
          <ul className="space-y-3">
            {activeRuns.map((run) => (
              <li key={run.id}>
                <RunCard run={run} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <Separator />

      {/* Templates */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Templates</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href="/templates">
              <Plus className="h-4 w-4" />
              Manage
            </Link>
          </Button>
        </div>
        {templates.length === 0 ? (
          <p className="rounded-xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
            No templates yet.{" "}
            <Link href="/templates/new" className="underline underline-offset-2">
              Create one
            </Link>{" "}
            to get started.
          </p>
        ) : (
          <ul className="space-y-2">
            {templates.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between rounded-lg border bg-card px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.items.length} item{t.items.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <StartRunButton templateId={t.id} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
