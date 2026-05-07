
"use client"

import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { cn } from "@/lib/utils"
import { ShieldCheck, Menu } from "lucide-react"

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

  // Evita renderizar conteúdo protegido se o usuário não estiver logado
  if (!user && pathname !== '/login') {
    return null;
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
                  "flex-1 flex flex-col overflow-hidden transition-all duration-300",
                  !isLoginPage && "bg-background"
                )}>
                  {!isLoginPage && (
                    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border px-4 md:hidden">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-black tracking-tighter">NexusFlow</span>
                      </div>
                      <SidebarTrigger>
                        <Menu className="h-6 w-6" />
                      </SidebarTrigger>
                    </header>
                  )}
                  <div className={cn(
                    "flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8",
                    !isLoginPage && "max-w-7xl w-full mx-auto space-y-6 md:space-y-8"
                  )}>
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
