"use client"

import * as React from "react"
import { 
  Download, 
  Search, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Filter
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export default function BillingPage() {
  const invoices = [
    { id: "INV-2024-001", client: "Silva Tech", value: "R$ 1.200,00", due: "15/06/2024", status: "Pago", method: "Pix" },
    { id: "INV-2024-002", client: "Global Logística", value: "R$ 2.500,00", due: "01/06/2024", status: "Atrasado", method: "Boleto" },
    { id: "INV-2024-003", client: "Market Prime", value: "R$ 450,00", due: "20/06/2024", status: "Pendente", method: "Cartão" },
    { id: "INV-2024-004", client: "Eco Vida Solar", value: "R$ 3.100,00", due: "10/06/2024", status: "Pago", method: "Pix" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Faturamento & Financeiro</h1>
          <p className="text-muted-foreground">Controle de receitas recorrentes e gestão de inadimplência.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border">
            <Download className="mr-2 h-4 w-4" /> Exportar Relatórios
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
             Processar Lote
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Receita Recorrente (MRR)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">R$ 45.230,00</div>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-500">
              <TrendingUp className="h-3 w-3" /> +12.4% ESTE MÊS
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-accent">R$ 5.480,00</div>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-muted-foreground">
              <Clock className="h-3 w-3" /> 12 FATURAS EM ABERTO
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Inadimplência</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-destructive">R$ 3.120,00</div>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-destructive">
              <AlertCircle className="h-3 w-3" /> 5.2% DA RECEITA TOTAL
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por cliente ou fatura..." className="pl-10 bg-card/50 border-border" />
        </div>
        <Button variant="outline" className="border-border">
          <Filter className="mr-2 h-4 w-4" /> Filtros Avançados
        </Button>
      </div>

      <Card className="border-border bg-card/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Nº Fatura</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-mono text-xs font-bold text-primary">{inv.id}</TableCell>
                  <TableCell className="font-semibold">{inv.client}</TableCell>
                  <TableCell className="font-bold">{inv.value}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{inv.due}</TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "font-black text-[10px] tracking-widest px-2 py-0.5",
                        inv.status === "Pago" ? "border-emerald-500/30 text-emerald-500" :
                        inv.status === "Atrasado" ? "border-destructive/30 text-destructive" :
                        "border-accent/30 text-accent"
                      )}
                    >
                      {inv.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-xs font-medium">
                      <CreditCard className="h-3 w-3 text-muted-foreground" />
                      {inv.method}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs font-bold text-accent">
                      DETALHES
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
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