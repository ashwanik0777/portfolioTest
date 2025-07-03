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
import { Trash2, Pencil, Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

const experienceFormSchema = z.object({
  company: z.string().min(2, { message: "Company name must be at least 2 characters" }),
  jobTitle: z.string().min(2, { message: "Job title must be at least 2 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Please enter a valid date in YYYY-MM-DD format" }),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Please enter a valid date in YYYY-MM-DD format" }).optional().or(z.literal("")),
  technologies: z.string().refine(techs => {
    try {
      return JSON.parse(techs).length > 0;
    } catch {
      return false;
    }
  }, { message: "Please enter valid JSON array of technologies" }),
});

type ExperienceFormValues = z.infer<typeof experienceFormSchema>;

export function ExperienceForm({ experiences = [] }: { experiences: any[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [currentExperience, setCurrentExperience] = useState<any | null>(null);

  const defaultValues: ExperienceFormValues = {
    company: "",
    jobTitle: "",
    description: "",
    startDate: "",
    endDate: "",
    technologies: "[]",
  };

  const form = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    defaultValues,
  });

  const resetForm = () => {
    form.reset(defaultValues);
    setCurrentExperience(null);
  };

  const openDialog = (experience: any = null) => {
    if (experience) {
      setCurrentExperience(experience);
      form.reset({
        company: experience.company,
        jobTitle: experience.jobTitle,
        description: experience.description,
        startDate: experience.startDate.split("T")[0],
        endDate: experience.endDate ? experience.endDate.split("T")[0] : "",
        technologies: JSON.stringify(experience.technologies),
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

  const createExperienceMutation = useMutation({
    mutationFn: async (data: ExperienceFormValues) => {
      // Convert technologies back to array
      const transformedData = {
        ...data,
        technologies: JSON.parse(data.technologies)
      };
      
      const res = await apiRequest("POST", "/api/experiences", transformedData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Experience added",
        description: "Your experience has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/experiences"] });
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

  const updateExperienceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: ExperienceFormValues }) => {
      // Convert technologies back to array
      const transformedData = {
        ...data,
        technologies: JSON.parse(data.technologies)
      };
      
      const res = await apiRequest("PATCH", `/api/experiences/${id}`, transformedData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Experience updated",
        description: "Your experience has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/experiences"] });
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

  const deleteExperienceMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/experiences/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Experience deleted",
        description: "Your experience has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/experiences"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ExperienceFormValues) => {
    if (currentExperience) {
      updateExperienceMutation.mutate({ id: currentExperience.id, data });
    } else {
      createExperienceMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this experience?")) {
      deleteExperienceMutation.mutate(id);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Work Experience</CardTitle>
            <CardDescription>
              Manage your professional work experience
            </CardDescription>
          </div>
          <Button onClick={() => openDialog()}>
            <Plus className="mr-2 h-4 w-4" /> Add Experience
          </Button>
        </CardHeader>
        <CardContent>
          {experiences.length === 0 ? (
            <div className="text-center p-8 border rounded-md">
              <h3 className="text-lg font-medium mb-2">No experience added yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your work experience to showcase your professional background
              </p>
              <Button onClick={() => openDialog()}>
                <Plus className="mr-2 h-4 w-4" /> Add Your First Experience
              </Button>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {experiences.map((experience) => (
                    <TableRow key={experience.id}>
                      <TableCell className="font-medium">{experience.jobTitle}</TableCell>
                      <TableCell>{experience.company}</TableCell>
                      <TableCell>
                        {formatDate(experience.startDate)} - {experience.endDate ? formatDate(experience.endDate) : "Present"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDialog(experience)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(experience.id)}
                            disabled={deleteExperienceMutation.isPending}
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
            <DialogTitle>{currentExperience ? "Edit Experience" : "Add New Experience"}</DialogTitle>
            <DialogDescription>
              {currentExperience 
                ? "Update your professional experience details" 
                : "Add details about your professional work experience"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="jobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Senior Frontend Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. TechNova Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date (leave empty for current position)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
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
                        placeholder="Describe your responsibilities and achievements" 
                        {...field} 
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="technologies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Technologies (JSON array)</FormLabel>
                    <FormControl>
                      <Input placeholder='["React", "TypeScript", "Node.js"]' {...field} />
                    </FormControl>
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
                  disabled={createExperienceMutation.isPending || updateExperienceMutation.isPending}
                >
                  {currentExperience ? (
                    updateExperienceMutation.isPending ? "Updating..." : "Update Experience"
                  ) : (
                    createExperienceMutation.isPending ? "Adding..." : "Add Experience"
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
