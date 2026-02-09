"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Building2, User, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { Organization, OrganizationType } from "@/types/database";

interface SettingsFormProps {
  user: { email: string };
  organization: Organization | null;
}

const organizationTypes: { value: OrganizationType; label: string }[] = [
  { value: "nonprofit", label: "Non-Profit Organization" },
  { value: "community_org", label: "Community Organization" },
  { value: "religious", label: "Religious Organization" },
  { value: "educational", label: "Educational Institution" },
  { value: "healthcare", label: "Healthcare Organization" },
  { value: "advocacy", label: "Advocacy Group" },
  { value: "other", label: "Other" },
];

export function SettingsForm({ user, organization }: SettingsFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [orgName, setOrgName] = useState(organization?.name || "");
  const [orgType, setOrgType] = useState<OrganizationType>(
    organization?.type || "nonprofit"
  );

  const handleSaveOrganization = async () => {
    setIsLoading(true);
    const supabase = createClient();

    try {
      if (organization) {
        // Update existing organization
        const { error } = await supabase
          .from("organizations")
          .update({
            name: orgName,
            type: orgType,
          })
          .eq("id", organization.id);

        if (error) throw error;
      } else {
        // Create new organization
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        if (!currentUser) throw new Error("Not authenticated");

        const { error } = await supabase.from("organizations").insert({
          user_id: currentUser.id,
          name: orgName,
          type: orgType,
        });

        if (error) throw error;
      }

      toast.success("Organization settings saved!");
      router.refresh();
    } catch (error) {
      toast.error("Failed to save settings");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    // For safety, we don't actually implement deletion here
    toast.error("Please contact support to delete your account.");
  };

  return (
    <div className="space-y-6">
      {/* Organization Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Organization</CardTitle>
              <CardDescription>
                Update your organization details
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization Name</Label>
            <Input
              id="orgName"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Enter your organization name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orgType">Organization Type</Label>
            <Select
              value={orgType}
              onValueChange={(value) => setOrgType(value as OrganizationType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select organization type" />
              </SelectTrigger>
              <SelectContent>
                {organizationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSaveOrganization} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <User className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input value={user.email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              Contact support to change your email address
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible actions for your account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
