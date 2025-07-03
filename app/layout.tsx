import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/client/src/components/ui/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    template: '%s | Personal Portfolio',
    default: 'Personal Portfolio | Web Developer & Designer',
  },
  description: 'Professional portfolio showcasing web development and design projects with a focus on accessibility and user experience.',
  keywords: ['web developer', 'portfolio', 'frontend', 'full stack', 'react', 'nextjs', 'accessibility'],
  authors: [{ name: 'Portfolio Owner' }],
  creator: 'Portfolio Owner',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://portfolio.example.com',
    title: 'Personal Portfolio | Web Developer & Designer',
    description: 'Professional portfolio showcasing web development and design projects with a focus on accessibility and user experience.',
    siteName: 'Personal Portfolio',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Skip link for keyboard users to jump to main content */}
        <link rel="stylesheet" href="https://unpkg.com/tippy.js@6/animations/scale.css" />
      </head>
      <body className={inter.className}>
        {/* Skip to content link for accessibility */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        
        <ThemeProvider 
          attribute="class" 
          defaultTheme="system" 
          enableSystem 
          disableTransitionOnChange
        >
          <div id="main-content" className="min-h-screen flex flex-col">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}