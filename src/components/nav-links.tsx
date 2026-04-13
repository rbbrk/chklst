"use client";

import Link from "next/link";
import { Kbd } from "@/components/ui/kbd";

const navItems = [
  { href: "/", label: "Runs", key: "R", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
  { href: "/templates", label: "Templates", key: "T", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
];

interface NavLinksProps {
  displayName: string;
}

export function NavLinks({ displayName }: NavLinksProps) {
  return (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${item.color}`}
        >
          {item.label}
          <Kbd className="opacity-40">{"\u2303"}{item.key}</Kbd>
        </Link>
      ))}
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
      >
        {displayName}
        <Kbd className="opacity-40">{"\u2303"}P</Kbd>
      </Link>
    </>
  );
}
