export type ExpiryConfig =
  | { type: "duration"; minutes: number }
  | { type: "end-of-day" };

export interface TemplateItem {
  id: string;
  text: string;
  order: number;
}

export interface ChecklistTemplate {
  id: string;
  name: string;
  description?: string;
  expiryConfig: ExpiryConfig;
  items: TemplateItem[];
  createdAt: string;
  updatedAt: string;
}

export interface RunItem {
  id: string;
  text: string;
  order: number;
  checked: boolean;
  checkedAt?: string;
}

export interface ChecklistRun {
  id: string;
  templateId: string;
  templateName: string;
  expiryConfig: ExpiryConfig;
  items: RunItem[];
  /** Set when first item is checked (duration-based expiry only) */
  startedAt?: string;
  /** Set at creation for end-of-day; set on first check for duration */
  expiresAt?: string;
  completedAt?: string;
  createdAt: string;
}

export interface UserProfile {
  displayName: string;
}

export type RunStatus = "pending" | "active" | "completed" | "expired";

export function getRunStatus(run: ChecklistRun): RunStatus {
  if (run.completedAt) return "completed";
  if (run.expiresAt && new Date(run.expiresAt) < new Date()) return "expired";
  if (!run.startedAt && run.expiryConfig.type === "duration") return "pending";
  return "active";
}

export function getTimeRemaining(run: ChecklistRun): string | null {
  if (!run.expiresAt) return null;
  const diff = new Date(run.expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function describeExpiry(config: ExpiryConfig): string {
  if (config.type === "end-of-day") return "Expires end of day";
  const h = Math.floor(config.minutes / 60);
  const m = config.minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m after first check`;
  if (h > 0) return `${h}h after first check`;
  return `${m}m after first check`;
}
