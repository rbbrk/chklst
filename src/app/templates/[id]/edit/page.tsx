import { notFound } from "next/navigation";
import { getTemplate } from "@/lib/kv";
import { TemplateForm } from "@/components/template-form";

export const dynamic = "force-dynamic";

export default async function EditTemplatePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const template = await getTemplate(id);
  if (!template) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit template</h1>
      <TemplateForm initial={template} />
    </div>
  );
}
