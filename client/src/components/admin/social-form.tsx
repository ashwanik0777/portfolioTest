import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Pencil, Plus, ExternalLink } from "lucide-react";

const socialFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  url: z.string().url({ message: "Please enter a valid URL" }),
  icon: z.string().min(10, { message: "Please enter a valid SVG icon" }),
});

type SocialFormValues = z.infer<typeof socialFormSchema>;

export function SocialForm({ socials = [] }: { socials: any[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);

  const defaultValues: Partial<SocialFormValues> = {
    name: "",
    url: "",
    icon: "",
  };

  const form = useForm<SocialFormValues>({
    resolver: zodResolver(socialFormSchema),
    defaultValues,
  });

  const createSocialMutation = useMutation({
    mutationFn: async (data: SocialFormValues) => {
      const res = await apiRequest("POST", "/api/socials", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Social link added",
        description: "Your social link has been added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/socials"] });
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

  const updateSocialMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: SocialFormValues }) => {
      const res = await apiRequest("PATCH", `/api/socials/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Social link updated",
        description: "Your social link has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/socials"] });
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

  const deleteSocialMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/socials/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Social link deleted",
        description: "Your social link has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/socials"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SocialFormValues) => {
    if (editingId !== null) {
      updateSocialMutation.mutate({ id: editingId, data });
    } else {
      createSocialMutation.mutate(data);
    }
  };

  const handleEdit = (social: any) => {
    form.reset({
      name: social.name,
      url: social.url,
      icon: social.icon,
    });
    setEditingId(social.id);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this social link?")) {
      deleteSocialMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    form.reset(defaultValues);
    setEditingId(null);
  };

  // Common social media SVG icons
  const commonSocialIcons = [
    {
      name: "GitHub",
      icon: `<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>`
    },
    {
      name: "LinkedIn",
      icon: `<path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z"/>`
    },
    {
      name: "Twitter",
      icon: `<path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 9.99 9.99 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>`
    },
    {
      name: "Instagram",
      icon: `<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId !== null ? "Edit Social Link" : "Add Social Link"}</CardTitle>
          <CardDescription>
            {editingId !== null ? "Update an existing social media link" : "Add a new social media link to your portfolio"}
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
                    <FormLabel>Social Network Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. GitHub, LinkedIn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <div className="mb-4">
                  <h4 className="text-sm font-medium mb-2">Quick Icon Templates</h4>
                  <div className="flex flex-wrap gap-2">
                    {commonSocialIcons.map((socialIcon, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => form.setValue("icon", socialIcon.icon)}
                        className="flex items-center gap-1"
                      >
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          className="h-4 w-4" 
                          viewBox="0 0 24 24"
                          dangerouslySetInnerHTML={{ __html: socialIcon.icon }}
                        />
                        {socialIcon.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="icon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Icon SVG Path</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder='<path d="..." />'
                          {...field}
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                      {field.value && (
                        <div className="flex gap-2 items-center mt-2">
                          <div className="p-2 bg-muted rounded-md">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              className="h-6 w-6" 
                              viewBox="0 0 24 24"
                              dangerouslySetInnerHTML={{ __html: field.value }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">Icon Preview</span>
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={createSocialMutation.isPending || updateSocialMutation.isPending}
                >
                  {editingId !== null ? (
                    updateSocialMutation.isPending ? "Updating..." : "Update Social Link"
                  ) : (
                    createSocialMutation.isPending ? "Adding..." : "Add Social Link"
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
          <CardTitle>Your Social Links</CardTitle>
          <CardDescription>
            Manage your social media profiles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {socials.length === 0 ? (
            <div className="text-center p-4 border rounded-md">
              <p className="text-muted-foreground">No social links added yet</p>
              <Button 
                variant="link" 
                className="mt-2"
                onClick={() => form.setFocus("name")}
              >
                <Plus className="h-4 w-4 mr-1" /> Add your first social link
              </Button>
            </div>
          ) : (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Network</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Icon</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {socials.map((social) => (
                    <TableRow key={social.id}>
                      <TableCell className="font-medium">{social.name}</TableCell>
                      <TableCell>
                        <a 
                          href={social.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-primary hover:underline"
                        >
                          <span className="truncate max-w-[150px]">{social.url}</span>
                          <ExternalLink className="h-3 w-3 ml-1 flex-shrink-0" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <div className="p-1 bg-muted rounded-md inline-block">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5" 
                            viewBox="0 0 24 24"
                            dangerouslySetInnerHTML={{ __html: social.icon }}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(social)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDelete(social.id)}
                            disabled={deleteSocialMutation.isPending}
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
