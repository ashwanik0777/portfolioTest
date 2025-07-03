import { AdminLayout } from "@/components/admin/admin-layout";
import { ProjectsForm } from "@/components/admin/projects-form";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function AdminProjects() {
  const { data: projects, isLoading } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Projects Management</h1>
        <p className="text-muted-foreground">
          Create and manage projects to showcase your work. Projects will appear in the Projects section of your portfolio.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
          </div>
        ) : (
          <ProjectsForm projects={projects || []} />
        )}
      </div>
    </AdminLayout>
  );
}
