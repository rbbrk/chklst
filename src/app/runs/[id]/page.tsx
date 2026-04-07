import { notFound } from "next/navigation";
import Link from "next/link";
import { getRun } from "@/lib/kv";
import { RunDetail } from "@/components/run-detail";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RunPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = await getRun(id);
  if (!run) notFound();

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" asChild>
        <Link href="/">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>
      </Button>
      <RunDetail initialRun={run} />
    </div>
  );
}
