'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/client/src/components/ui/button';
import { Card } from '@/client/src/components/ui/card';
import {
  LayoutDashboard,
  User,
  PanelTop,
  FileCode,
  Briefcase,
  FileText,
  Globe,
  Settings,
  LogOut,
} from 'lucide-react';
import { cn } from '@/client/src/lib/utils';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5 mr-2" />,
      href: '/admin/dashboard',
    },
    {
      title: 'About',
      icon: <User className="h-5 w-5 mr-2" />,
      href: '/admin/about',
    },
    {
      title: 'Skills',
      icon: <PanelTop className="h-5 w-5 mr-2" />,
      href: '/admin/skills',
    },
    {
      title: 'Projects',
      icon: <FileCode className="h-5 w-5 mr-2" />,
      href: '/admin/projects',
    },
    {
      title: 'Experience',
      icon: <Briefcase className="h-5 w-5 mr-2" />,
      href: '/admin/experience',
    },
    {
      title: 'Blog',
      icon: <FileText className="h-5 w-5 mr-2" />,
      href: '/admin/blog',
    },
    {
      title: 'Social Links',
      icon: <Globe className="h-5 w-5 mr-2" />,
      href: '/admin/socials',
    },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card">
        <div className="p-4 border-b border-border">
          <Link href="/admin/dashboard">
            <h1 className="text-xl font-bold flex items-center">
              <Settings className="h-5 w-5 mr-2 text-primary" />
              Admin Panel
            </h1>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive(item.href) ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  isActive(item.href) && 'bg-primary text-primary-foreground'
                )}
              >
                {item.icon}
                {item.title}
              </Button>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <Link href="/">
            <Button variant="outline" className="w-full justify-start">
              <LogOut className="h-5 w-5 mr-2" />
              Back to Site
            </Button>
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="flex flex-col flex-1">
        <header className="md:hidden p-4 border-b border-border flex items-center justify-between">
          <Link href="/admin/dashboard">
            <h1 className="text-xl font-bold flex items-center">
              <Settings className="h-5 w-5 mr-2 text-primary" />
              Admin
            </h1>
          </Link>
          {/* Mobile menu button would go here */}
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Card className="border-0 shadow-none bg-transparent">
            {children}
          </Card>
        </main>
      </div>
    </div>
  );
}