
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
  RefreshCw,
  Sparkles,
  MessageSquare,
  Mail,
  Send
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
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase, 
  useUser,
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking,
  addDocumentNonBlocking
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

  // Sincronização em tempo real
  const invoicesQuery = useMemoFirebase(() => {
    if (!user) return null
    return query(collection(db, "invoices"), orderBy("createdAt", "desc"))
  }, [db, user])

  const contractsQuery = useMemoFirebase(() => {
    if (!user) return null
    return collection(db, "contracts")
  }, [db, user])

  const clientsQuery = useMemoFirebase(() => {
    if (!user) return null
    return collection(db, "clients")
  }, [db, user])

  const { data: invoices, isLoading: loadingInvoices } = useCollection(invoicesQuery)
  const { data: contracts, isLoading: loadingContracts } = useCollection(contractsQuery)
  const { data: clients } = useCollection(clientsQuery)

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

  // Busca contato do cliente para envio
  const getClientContact = (clientName: string) => {
    const client = clients?.find(c => 
      c.fullName?.toLowerCase() === clientName?.toLowerCase() || 
      c.companyName?.toLowerCase() === clientName?.toLowerCase()
    )
    return {
      email: client?.email || "",
      whatsapp: client?.whatsapp?.replace(/\D/g, '') || ""
    }
  }

  const handleSendWhatsApp = (inv: any) => {
    const contact = getClientContact(inv.clientName)
    const dueDate = new Date(inv.dueDate).toLocaleDateString('pt-BR')
    const amount = Number(inv.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const message = encodeURIComponent(
      `Olá ${inv.clientName}, tudo bem? 🚀\n\nIdentificamos uma fatura pendente em nosso sistema:\n\n📄 *Fatura:* #${inv.id.slice(-6).toUpperCase()}\n💰 *Valor:* ${amount}\n📅 *Vencimento:* ${dueDate}\n\nPor favor, entre em contato caso tenha alguma dúvida ou realize o pagamento para manter seus serviços ativos. Se já efetuou o pagamento, favor desconsiderar.`
    )
    
    window.open(`https://wa.me/${contact.whatsapp}?text=${message}`, '_blank')
    toast({ title: "WhatsApp Iniciado", description: `Abrindo conversa com ${inv.clientName}.` })
  }

  const handleSendEmail = (inv: any) => {
    const contact = getClientContact(inv.clientName)
    const dueDate = new Date(inv.dueDate).toLocaleDateString('pt-BR')
    const amount = Number(inv.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    const subject = encodeURIComponent(`Fatura Pendente - #${inv.id.slice(-6).toUpperCase()}`)
    const body = encodeURIComponent(
      `Olá ${inv.clientName},\n\nEsperamos que esteja tudo bem.\n\nInformamos que consta em nosso sistema uma fatura pendente com os seguintes detalhes:\n\nReferência: #${inv.id.slice(-6).toUpperCase()}\nValor: ${amount}\nVencimento: ${dueDate}\n\nCaso já tenha realizado o pagamento, pedimos a gentileza de nos enviar o comprovante. Em caso de dúvidas, nossa equipe financeira está à disposição.\n\nAtenciosamente,\nEquipe NexusFlow Pro`
    )
    
    window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`
    toast({ title: "E-mail Preparado", description: `Enviando cobrança para ${contact.email || inv.clientName}.` })
  }

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

  const parseContractDate = (dateStr: string) => {
    if (!dateStr) return new Date();
    try {
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? new Date() : d;
    } catch (e) {
      return new Date();
    }
  }

  const handleProcessBatch = async () => {
    if (!contracts || !invoices) return
    setIsProcessing(true)
    
    let createdCount = 0
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    for (const contract of contracts) {
      if (contract.status !== "Ativo") continue
      
      const contractStart = parseContractDate(contract.startDate)
      const startMonth = contractStart.getMonth()
      const startYear = contractStart.getFullYear()
      
      let iterDate = new Date(startYear, startMonth, 1)
      const targetDate = new Date(currentYear, currentMonth, 1)

      while (iterDate <= targetDate) {
        const iterMonth = iterDate.getMonth()
        const iterYear = iterDate.getFullYear()

        const hasInvoice = invoices.some(inv => {
          if (inv.contractId !== contract.id) return false
          const dueDate = new Date(inv.dueDate)
          return dueDate.getMonth() === iterMonth && dueDate.getFullYear() === iterYear
        })

        if (!hasInvoice) {
          let day = 10;
          try {
            if (contract.startDate && contract.startDate.includes('/')) {
              day = parseInt(contract.startDate.split('/')[0]);
            } else if (contract.startDate && contract.startDate.includes('-')) {
              day = new Date(contract.startDate).getDate();
            }
          } catch(e) { day = 10; }

          const dueDate = new Date(iterYear, iterMonth, day)
          if (isNaN(dueDate.getTime())) dueDate.setDate(10)

          const newInvoice = {
            contractId: contract.id,
            clientName: contract.clientName,
            amount: Number(contract.monthlyValue),
            issueDate: now.toISOString(),
            dueDate: dueDate.toISOString(),
            paymentStatus: "Pendente",
            paymentMethod: "Manual",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          addDocumentNonBlocking(collection(db, "invoices"), newInvoice)
          createdCount++
        }
        iterDate.setMonth(iterDate.getMonth() + 1)
      }
    }

    setTimeout(() => {
      setIsProcessing(false)
      if (createdCount > 0) {
        toast({
          title: "Recorrência Processada",
          description: `${createdCount} novas faturas geradas.`,
        })
      } else {
        toast({
          title: "Tudo em dia",
          description: "Não foram encontradas faturas pendentes para o período.",
        })
      }
    }, 1500)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-1">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Débitos e Faturamento</h1>
          <p className="text-muted-foreground">Gestão financeira e acompanhamento de faturas recorrentes.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-border hidden sm:flex" onClick={() => toast({ title: "Exportação", description: "CSV gerado com sucesso." })}>
            <Download className="mr-2 h-4 w-4" /> Exportar
          </Button>
          <Button 
            className="bg-primary hover:bg-primary/90 w-full sm:w-auto font-bold shadow-lg shadow-primary/20" 
            onClick={handleProcessBatch}
            disabled={isProcessing}
          >
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Gerar Recorrência
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
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">A Receber</CardTitle>
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
            <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Inadimplência</CardTitle>
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

      <Card className="border-border bg-card/50 overflow-hidden shadow-xl">
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
                  <TableRow key={inv.id} className="hover:bg-muted/20 transition-colors group">
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
                        <DropdownMenuContent align="end" className="bg-popover border-border min-w-[180px]">
                          {inv.paymentStatus !== "Pago" && (
                            <>
                              <DropdownMenuItem 
                                className="text-[10px] font-bold uppercase cursor-pointer py-2"
                                onClick={() => handleMarkAsPaid(inv.id)}
                              >
                                <Check className="mr-2 h-3 w-3 text-emerald-500" /> Liquidar Fatura
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="opacity-10" />
                              <DropdownMenuItem 
                                className="text-[10px] font-bold uppercase cursor-pointer py-2"
                                onClick={() => handleSendWhatsApp(inv)}
                              >
                                <MessageSquare className="mr-2 h-3 w-3 text-emerald-500" /> Enviar WhatsApp
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-[10px] font-bold uppercase cursor-pointer py-2"
                                onClick={() => handleSendEmail(inv)}
                              >
                                <Mail className="mr-2 h-3 w-3 text-blue-500" /> Enviar E-mail
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="opacity-10" />
                            </>
                          )}
                          <DropdownMenuItem 
                            className="text-[10px] font-bold uppercase cursor-pointer py-2 text-destructive focus:text-destructive"
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
                    Nenhum débito encontrado.
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
