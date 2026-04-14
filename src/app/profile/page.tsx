import { auth } from "@/auth";
import { getProfile } from "@/lib/kv";
import { ProfileForm } from "@/components/profile-form";
import { AccountReset } from "@/components/account-reset";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/");

  const profile = await getProfile();
  const currentName = profile?.displayName ?? session.user.name ?? "";
  const showShortcuts = profile?.showShortcuts ?? "always";

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <h1 className="text-lg font-semibold">Profile</h1>
        <ProfileForm initialName={currentName} initialShowShortcuts={showShortcuts} />
      </div>
      <AccountReset />
    </div>
  );
}
