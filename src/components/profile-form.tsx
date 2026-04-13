"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProfileFormProps {
  initialName: string;
  initialShowShortcuts: "always" | "modal";
}

export function ProfileForm({ initialName, initialShowShortcuts }: ProfileFormProps) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialName);
  const [showShortcuts, setShowShortcuts] = useState(initialShowShortcuts);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);

    const trimmed = displayName.trim();
    if (!trimmed) {
      setError("Name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: trimmed, showShortcuts }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSaved(true);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="displayName">Preferred name</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
            setSaved(false);
          }}
          placeholder="e.g. Rob"
        />
        <p className="text-xs text-muted-foreground">
          This is how the app will address you.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="showShortcuts">Keyboard shortcut badges</Label>
        <Select
          value={showShortcuts}
          onValueChange={(v) => {
            setShowShortcuts(v as "always" | "modal");
            setSaved(false);
          }}
        >
          <SelectTrigger id="showShortcuts">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="always">Always visible</SelectItem>
            <SelectItem value="modal">Only in shortcut modal</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Choose whether shortcut badges appear next to buttons, or only when
          you press {"\u2318"}/.
        </p>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
        {saved && (
          <span className="text-sm text-muted-foreground">Saved!</span>
        )}
      </div>
    </form>
  );
}
