import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch the user's organization
  const { data: organization } = await supabase
    .from("organizations")
    .select("name")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-background">
      <DashboardShell
        user={{ email: user.email || "" }}
        organizationName={organization?.name}
      >
        {children}
      </DashboardShell>
    </div>
  );
}
