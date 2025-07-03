import { AdminLayout } from "@/components/admin/admin-layout";
import { ExperienceForm } from "@/components/admin/experience-form";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function AdminExperience() {
  const { data: experiences, isLoading } = useQuery<any[]>({
    queryKey: ["/api/experiences"],
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Work Experience</h1>
        <p className="text-muted-foreground">
          Add and manage your professional work experience. Experiences will appear in the Experience section of your portfolio.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
          </div>
        ) : (
          <ExperienceForm experiences={experiences || []} />
        )}
      </div>
    </AdminLayout>
  );
}
