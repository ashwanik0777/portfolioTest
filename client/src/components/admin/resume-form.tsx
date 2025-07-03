import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUp, FileText, Upload, Download, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";

const resumeFormSchema = z.object({
  file: z.instanceof(FileList).refine((files) => files.length > 0, {
    message: "Resume file is required",
  }),
});

type ResumeFormValues = z.infer<typeof resumeFormSchema>;

export function ResumeForm({ resume }: { resume: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const form = useForm<ResumeFormValues>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: {
      file: undefined,
    },
  });

  const uploadResumeMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
        credentials: 'include'
      });
      
      if (!res.ok) {
        throw new Error('Failed to upload resume');
      }
      
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Resume uploaded",
        description: "Your resume has been uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/resume"] });
      form.reset();
      setUploading(false);
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setUploading(false);
    },
  });

  const onSubmit = (data: ResumeFormValues) => {
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', data.file[0]);
    formData.append('path', 'resume');
    
    uploadResumeMutation.mutate(formData);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload Resume</CardTitle>
          <CardDescription>
            Upload your resume or CV for visitors to download
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="file"
                render={({ field: { onChange, value, ...field } }) => (
                  <FormItem>
                    <FormLabel>Resume File</FormLabel>
                    <FormControl>
                      <div className="flex flex-col items-center justify-center w-full">
                        <label 
                          htmlFor="resume-upload" 
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <FileUp className="w-8 h-8 mb-3 text-muted-foreground" />
                            <p className="mb-2 text-sm text-muted-foreground">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-muted-foreground">
                              PDF, DOC, or DOCX (MAX. 5MB)
                            </p>
                          </div>
                          <Input
                            id="resume-upload"
                            type="file"
                            className="hidden"
                            accept=".pdf,.doc,.docx"
                            {...field}
                            onChange={(e) => {
                              onChange(e.target.files);
                            }}
                          />
                        </label>
                        {value && value.length > 0 && (
                          <div className="mt-2 text-sm text-center">
                            Selected file: {value[0].name}
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Resume
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Resume</CardTitle>
          <CardDescription>
            View and manage your current resume
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resume ? (
            <div className="border rounded-md p-6 flex flex-col items-center justify-center">
              <FileText className="w-16 h-16 text-muted-foreground mb-4" />
              
              <h3 className="text-lg font-medium">{resume.filename}</h3>
              
              <p className="text-sm text-muted-foreground mb-4">
                Uploaded on {formatDate(resume.uploadedAt)}
              </p>
              
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  asChild
                >
                  <a href={resume.url} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4 mr-2" />
                    Preview
                  </a>
                </Button>
                
                <Button 
                  size="sm"
                  asChild
                >
                  <a href={resume.url} download>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 border rounded-md">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Resume Uploaded</h3>
              <p className="text-muted-foreground mb-4">
                Upload your resume to make it available for download on your portfolio
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
