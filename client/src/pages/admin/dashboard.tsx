import { AdminLayout } from "@/components/admin/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Code, Briefcase, MessageSquare, Users, FileText, Lightbulb, FolderKanban, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import BlogManagement from "./blog-management";

export default function AdminDashboard() {
  const { data: stats } = useQuery<any>({
    queryKey: ["/api/stats"],
  });

  const { data: skills = [] } = useQuery<any[]>({
    queryKey: ["/api/skills"],
  });

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });

  const { data: experiences = [] } = useQuery<any[]>({
    queryKey: ["/api/experiences"],
  });

  const { data: profile } = useQuery<any>({
    queryKey: ["/api/profile"],
  });

  const { data: socials = [] } = useQuery<any[]>({
    queryKey: ["/api/socials"],
  });

  // Get blog posts from API for dashboard stats
  const { data: blogPosts = [] } = useQuery<any[]>({
    queryKey: ['/api/blog'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get skill categories for chart
  const skillsByCategory = skills.reduce((acc: Record<string, number>, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = 0;
    }
    acc[skill.category]++;
    return acc;
  }, {});

  const skillChartData = Object.entries(skillsByCategory).map(([name, count]) => ({
    name,
    count
  }));

  // Calculate total years of experience
  const totalExperience = experiences.reduce((total, exp) => {
    const start = new Date(exp.startDate);
    const end = exp.endDate ? new Date(exp.endDate) : new Date();
    const years = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return total + years;
  }, 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button asChild variant="outline">
            <a href="/" target="_blank" rel="noopener noreferrer">
              View Portfolio
            </a>
          </Button>
        </div>
        
        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="blog">
              <BookOpen className="h-4 w-4 mr-2" />
              Blog Management
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Lightbulb className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Skills</p>
                    <h3 className="text-2xl font-bold">{skills.length}</h3>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <FolderKanban className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Projects</p>
                    <h3 className="text-2xl font-bold">{projects.length}</h3>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Experience</p>
                    <h3 className="text-2xl font-bold">{Math.round(totalExperience * 10) / 10} years</h3>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-center space-x-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Messages</p>
                    <h3 className="text-2xl font-bold">{stats?.messagesCount || 0}</h3>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your portfolio content quickly</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                    <Link href="/admin/about">
                      <UserIcon className="h-6 w-6" />
                      <span>Edit Profile</span>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                    <Link href="/admin/skills">
                      <Lightbulb className="h-6 w-6" />
                      <span>Manage Skills</span>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                    <Link href="/admin/projects">
                      <FolderKanban className="h-6 w-6" />
                      <span>Add Project</span>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                    <Link href="/admin/experience">
                      <Briefcase className="h-6 w-6" />
                      <span>Work History</span>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                    <Link href="/admin/socials">
                      <Users className="h-6 w-6" />
                      <span>Social Links</span>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                    <Link href="/admin/resume">
                      <FileText className="h-6 w-6" />
                      <span>Upload Resume</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Skills Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Skills by Category</CardTitle>
                  <CardDescription>Distribution of your skills by category</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {skillChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={skillChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Code className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No skills data available yet</p>
                      <Button variant="link" className="mt-2" asChild>
                        <Link href="/admin/skills">Add Your Skills</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Completion</CardTitle>
                  <CardDescription>Complete your portfolio for better presentation</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ProfileCompletionItem 
                      title="About Information" 
                      isComplete={!!profile} 
                      link="/admin/about"
                    />
                    <ProfileCompletionItem 
                      title="Skills" 
                      isComplete={skills.length > 0} 
                      link="/admin/skills"
                    />
                    <ProfileCompletionItem 
                      title="Projects" 
                      isComplete={projects.length > 0} 
                      link="/admin/projects"
                    />
                    <ProfileCompletionItem 
                      title="Work Experience" 
                      isComplete={experiences.length > 0} 
                      link="/admin/experience"
                    />
                    <ProfileCompletionItem 
                      title="Social Links" 
                      isComplete={socials.length > 0} 
                      link="/admin/socials"
                    />
                    <ProfileCompletionItem 
                      title="Resume" 
                      isComplete={!!profile?.resume} 
                      link="/admin/resume"
                    />
                    <ProfileCompletionItem 
                      title="Blog Posts" 
                      isComplete={blogPosts.length > 0} 
                      link="#blog"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="blog">
            <BlogManagement />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

function ProfileCompletionItem({ 
  title, 
  isComplete, 
  link 
}: { 
  title: string; 
  isComplete: boolean; 
  link: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isComplete ? (
          <div className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
        <span>{title}</span>
      </div>
      
      <Button variant="ghost" size="sm" asChild>
        <Link href={link}>{isComplete ? "Edit" : "Complete"}</Link>
      </Button>
    </div>
  );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}