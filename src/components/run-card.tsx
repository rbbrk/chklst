import Link from "next/link";
import { ChecklistRun, getRunStatus, getTimeRemaining, describeExpiry } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

interface RunCardProps {
  run: ChecklistRun;
}

export function RunCard({ run }: RunCardProps) {
  const status = getRunStatus(run);
  const checked = run.items.filter((i) => i.checked).length;
  const total = run.items.length;
  const pct = total === 0 ? 0 : Math.round((checked / total) * 100);
  const timeRemaining = getTimeRemaining(run);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-medium">{run.templateName}</h3>
              <StatusBadge status={status} />
            </div>
            <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
              <span>
                {checked}/{total} items
              </span>
              {status === "active" && timeRemaining && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {timeRemaining}
                </span>
              )}
              {status === "pending" && (
                <span className="text-amber-600">{describeExpiry(run.expiryConfig)}</span>
              )}
            </div>
            {total > 0 && <Progress value={pct} className="mt-3" />}
          </div>
          <Button asChild size="sm" variant={status === "active" || status === "pending" ? "default" : "outline"}>
            <Link href={`/runs/${run.id}`}>
              {status === "active" || status === "pending" ? "Continue" : "View"}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: ReturnType<typeof getRunStatus> }) {
  if (status === "active")
    return (
      <Badge variant="success" className="gap-1">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Active
      </Badge>
    );
  if (status === "pending")
    return <Badge variant="warning">Pending</Badge>;
  if (status === "completed")
    return (
      <Badge variant="muted" className="gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Done
      </Badge>
    );
  return (
    <Badge variant="muted" className="gap-1">
      <XCircle className="h-3 w-3" />
      Expired
    </Badge>
  );
}
