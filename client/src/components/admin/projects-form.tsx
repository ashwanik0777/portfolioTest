import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Pencil, Plus, Upload, ExternalLink } from "lucide-react";
import { uploadFile } from "@/lib/utils";

const projectFormSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  category: z.string().min(2, { message: "Category must be at least 2 characters" }),
  tags: z.string().refine(tags => {
    try {
      return JSON.parse(tags).length > 0;
    } catch {
      return false;
    }
  }, { message: "Please enter valid JSON array of tags" }),
  image: z.string().url({ message: "Please enter a valid image URL" }),
  demoUrl: z.string().url({ message: "Please enter a valid demo URL" }).optional().or(z.literal("")),
  githubUrl: z.string().url({ message: "Please enter a valid GitHub URL" }).optional().or(z.literal("")),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

export function ProjectsForm({ projects = [] }: { projects: any[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [currentProject, setCurrentProject] = useState<any | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const defaultValues: ProjectFormValues = {
    title: "",
    description: "",
    category: "",
    tags: "[]",
    image: "",
    demoUrl: "",
    githubUrl: "",
  };

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues,
  });

  const resetForm = () => {
    form.reset(defaultValues);
    setCurrentProject(null);
  };

  const openDialog = (project: any = null) => {
    if (project) {
      setCurrentProject(project);
      form.reset({
        title: project.title,
        description: project.description,
        category: project.category,
        tags: JSON.stringify(project.tags),
        image: project.image,
        demoUrl: project.demoUrl || "",
        githubUrl: project.githubUrl || "",
      });
    } else {
      resetForm();
    }
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setTimeout(resetForm, 300); // Reset after dialog animation
  };

  const createProjectMutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      // Convert tags back to array
      const transformedData = {
        ...data,
        tags: JSON.parse(data.tags)
      };
      
      const res = await apiRequest("POST", "/api/projects", transformedData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Project added",
        description: "Your project has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      closeDialog();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: ProjectFormValues }) => {
      // Convert tags back to array
      const transformedData = {
        ...data,
        tags: JSON.parse(data.tags)
      };
      
      const res = await apiRequest("PATCH", `/api/projects/${id}`, transformedData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Project updated",
        description: "Your project has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      closeDialog();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/projects/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Project deleted",
        description: "Your project has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProjectFormValues) => {
    if (currentProject) {
      updateProjectMutation.mutate({ id: currentProject.id, data });
    } else {
      createProjectMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      deleteProjectMutation.mutate(id);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImageLoading(true);
      const url = await uploadFile(file, "projects");
      form.setValue("image", url, { shouldValidate: true });

      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Projects</CardTitle>
            <CardDescription>
              Manage and showcase your portfolio projects
            </CardDescription>
          </div>
          <Button onClick={() => openDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Add Project
          </Button>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center p-8 border rounded-md">
              <h3 className="text-lg font-medium mb-2">No projects added yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first project to showcase your work in your portfolio
              </p>
              <Button onClick={() => openDialog()}>
                <Plus className="mr-2 h-4 w-4" /> Add Your First Project
              </Button>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Links</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <img 
                            src={project.image} 
                            alt={project.title}
                            className="w-10 h-10 object-cover rounded-md"
                          />
                          <div>
                            <div className="font-medium">{project.title}</div>
                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {project.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{project.category}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {project.demoUrl && (
                            <a 
                              href={project.demoUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          {project.githubUrl && (
                            <a 
                              href={project.githubUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-4 w-4" 
                                fill="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                              </svg>
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDialog(project)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(project.id)}
                            disabled={deleteProjectMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentProject ? "Edit Project" : "Add New Project"}</DialogTitle>
            <DialogDescription>
              {currentProject 
                ? "Update the details of your existing project" 
                : "Add a new project to showcase in your portfolio"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. E-commerce Dashboard" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Web App, Mobile App" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags (JSON array)</FormLabel>
                      <FormControl>
                        <Input placeholder='["React", "Node.js", "MongoDB"]' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="demoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Demo URL (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="githubUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub URL (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/username/repo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Brief description of your project" 
                        {...field} 
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Image</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input {...field} placeholder="https://example.com/image.jpg" />
                      </FormControl>
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          id="project-image-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className={imageLoading ? "opacity-50 cursor-not-allowed" : ""}
                          disabled={imageLoading}
                          asChild
                        >
                          <label htmlFor="project-image-upload">
                            <Upload className="h-4 w-4" />
                          </label>
                        </Button>
                      </div>
                    </div>
                    {field.value && (
                      <div className="mt-2">
                        <img
                          src={field.value}
                          alt="Project preview"
                          className="w-full h-32 object-cover rounded-md"
                        />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={closeDialog}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createProjectMutation.isPending || updateProjectMutation.isPending}
                >
                  {currentProject ? (
                    updateProjectMutation.isPending ? "Updating..." : "Update Project"
                  ) : (
                    createProjectMutation.isPending ? "Adding..." : "Add Project"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
