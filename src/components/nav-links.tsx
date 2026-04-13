"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Kbd } from "@/components/ui/kbd";

const navItems = [
  { href: "/", label: "Runs", key: "R", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
  { href: "/templates", label: "Templates", key: "T", color: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
];

interface NavLinksProps {
  displayName: string;
  showShortcuts: boolean;
}

export function NavLinks({ displayName, showShortcuts }: NavLinksProps) {
  return (
    <>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${item.color}`}
        >
          {item.label}
          {showShortcuts && <Kbd className="opacity-40">{"\u2303"}{item.key}</Kbd>}
        </Link>
      ))}
      <Link
        href="/profile"
        className="inline-flex items-center gap-1.5 rounded-md bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
      >
        {displayName}
        {showShortcuts && <Kbd className="opacity-40">{"\u2303"}P</Kbd>}
      </Link>
      <button
        type="button"
        onClick={() => signOut({ callbackUrl: "/" })}
        className="inline-flex items-center gap-1.5 rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
      >
        Sign out
        {showShortcuts && <Kbd className="opacity-40">{"\u2303"}Q</Kbd>}
      </button>
    </>
  );
}
