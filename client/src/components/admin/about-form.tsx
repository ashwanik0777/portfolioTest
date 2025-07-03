import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Upload } from "lucide-react";
import { uploadFile } from "@/lib/utils";

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  shortBio: z.string().min(10, { message: "Short bio must be at least 10 characters" }),
  bio: z.string().min(20, { message: "Bio must be at least 20 characters" }),
  currentWork: z.string().min(10, { message: "Current work must be at least 10 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(7, { message: "Phone number must be at least 7 characters" }),
  location: z.string().min(2, { message: "Location must be at least 2 characters" }),
  experience: z.string(),
  education: z.string(),
  roles: z.string().refine(roles => {
    try {
      return JSON.parse(roles).length > 0;
    } catch {
      return false;
    }
  }, { message: "Please enter valid JSON array of roles" }),
  image: z.string().url({ message: "Please enter a valid image URL" }),
  aboutImage: z.string().url({ message: "Please enter a valid about image URL" }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function AboutForm({ profile }: { profile: any }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [imageLoading, setImageLoading] = useState(false);
  const [aboutImageLoading, setAboutImageLoading] = useState(false);

  const defaultValues: Partial<ProfileFormValues> = {
    name: profile?.name || "",
    title: profile?.title || "",
    shortBio: profile?.shortBio || "",
    bio: profile?.bio || "",
    currentWork: profile?.currentWork || "",
    email: profile?.email || "",
    phone: profile?.phone || "",
    location: profile?.location || "",
    experience: profile?.experience || "",
    education: profile?.education || "",
    roles: profile?.roles ? JSON.stringify(profile.roles) : "[]",
    image: profile?.image || "",
    aboutImage: profile?.aboutImage || "",
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormValues) => {
      // Convert roles back to array
      const transformedData = {
        ...data,
        roles: JSON.parse(data.roles)
      };
      
      const res = await apiRequest(
        profile ? "PATCH" : "POST", 
        "/api/profile", 
        transformedData
      );
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateProfileMutation.mutate(data);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "image" | "aboutImage") => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (field === "image") {
        setImageLoading(true);
      } else {
        setAboutImageLoading(true);
      }

      const url = await uploadFile(file, "profile");
      form.setValue(field, url, { shouldValidate: true });

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
      if (field === "image") {
        setImageLoading(false);
      } else {
        setAboutImageLoading(false);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>About Profile</CardTitle>
        <CardDescription>
          Update your personal information and profile details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Full Stack Developer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="Your phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Your location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. 5+ Years" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="education"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Education</FormLabel>
                    <FormControl>
                      <Input placeholder="Your education" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="roles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roles (JSON array)</FormLabel>
                    <FormControl>
                      <Input placeholder='["Role 1", "Role 2"]' {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="shortBio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Bio (Hero Section)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief introduction for the hero section" 
                      {...field} 
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio (About Section)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Detailed bio for the about section" 
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
              name="currentWork"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Work</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Description of your current work" 
                      {...field} 
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Image URL</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "image")}
                          className="hidden"
                          id="profile-image-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className={imageLoading ? "opacity-50 cursor-not-allowed" : ""}
                          disabled={imageLoading}
                          asChild
                        >
                          <label htmlFor="profile-image-upload">
                            <Upload className="h-4 w-4" />
                          </label>
                        </Button>
                      </div>
                    </div>
                    {field.value && (
                      <div className="mt-2">
                        <img
                          src={field.value}
                          alt="Profile preview"
                          className="w-20 h-20 object-cover rounded-full"
                        />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="aboutImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>About Section Image URL</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <div className="relative">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, "aboutImage")}
                          className="hidden"
                          id="about-image-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className={aboutImageLoading ? "opacity-50 cursor-not-allowed" : ""}
                          disabled={aboutImageLoading}
                          asChild
                        >
                          <label htmlFor="about-image-upload">
                            <Upload className="h-4 w-4" />
                          </label>
                        </Button>
                      </div>
                    </div>
                    {field.value && (
                      <div className="mt-2">
                        <img
                          src={field.value}
                          alt="About section preview"
                          className="w-32 h-20 object-cover rounded-md"
                        />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={updateProfileMutation.isPending}
            >
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
