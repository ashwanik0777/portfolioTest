import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/client/src/components/ui/card";
import {
  Briefcase,
  FileCode,
  Users,
  MessageSquare,
  ThumbsUp,
  FileText,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard - Portfolio",
  description: "Admin dashboard for portfolio management",
};

async function getDashboardStats() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/dashboard/stats`, {
      cache: 'no-store'
    });

    if (!res.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }

    return res.json();
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      skillsCount: 0,
      projectsCount: 0,
      experiencesCount: 0,
      messagesCount: 0,
      feedbackCount: 0,
      blogPostsCount: 0,
    };
  }
}

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    {
      title: "Skills",
      value: stats.skillsCount,
      description: "Total skills listed",
      icon: <Users className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Projects",
      value: stats.projectsCount,
      description: "Published projects",
      icon: <FileCode className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Work Experience",
      value: stats.experiencesCount,
      description: "Job positions",
      icon: <Briefcase className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Messages",
      value: stats.messagesCount,
      description: "Contact form submissions",
      icon: <MessageSquare className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Feedback",
      value: stats.feedbackCount,
      description: "User feedback",
      icon: <ThumbsUp className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: "Blog Posts",
      value: stats.blogPostsCount,
      description: "Published articles",
      icon: <FileText className="h-5 w-5 text-muted-foreground" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Overview of your portfolio site
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              The most recent interactions on your portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-10 text-muted-foreground">
              Activity data will be displayed here
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
            <CardDescription>
              Latest messages from contact form
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-10 text-muted-foreground">
              Message data will be displayed here
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}