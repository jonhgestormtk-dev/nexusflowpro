"use client"

import * as React from "react"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  Globe,
  Building2,
  Trash2,
  Edit
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const mockClients = [
  {
    id: "1",
    name: "João Silva",
    company: "Silva Tech",
    email: "joao@silva.tech",
    phone: "(11) 98877-6655",
    status: "Ativo",
    service: "Sistemas de Gestão",
    createdAt: "12/05/2023"
  },
  {
    id: "2",
    name: "Maria Oliveira",
    company: "Oliveira Cosméticos",
    email: "maria@oliveira.com",
    phone: "(21) 97766-5544",
    status: "Ativo",
    service: "Site Profissional",
    createdAt: "20/06/2023"
  },
  {
    id: "3",
    name: "Ricardo Santos",
    company: "Santos Advogados",
    email: "contato@santos.adv",
    phone: "(31) 96655-4433",
    status: "Inadimplente",
    service: "Sistema Jurídico",
    createdAt: "05/01/2024"
  },
  {
    id: "4",
    name: "Patrícia Lima",
    company: "Lima Engenharia",
    email: "patricia@lima.eng",
    phone: "(41) 95544-3322",
    status: "Inativo",
    service: "App Mobile",
    createdAt: "15/02/2024"
  }
]

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = React.useState("")

  const filteredClients = mockClients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.company.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Clientes</h1>
          <p className="text-muted-foreground">Gerencie sua base de clientes e acompanhe o relacionamento.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Novo Cliente
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome, empresa ou e-mail..." 
            className="pl-10 bg-card/50 border-border"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="border-border">
          <Filter className="mr-2 h-4 w-4" /> Filtros
        </Button>
      </div>

      <Card className="border-border bg-card/50 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Empresa & Serviço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                          {client.name.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold">{client.name}</span>
                          <span className="text-xs text-muted-foreground">{client.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{client.company}</span>
                        <span className="text-xs text-accent font-semibold">{client.service}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "font-bold uppercase text-[10px]",
                          client.status === "Ativo" ? "bg-emerald-500/10 text-emerald-500" : 
                          client.status === "Inadimplente" ? "bg-destructive/10 text-destructive" :
                          "bg-muted text-muted-foreground"
                        )}
                      >
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {client.createdAt}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-popover border-border">
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer">
                            <Building2 className="mr-2 h-4 w-4" /> Ver Perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Nenhum cliente encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ")
}