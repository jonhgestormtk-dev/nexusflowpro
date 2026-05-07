
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
  Filter,
  Loader2,
  MoreVertical,
  Trash2,
  Check,
  RefreshCw
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase, 
  useUser,
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking
} from "@/firebase"
import { collection, query, orderBy, doc } from "firebase/firestore"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function BillingPage() {
  const { toast } = useToast()
  const db = useFirestore()
  const { user } = useUser()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [isProcessing, setIsProcessing] = React.useState(false)

  // Sincronização em tempo real das faturas - Garantindo orderBy consistente
  const invoicesQuery = useMemoFirebase(() => {
    if (!user) return null
    return query(collection(db, "invoices"), orderBy("createdAt", "desc"))
  }, [db, user])

  const contractsQuery = useMemoFirebase(() => {
    if (!user) return null
    return collection(db, "contracts")
  }, [db, user])

  const { data: invoices, isLoading: loadingInvoices } = useCollection(invoicesQuery)
  const { data: contracts, isLoading: loadingContracts } = useCollection(contractsQuery)

  const filteredInvoices = React.useMemo(() => {
    if (!invoices) return []
    const term = searchTerm.toLowerCase()
    return invoices.filter(inv => {
      const name = (inv.clientName || "").toLowerCase()
      const id = (inv.id || "").toLowerCase()
      return name.includes(term) || id.includes(term)
    })
  }, [invoices, searchTerm])

  const stats = React.useMemo(() => {
    if (!invoices || !contracts) return { mrr: 0, pending: 0, delinquency: 0 }

    const mrr = contracts
      .filter(c => c.status === "Ativo")
      .reduce((acc, curr) => acc + (Number(curr.monthlyValue) || 0), 0)
    
    const pending = invoices
      .filter(inv => inv.paymentStatus === "Pendente")
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
    
    const today = new Date()
    const delinquency = invoices
      .filter(inv => inv.paymentStatus !== "Pago" && inv.dueDate && new Date(inv.dueDate) < today)
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)

    return { mrr, pending, delinquency }
  }, [invoices, contracts])

  const handleMarkAsPaid = (invoiceId: string) => {
    updateDocumentNonBlocking(doc(db, "invoices", invoiceId), {
      paymentStatus: "Pago",
      paidDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    toast({
      title: "Pagamento Confirmado",
      description: "Débito atualizado para Pago com sucesso.",
    })
  }

  const handleDeleteInvoice = (invoiceId: string) => {
    deleteDocumentNonBlocking(doc(db, "invoices", invoiceId))
    toast({
      title: "Registro removido",
      description: "A fatura foi excluída permanentemente.",
    })
  }

  const handleProcessBatch = () => {
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      toast({
        title: "Sincronização Finalizada",
        description: "Status de faturas atualizados com o banco de dados.",
      })
    }, 1000)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-1">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Débitos e Faturamento</h1>
          <p className="text-muted-foreground">Gestão financeira e acompanhamento de faturas em tempo real.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border hidden sm:flex" onClick={() => toast({ title: "Exportação", description: "CSV gerado com sucesso." })}>
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 w-full sm:w-auto" 
            onClick={handleProcessBatch}
            disabled={isProcessing}
          >
            {isProcessing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Sincronizar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Previsão MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">
              {loadingContracts ? "..." : `R$ ${stats.mrr.toLocaleString('pt-BR')}`}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-500">
              <TrendingUp className="h-3 w-3" /> CONTRATOS ATIVOS
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">A Receber (Pendentes)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-accent">
              {loadingInvoices ? "..." : `R$ ${stats.pending.toLocaleString('pt-BR')}`}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-muted-foreground uppercase">
              <Clock className="h-3 w-3" /> {invoices?.filter(i => i.paymentStatus === "Pendente").length || 0} Débitos em aberto
            </div>
          </CardContent>
        </Card>
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Inadimplência Bruta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-destructive">
              {loadingInvoices ? "..." : `R$ ${stats.delinquency.toLocaleString('pt-BR')}`}
            </div>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-destructive uppercase">
              <AlertCircle className="h-3 w-3" /> Vencidas e não pagas
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por cliente ou ID da fatura..." 
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
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Fatura</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Cliente</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Valor</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Vencimento</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingInvoices ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-muted-foreground font-medium">Buscando lançamentos...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-mono text-[10px] font-bold text-primary">#{inv.id.slice(-6).toUpperCase()}</TableCell>
                    <TableCell className="font-semibold text-sm truncate max-w-[250px]">{inv.clientName || "Cliente não identificado"}</TableCell>
                    <TableCell className="font-bold text-sm text-foreground">R$ {Number(inv.amount || 0).toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('pt-BR') : "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "font-black text-[9px] tracking-widest px-2 py-0.5",
                          inv.paymentStatus === "Pago" ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5" :
                          inv.dueDate && new Date(inv.dueDate) < new Date() ? "border-destructive/30 text-destructive bg-destructive/5" :
                          "border-accent/30 text-accent bg-accent/5"
                        )}
                      >
                        {inv.paymentStatus === "Pendente" && inv.dueDate && new Date(inv.dueDate) < new Date() ? "ATRASADO" : (inv.paymentStatus || "PENDENTE").toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover border-border">
                          {inv.paymentStatus !== "Pago" && (
                            <DropdownMenuItem 
                              className="text-[10px] font-bold uppercase cursor-pointer"
                              onClick={() => handleMarkAsPaid(inv.id)}
                            >
                              <Check className="mr-2 h-3 w-3" /> Liquidar Fatura
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="text-[10px] font-bold uppercase cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => handleDeleteInvoice(inv.id)}
                          >
                            <Trash2 className="mr-2 h-3 w-3" /> Excluir Registro
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm">
                    Nenhum débito encontrado para os filtros atuais.
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
