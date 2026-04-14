"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ChecklistTemplate, ExpiryConfig, TemplateItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";

interface TemplateFormProps {
  initial?: ChecklistTemplate;
}

export function TemplateForm({ initial }: TemplateFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [expiryType, setExpiryType] = useState<"duration" | "end-of-day">(
    initial?.expiryConfig.type ?? "duration"
  );
  const [expiryMinutes, setExpiryMinutes] = useState(
    initial?.expiryConfig.type === "duration" ? String(initial.expiryConfig.minutes) : "60"
  );
  const [supplies, setSupplies] = useState<string[]>(initial?.supplies ?? []);
  const [newSupply, setNewSupply] = useState("");
  const [items, setItems] = useState<TemplateItem[]>(initial?.items ?? []);
  const [newItemText, setNewItemText] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function addItem() {
    const text = newItemText.trim();
    if (!text) return;
    setItems((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2), text, order: prev.length },
    ]);
    setNewItemText("");
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function moveItem(id: string, direction: "up" | "down") {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= next.length) return prev;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next.map((item, i) => ({ ...item, order: i }));
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Name is required"); return; }
    if (items.length === 0) { setError("Add at least one item"); return; }

    const expiryConfig: ExpiryConfig =
      expiryType === "end-of-day"
        ? { type: "end-of-day" }
        : { type: "duration", minutes: parseInt(expiryMinutes, 10) || 60 };

    setSaving(true);
    setError("");

    try {
      const url = initial ? `/api/templates/${initial.id}` : "/api/templates";
      const method = initial ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), description: description.trim(), expiryConfig, supplies, items }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push("/templates");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Morning standup"
          autoFocus
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <Label htmlFor="description">Description <span className="text-muted-foreground font-normal">(optional)</span></Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this checklist for?"
          rows={2}
        />
      </div>

      {/* Expiry */}
      <fieldset className="space-y-3">
        <Label asChild><legend>Expiry</legend></Label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="expiryType"
              value="duration"
              checked={expiryType === "duration"}
              onChange={() => setExpiryType("duration")}
              className="accent-primary"
            />
            Duration (timer)
          </label>
          {expiryType === "duration" && (
            <div className="ml-6 flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max="1440"
                value={expiryMinutes}
                onChange={(e) => setExpiryMinutes(e.target.value)}
                className="w-24"
              />
              <span className="text-sm text-muted-foreground">minutes</span>
            </div>
          )}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="radio"
              name="expiryType"
              value="end-of-day"
              checked={expiryType === "end-of-day"}
              onChange={() => setExpiryType("end-of-day")}
              className="accent-primary"
            />
            End of day
          </label>
        </div>
        <p className="text-xs text-muted-foreground">
          {expiryType === "duration"
            ? "Timer starts when you check the first item."
            : "Run expires at midnight on the day it's started."}
        </p>
      </fieldset>

      {/* Supplies */}
      <div className="space-y-3">
        <Label>Required supplies <span className="text-muted-foreground font-normal">(optional)</span></Label>
        {supplies.length > 0 && (
          <ul className="space-y-1.5">
            {supplies.map((s, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="flex-1 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm">
                  {s}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => setSupplies((prev) => prev.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <div className="flex gap-2">
          <Input
            value={newSupply}
            onChange={(e) => setNewSupply(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const text = newSupply.trim();
                if (text) { setSupplies((prev) => [...prev, text]); setNewSupply(""); }
              }
            }}
            placeholder="e.g. Loofa, toilet blue block…"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => {
              const text = newSupply.trim();
              if (text) { setSupplies((prev) => [...prev, text]); setNewSupply(""); }
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Things you need to have on hand before starting this checklist.
        </p>
      </div>

      {/* Items */}
      <div className="space-y-3">
        <Label>Items</Label>
        <ul className="space-y-2">
          {items.map((item, idx) => (
            <li key={item.id} className="flex items-center gap-2">
              <span className="w-5 text-right text-xs text-muted-foreground">{idx + 1}.</span>
              <span className="flex-1 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm">
                {item.text}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => moveItem(item.id, "up")}
                disabled={idx === 0}
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => moveItem(item.id, "down")}
                disabled={idx === items.length - 1}
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => removeItem(item.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <Input
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }}
            placeholder="Add an item…"
          />
          <Button type="button" variant="outline" size="icon" onClick={addItem}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Create template"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
