"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { KeyboardShortcutsModal } from "@/components/keyboard-shortcuts-modal";

function isInputFocused(): boolean {
  const tag = document.activeElement?.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select";
}

export function KeyboardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Alt+? (Alt+Shift+/) — always works, even in inputs
      if (e.altKey && e.shiftKey && e.code === "Slash") {
        e.preventDefault();
        setHelpOpen((prev) => !prev);
        return;
      }

      // Skip remaining shortcuts when typing in a form field or modal is open
      if (isInputFocused() || helpOpen) return;

      if (e.altKey) {
        switch (e.code) {
          case "KeyH":
            e.preventDefault();
            router.push("/");
            break;
          case "KeyR":
            e.preventDefault();
            router.push("/runs");
            break;
          case "KeyT":
            e.preventDefault();
            router.push("/templates");
            break;
          case "KeyN":
            e.preventDefault();
            router.push("/templates/new");
            break;
        }
      }
    },
    [router, helpOpen]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      {children}
      <KeyboardShortcutsModal open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  );
}
