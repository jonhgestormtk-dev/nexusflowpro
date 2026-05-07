
"use client"

import * as React from "react"
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Mail, 
  Phone, 
  MessageSquare,
  UserPlus,
  ArrowRight,
  Filter
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const stages = [
  { id: "new", name: "Novos Leads", color: "bg-blue-500" },
  { id: "contacted", name: "Em Contato", color: "bg-amber-500" },
  { id: "qualified", name: "Qualificados", color: "bg-indigo-500" },
  { id: "proposal", name: "Proposta Enviada", color: "bg-purple-500" }
]

const mockLeads = [
  { id: "1", name: "André Rocha", company: "Tech Lab", value: "R$ 4.500", stage: "new", date: "2h atrás" },
  { id: "2", name: "Juliana Silva", company: "Moda Viva", value: "R$ 12.000", stage: "contacted", date: "5h atrás" },
  { id: "3", name: "Marcos Souza", company: "Auto Peças", value: "R$ 3.200", stage: "qualified", date: "1d atrás" },
  { id: "4", name: "Fernanda Lima", company: "Dental Clinic", value: "R$ 7.800", stage: "proposal", date: "2d atrás" },
]

export default function CRMPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Pipeline de Vendas (CRM)</h1>
          <p className="text-muted-foreground">Gerencie seus leads e acompanhe o progresso das negociações.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <UserPlus className="mr-2 h-4 w-4" /> Novo Lead
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {stages.map((stage) => (
          <div key={stage.id} className="min-w-[300px] flex-1 space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${stage.color}`} />
                <h3 className="font-bold text-sm uppercase tracking-wider">{stage.name}</h3>
                <Badge variant="secondary" className="text-[10px]">{mockLeads.filter(l => l.stage === stage.id).length}</Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {mockLeads.filter(l => l.stage === stage.id).map((lead) => (
                <Card key={lead.id} className="bg-card/50 border-border card-hover cursor-pointer group">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-bold text-sm leading-none group-hover:text-primary transition-colors">{lead.name}</p>
                        <p className="text-xs text-muted-foreground">{lead.company}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border">
                          <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                          <DropdownMenuItem>Mover Estágio</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">Perder Lead</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-xs font-black text-accent">{lead.value}</span>
                      <span className="text-[10px] text-muted-foreground font-medium">{lead.date}</span>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="h-7 w-7 rounded-full border-border">
                        <Phone className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-7 w-7 rounded-full border-border">
                        <Mail className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="icon" className="h-7 w-7 rounded-full border-border">
                        <MessageSquare className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="ml-auto h-7 text-[10px] font-bold">
                        AVANÇAR <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <Button variant="ghost" className="w-full border-2 border-dashed border-border h-12 text-muted-foreground hover:bg-muted/20">
                <Plus className="mr-2 h-4 w-4" /> Adicionar Lead
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
