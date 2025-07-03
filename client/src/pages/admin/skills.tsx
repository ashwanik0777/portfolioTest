import { AdminLayout } from "@/components/admin/admin-layout";
import { SkillsForm } from "@/components/admin/skills-form";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function AdminSkills() {
  const { data: skills, isLoading } = useQuery<any[]>({
    queryKey: ["/api/skills"],
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Skills Management</h1>
        <p className="text-muted-foreground">
          Add and manage your skills to showcase your expertise. Skills will appear in the Skills section of your portfolio.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
          </div>
        ) : (
          <SkillsForm skills={skills || []} />
        )}
      </div>
    </AdminLayout>
  );
}
