import type {Metadata} from 'next';
import './globals.css';
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'NexusFlow Pro | Gestão de Contratos e Faturamento',
  description: 'Sistema SaaS premium para gestão de contratos, clientes e faturamento recorrente.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <SidebarProvider defaultOpen={true}>
          <div className="flex min-h-screen w-full">
            <AppSidebar />
            <main className="flex-1 overflow-auto p-4 md:p-8">
              <div className="mx-auto max-w-7xl space-y-8">
                {children}
              </div>
            </main>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}