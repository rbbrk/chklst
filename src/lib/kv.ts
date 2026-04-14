import { Redis } from "@upstash/redis";

const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});
import type { ChecklistTemplate, ChecklistRun, UserProfile } from "./types";

const PROFILE_KEY = "profile";

const TEMPLATES_INDEX = "templates:index";
const RUNS_INDEX = "runs:index";

const templateKey = (id: string) => `template:${id}`;
const runKey = (id: string) => `run:${id}`;

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export async function getProfile(): Promise<UserProfile | null> {
  return kv.get<UserProfile>(PROFILE_KEY);
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await kv.set(PROFILE_KEY, profile);
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export async function getTemplates(): Promise<ChecklistTemplate[]> {
  const ids = (await kv.get<string[]>(TEMPLATES_INDEX)) ?? [];
  if (ids.length === 0) return [];
  const templates = await Promise.all(
    ids.map((id) => kv.get<ChecklistTemplate>(templateKey(id)))
  );
  return (templates.filter(Boolean) as ChecklistTemplate[])
    .filter((t) => !t.deletedAt)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
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
  return (runs.filter(Boolean) as ChecklistRun[])
    .filter((r) => !r.deletedAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

// ---------------------------------------------------------------------------
// Bulk soft-delete
// ---------------------------------------------------------------------------

export async function softDeleteAllRuns(): Promise<number> {
  const ids = (await kv.get<string[]>(RUNS_INDEX)) ?? [];
  if (ids.length === 0) return 0;
  const now = new Date().toISOString();
  const runs = await Promise.all(ids.map((id) => kv.get<ChecklistRun>(runKey(id))));
  let count = 0;
  await Promise.all(
    runs.map((run) => {
      if (run && !run.deletedAt) {
        count++;
        return kv.set(runKey(run.id), { ...run, deletedAt: now });
      }
    })
  );
  return count;
}

export async function softDeleteAllTemplates(): Promise<number> {
  const ids = (await kv.get<string[]>(TEMPLATES_INDEX)) ?? [];
  if (ids.length === 0) return 0;
  const now = new Date().toISOString();
  const templates = await Promise.all(ids.map((id) => kv.get<ChecklistTemplate>(templateKey(id))));
  let count = 0;
  await Promise.all(
    templates.map((tpl) => {
      if (tpl && !tpl.deletedAt) {
        count++;
        return kv.set(templateKey(tpl.id), { ...tpl, deletedAt: now });
      }
    })
  );
  return count;
}
