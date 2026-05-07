
"use client"

import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { cn } from "@/lib/utils"

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!isUserLoading && !user && pathname !== '/login') {
      router.push('/login')
    }
    if (!isUserLoading && user && pathname === '/login') {
      router.push('/dashboard')
    }
  }, [user, isUserLoading, pathname, router])

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-bold tracking-widest text-xs animate-pulse">NEXUSFLOW PRO</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"

  return (
    <html lang="pt-BR" className="dark">
      <head>
        <title>NexusFlow Pro | Gestão SaaS Premium</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground selection:bg-primary/30 overflow-x-hidden">
        <FirebaseClientProvider>
          <AuthGuard>
            <SidebarProvider defaultOpen={true}>
              <div className="flex min-h-screen w-full overflow-hidden">
                {!isLoginPage && <AppSidebar />}
                <main className={cn(
                  "flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300",
                  !isLoginPage && "p-4 md:p-6 lg:p-8"
                )}>
                  <div className={cn("mx-auto space-y-6 md:space-y-8", !isLoginPage && "max-w-7xl w-full")}>
                    {children}
                  </div>
                </main>
              </div>
            </SidebarProvider>
          </AuthGuard>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
