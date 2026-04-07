import { Redis } from "@upstash/redis";

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});
import type { ChecklistTemplate, ChecklistRun } from "./types";

const TEMPLATES_INDEX = "templates:index";
const RUNS_INDEX = "runs:index";

const templateKey = (id: string) => `template:${id}`;
const runKey = (id: string) => `run:${id}`;

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export async function getTemplates(): Promise<ChecklistTemplate[]> {
  const ids = (await kv.get<string[]>(TEMPLATES_INDEX)) ?? [];
  if (ids.length === 0) return [];
  const templates = await Promise.all(
    ids.map((id) => kv.get<ChecklistTemplate>(templateKey(id)))
  );
  return (templates.filter(Boolean) as ChecklistTemplate[]).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

export async function getTemplate(id: string): Promise<ChecklistTemplate | null> {
  return kv.get<ChecklistTemplate>(templateKey(id));
}

export async function saveTemplate(template: ChecklistTemplate): Promise<void> {
  const ids = (await kv.get<string[]>(TEMPLATES_INDEX)) ?? [];
  if (!ids.includes(template.id)) {
    await kv.set(TEMPLATES_INDEX, [...ids, template.id]);
  }
  await kv.set(templateKey(template.id), template);
}

export async function deleteTemplate(id: string): Promise<void> {
  const ids = (await kv.get<string[]>(TEMPLATES_INDEX)) ?? [];
  await kv.set(TEMPLATES_INDEX, ids.filter((i) => i !== id));
  await kv.del(templateKey(id));
}

// ---------------------------------------------------------------------------
// Runs
// ---------------------------------------------------------------------------

export async function getRuns(): Promise<ChecklistRun[]> {
  const ids = (await kv.get<string[]>(RUNS_INDEX)) ?? [];
  if (ids.length === 0) return [];
  const runs = await Promise.all(ids.map((id) => kv.get<ChecklistRun>(runKey(id))));
  return (runs.filter(Boolean) as ChecklistRun[]).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getRun(id: string): Promise<ChecklistRun | null> {
  return kv.get<ChecklistRun>(runKey(id));
}

export async function saveRun(run: ChecklistRun): Promise<void> {
  const ids = (await kv.get<string[]>(RUNS_INDEX)) ?? [];
  if (!ids.includes(run.id)) {
    await kv.set(RUNS_INDEX, [...ids, run.id]);
  }
  await kv.set(runKey(run.id), run);
}

export async function deleteRun(id: string): Promise<void> {
  const ids = (await kv.get<string[]>(RUNS_INDEX)) ?? [];
  await kv.set(RUNS_INDEX, ids.filter((i) => i !== id));
  await kv.del(runKey(id));
}
