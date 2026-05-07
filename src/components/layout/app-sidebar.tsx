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
  ShieldCheck
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

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

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="flex flex-row items-center gap-2 px-4 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
          <span className="text-lg font-bold tracking-tight text-foreground">NexusFlow</span>
          <span className="text-xs text-muted-foreground font-medium">Empresarial Pro</span>
        </div>
        <SidebarTrigger className="ml-auto md:hidden" />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-4">Menu Principal</SidebarGroupLabel>
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
                      "transition-all duration-200",
                      isActive ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-sidebar-accent"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden ml-2">{item.name}</span>
                      {isActive && <ChevronRight className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden" />}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden px-4">Administração</SidebarGroupLabel>
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
                      "transition-all duration-200",
                      isActive ? "bg-primary text-primary-foreground font-semibold" : "hover:bg-sidebar-accent"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
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
          <div className="flex items-center gap-3 rounded-lg border border-border p-3 bg-card/50">
            <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-accent-foreground">
              AD
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">Admin User</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Premium Plan</span>
            </div>
          </div>
          <SidebarMenuButton className="text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors">
            <LogOut className="h-4 w-4" />
            <span className="ml-2">Sair da Conta</span>
          </SidebarMenuButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}