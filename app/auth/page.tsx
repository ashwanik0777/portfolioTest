import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/client/src/components/ui/card";
import { Button } from "@/client/src/components/ui/button";
import { Input } from "@/client/src/components/ui/input";
import { Label } from "@/client/src/components/ui/label";
import { useTranslation } from "react-i18next";
import { ArrowLeft, LockKeyhole } from "lucide-react";

export const metadata: Metadata = {
  title: "Login - Portfolio Admin",
  description: "Login to access the admin dashboard",
};

// Note: In Next.js, we need to use "use client" for client-side rendering with event handlers
// This is a server component (no "use client"), so the form will be handled by client components
export default function AuthPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-muted/40 px-4">
      <div className="w-full max-w-md">
        <Link 
          href="/" 
          className="text-primary font-medium hover:underline inline-flex items-center mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        
        <Card>
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-2">
              <div className="bg-primary/10 p-3 rounded-full">
                <LockKeyhole className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Log In</CardTitle>
            <CardDescription>Enter your credentials to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* In a real Next.js app, this would be a client component with form handling */}
            <form action="/api/auth/login" method="POST">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" name="username" type="text" required />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input id="password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full">Login</Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              Admin access only
            </p>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}