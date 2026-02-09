import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./SettingsForm";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch organization
  const { data: organization } = await supabase
    .from("organizations")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Settings</h1>
          <p className="text-muted-foreground">
            Manage your organization and account settings
          </p>
        </div>

        <SettingsForm
          user={{ email: user.email || "" }}
          organization={organization}
        />
      </div>
    </div>
  );
}
