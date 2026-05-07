
"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Target,
  Calendar,
  Settings,
  Bell,
  LogOut,
  ChevronRight,
  ShieldCheck,
  UserCircle
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth, useUser } from "@/firebase"
import { signOut } from "firebase/auth"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Clientes", href: "/clientes", icon: Users },
  { name: "Contratos", href: "/contratos", icon: FileText },
  { name: "Faturamento", href: "/faturamento", icon: CreditCard },
  { name: "CRM", href: "/crm", icon: Target },
  { name: "Agenda", href: "/agenda", icon: Calendar },
]

const adminItems = [
  { name: "Configurações", href: "/configuracoes", icon: Settings },
  { name: "Notificações", href: "/notificacoes", icon: Bell },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const auth = useAuth()
  const { user } = useUser()

  const handleSignOut = async () => {
    await signOut(auth)
    router.push("/login")
  }

  // Não renderiza sidebar na página de login
  if (pathname === "/login") return null

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="flex flex-row items-center gap-2 px-4 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
          <span className="text-lg font-black tracking-tighter text-foreground">NexusFlow</span>
          <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">SaaS Edition</span>
        </div>
        <SidebarTrigger className="ml-auto md:hidden" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-4 uppercase text-[10px] font-black text-muted-foreground tracking-widest">Gestão</SidebarGroupLabel>
          <SidebarMenu>
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.name}
                    className={cn(
                      "transition-all duration-200 h-10 mx-2 rounded-lg",
                      isActive ? "bg-primary text-primary-foreground font-bold shadow-md shadow-primary/20" : "hover:bg-sidebar-accent"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                      <span className="group-data-[collapsible=icon]:hidden ml-2">{item.name}</span>
                      {isActive && <ChevronRight className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden opacity-50" />}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="mx-4 opacity-10" />

        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-4 uppercase text-[10px] font-black text-muted-foreground tracking-widest">Sistema</SidebarGroupLabel>
          <SidebarMenu>
            {adminItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.name}
                    className={cn(
                      "transition-all duration-200 h-10 mx-2 rounded-lg",
                      isActive ? "bg-primary text-primary-foreground font-bold" : "hover:bg-sidebar-accent"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="group-data-[collapsible=icon]:hidden ml-2">{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex flex-col gap-4 overflow-hidden group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-3 rounded-xl border border-border p-3 bg-card/50 backdrop-blur-sm">
            <div className="h-9 w-9 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
              <UserCircle className="h-6 w-6" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-foreground truncate">{user?.displayName || user?.email || "Usuário"}</span>
              <span className="text-[9px] text-accent uppercase font-black tracking-tighter">Premium Enterprise</span>
            </div>
          </div>
          <SidebarMenuButton 
            onClick={handleSignOut}
            className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-all duration-300 font-bold rounded-lg"
          >
            <LogOut className="h-4 w-4" />
            <span className="ml-2">Sair da Conta</span>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
