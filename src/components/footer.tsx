import { Kbd } from "@/components/ui/kbd";

function SpaceNeedle({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 48"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      {/* Observation deck */}
      <path d="M4 14 L12 8 L20 14 L18 16 L6 16 Z" />
      {/* Thin tower */}
      <rect x="11" y="16" width="2" height="26" />
      {/* Base */}
      <path d="M7 42 L17 42 L15 46 L9 46 Z" />
      {/* Ground */}
      <rect x="5" y="46" width="14" height="1" rx="0.5" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t py-6">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-2 px-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span>chklst, made with love in Seattle, WA</span>
          <SpaceNeedle className="h-4 w-auto" />
        </div>
        <div className="flex items-center gap-1">
          <span>Press</span>
          <Kbd>{"\u2318"}/</Kbd>
          <span>for keyboard shortcuts</span>
        </div>
      </div>
    </footer>
  );
}
