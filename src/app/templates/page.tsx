import Link from "next/link";
import { getTemplates } from "@/lib/kv";
import { describeExpiry } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { DeleteTemplateButton } from "@/components/delete-template-button";
import { Plus, Pencil } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Templates</h1>
        <Button asChild size="sm">
          <Link href="/templates/new">
            <Plus className="h-4 w-4" />
            New template
          </Link>
        </Button>
      </div>

      {templates.length === 0 ? (
        <p className="rounded-xl border border-dashed px-6 py-16 text-center text-sm text-muted-foreground">
          No templates yet.{" "}
          <Link href="/templates/new" className="underline underline-offset-2">
            Create your first one.
          </Link>
        </p>
      ) : (
        <ul className="space-y-3">
          {templates.map((t) => (
            <li key={t.id} className="rounded-xl border bg-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h2 className="font-medium">{t.name}</h2>
                  {t.description && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{t.description}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.items.length} item{t.items.length !== 1 ? "s" : ""} ·{" "}
                    {describeExpiry(t.expiryConfig)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/templates/${t.id}/edit`}>
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </Button>
                  <DeleteTemplateButton templateId={t.id} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
