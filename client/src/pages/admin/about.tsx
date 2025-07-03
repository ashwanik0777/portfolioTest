import { AdminLayout } from "@/components/admin/admin-layout";
import { AboutForm } from "@/components/admin/about-form";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function AdminAbout() {
  const { data: profile, isLoading } = useQuery<any>({
    queryKey: ["/api/profile"],
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">About Settings</h1>
        <p className="text-muted-foreground">
          Manage your personal information and profile details. This information will be displayed in the About section of your portfolio.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
          </div>
        ) : (
          <AboutForm profile={profile} />
        )}
      </div>
    </AdminLayout>
  );
}
