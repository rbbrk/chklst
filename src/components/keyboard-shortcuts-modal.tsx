"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";

interface KeyboardShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHORTCUT_GROUPS = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["\u2303", "H"], description: "Go to dashboard" },
      { keys: ["\u2303", "R"], description: "Go to run history" },
      { keys: ["\u2303", "T"], description: "Go to templates" },
      { keys: ["\u2303", "N"], description: "New template" },
      { keys: ["\u2303", "P"], description: "Profile" },
    ],
  },
  {
    title: "General",
    shortcuts: [
      { keys: ["\u2318", "/"], description: "Show this help" },
      { keys: ["Esc"], description: "Close modal" },
    ],
  },
];

export function KeyboardShortcutsModal({ open, onOpenChange }: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.title}>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {group.title}
              </h3>
              <ul className="space-y-2">
                {group.shortcuts.map((s) => (
                  <li key={s.description} className="flex items-center justify-between">
                    <span className="text-sm">{s.description}</span>
                    <span className="flex items-center gap-1">
                      {s.keys.map((k, i) => (
                        <span key={i} className="flex items-center gap-1">
                          {i > 0 && <span className="text-xs text-muted-foreground">+</span>}
                          <Kbd>{k}</Kbd>
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
