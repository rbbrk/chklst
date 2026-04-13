"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

const links = [
  { href: "/", label: "Runs", key: "R" },
  { href: "/templates", label: "Templates", key: "T" },
];

export function NavLinks() {
  return (
    <>
      {links.map((l) => (
        <Button key={l.href} variant="ghost" size="sm" asChild>
          <Link href={l.href} className="gap-1.5">
            {l.label}
            <Kbd className="ml-0.5 opacity-50">{"\u2303"}{l.key}</Kbd>
          </Link>
        </Button>
      ))}
    </>
  );
}
