import { AdminLayout } from "@/components/admin/admin-layout";
import { ResumeForm } from "@/components/admin/resume-form";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export default function AdminResume() {
  const { data: resume, isLoading } = useQuery<any>({
    queryKey: ["/api/resume"],
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Resume Management</h1>
        <p className="text-muted-foreground">
          Upload and manage your resume. The resume will be available for download on your portfolio.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary/40" />
          </div>
        ) : (
          <ResumeForm resume={resume} />
        )}
      </div>
    </AdminLayout>
  );
}
