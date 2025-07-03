import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Pencil } from "lucide-react";
import { useState } from "react";

const skillFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  category: z.string().min(2, { message: "Category must be at least 2 characters" }),
  level: z.number().min(1).max(100),
});

type SkillFormValues = z.infer<typeof skillFormSchema>;

export function SkillsForm({ skills = [] }: { skills: any[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);

  const defaultValues: SkillFormValues = {
    name: "",
    category: "",
    level: 75,
  };

  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillFormSchema),
    defaultValues,
  });

  const createSkillMutation = useMutation({
    mutationFn: async (data: SkillFormValues) => {
      const res = await apiRequest("POST", "/api/skills", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Skill added",
        description: "Your skill has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      form.reset(defaultValues);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateSkillMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: SkillFormValues }) => {
      const res = await apiRequest("PATCH", `/api/skills/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Skill updated",
        description: "Your skill has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      form.reset(defaultValues);
      setEditingId(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/skills/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Skill deleted",
        description: "Your skill has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SkillFormValues) => {
    if (editingId !== null) {
      updateSkillMutation.mutate({ id: editingId, data });
    } else {
      createSkillMutation.mutate(data);
    }
  };

  const handleEdit = (skill: any) => {
    form.reset({
      name: skill.name,
      category: skill.category,
      level: skill.level,
    });
    setEditingId(skill.id);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this skill?")) {
      deleteSkillMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    form.reset(defaultValues);
    setEditingId(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId !== null ? "Edit Skill" : "Add New Skill"}</CardTitle>
          <CardDescription>
            {editingId !== null 
              ? "Update an existing skill in your portfolio" 
              : "Add a new skill to showcase in your portfolio"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. React.js" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Frontend, Backend, DevOps" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Proficiency: {field.value}%</FormLabel>
                    <FormControl>
                      <Slider
                        defaultValue={[field.value]}
                        max={100}
                        step={1}
                        onValueChange={(vals) => {
                          field.onChange(vals[0]);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={createSkillMutation.isPending || updateSkillMutation.isPending}
                >
                  {editingId !== null ? (
                    updateSkillMutation.isPending ? "Updating..." : "Update Skill"
                  ) : (
                    createSkillMutation.isPending ? "Adding..." : "Add Skill"
                  )}
                </Button>
                {editingId !== null && (
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Skills</CardTitle>
          <CardDescription>
            Manage and organize your skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          {skills.length === 0 ? (
            <div className="text-center p-4 border rounded-md">
              <p className="text-muted-foreground">No skills added yet</p>
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => form.setFocus("name")}
              >
                <Plus className="h-4 w-4 mr-1" /> Add your first skill
              </Button>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Skill</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Proficiency</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {skills.map((skill) => (
                    <TableRow key={skill.id}>
                      <TableCell className="font-medium">{skill.name}</TableCell>
                      <TableCell>{skill.category}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${skill.level}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium">{skill.level}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(skill)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(skill.id)}
                            disabled={deleteSkillMutation.isPending}
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
    </div>
  );
}
