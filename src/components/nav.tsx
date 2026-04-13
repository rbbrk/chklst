import Link from "next/link";
import { auth } from "@/auth";
import { CheckSquare } from "lucide-react";
import { NavLinks } from "@/components/nav-links";
import { getProfile } from "@/lib/kv";

export async function Nav() {
  const session = await auth();
  const profile = session?.user ? await getProfile() : null;
  const displayName = profile?.displayName ?? session?.user?.name ?? session?.user?.email ?? "";
  const showShortcuts = (profile?.showShortcuts ?? "always") === "always";

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <CheckSquare className="h-5 w-5" />
          chklst
        </Link>
        <nav className="flex items-center gap-1.5">
          {session?.user && (
            <NavLinks displayName={displayName} showShortcuts={showShortcuts} />
          )}
        </nav>
      </div>
    </header>
  );
}
