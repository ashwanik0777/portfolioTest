import { AdminLayout } from "@/components/admin/admin-layout";
import { SocialForm } from "@/components/admin/social-form";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function AdminSocials() {
  const { data: socials, isLoading } = useQuery<any[]>({
    queryKey: ["/api/socials"],
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Social Media Links</h1>
        <p className="text-muted-foreground">
          Add and manage your social media profiles. These links will be displayed in your portfolio and help visitors connect with you.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
          </div>
        ) : (
          <SocialForm socials={socials || []} />
        )}
      </div>
    </AdminLayout>
  );
}
