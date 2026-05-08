
"use client"

import * as React from "react"
import { 
  Plus, 
  FileUp, 
  ArrowRight,
  CalendarDays,
  CreditCard,
  Sparkles,
  Loader2,
  CheckCircle2,
  FileText,
  Trash2,
  Info,
  BadgeAlert,
  Clock,
  Edit2,
  X,
  ShieldAlert,
  Lock,
  AlertTriangle
} from "lucide-react"
import { extractContractDetails, AIContractDetailExtractorOutput } from "@/ai/flows/ai-contract-detail-extractor"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase, 
  useUser,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking
} from "@/firebase"
import { collection, query, orderBy, doc, where, getDocs } from "firebase/firestore"
import { cn } from "@/lib/utils"

export default function ContractsPage() {
  const { toast } = useToast()
  const db = useFirestore()
  const { user } = useUser()
  const [isUploading, setIsUploading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [extractedData, setExtractedData] = React.useState<AIContractDetailExtractorOutput | null>(null)
  const [isCreateOpen, setIsCreateOpen] = React.useState(false)
  
  const [selectedContract, setSelectedContract] = React.useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false)
  const [isEditing, setIsEditing] = React.useState(false)

  // Estados para segurança de exclusão
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false)
  const [contractToDeleteId, setContractToDeleteId] = React.useState<string | null>(null)
  const [adminPassword, setAdminPassword] = React.useState("")

  const contractsQuery = useMemoFirebase(() => {
    if (!user) return null
    return query(collection(db, "contracts"), orderBy("createdAt", "desc"))
  }, [db, user])
  
  const { data: contracts, isLoading } = useCollection(contractsQuery)

  // Sincronização de faturas para detecção de atrasos
  const invoicesQuery = useMemoFirebase(() => {
    if (!user) return null
    return query(collection(db, "invoices"))
  }, [db, user])

  const { data: allInvoices } = useCollection(invoicesQuery)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.type !== "application/pdf") {
      toast({
        variant: "destructive",
        title: "Arquivo inválido",
        description: "Por favor, selecione apenas arquivos PDF.",
      })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Arquivo muito grande",
        description: "O limite para análise via IA é de 2MB por arquivo.",
      })
      return
    }

    setIsUploading(true)
    const reader = new FileReader()

    reader.onload = async () => {
      try {
        const dataUri = reader.result as string
        const result = await extractContractDetails({ pdfDataUri: dataUri })
        
        if (result) {
          setExtractedData(result)
          toast({
            title: "Análise Concluída",
            description: "IA identificou os dados do contrato.",
          })
        }
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Erro na Análise",
          description: error.message || "A IA não conseguiu processar este PDF.",
        })
      } finally {
        setIsUploading(false)
        if (event.target) event.target.value = ""
      }
    }
    
    reader.readAsDataURL(file)
  }

  const parseStartDate = (dateStr: string) => {
    let date = new Date();
    try {
      if (dateStr && dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else if (dateStr && dateStr.includes('-')) {
        date = new Date(dateStr);
      }
    } catch (e) {
      return new Date();
    }
    return isNaN(date.getTime()) ? new Date() : date;
  }

  const handleSaveContract = async () => {
    if (!extractedData) return
    setIsSaving(true)

    const now = new Date();
    const startDate = parseStartDate(extractedData.startDate);
    
    let dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + 30);

    const newContract = {
      clientName: extractedData.clientName,
      serviceType: extractedData.serviceType,
      monthlyValue: Number(extractedData.monthlyValue),
      startDate: extractedData.startDate,
      paymentTerms: extractedData.paymentTerms,
      status: "Ativo",
      score: 100,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }

    try {
      const contractRef = await addDocumentNonBlocking(collection(db, "contracts"), newContract);
      
      if (contractRef) {
        const firstInvoice = {
          contractId: contractRef.id,
          clientName: newContract.clientName,
          amount: newContract.monthlyValue,
          issueDate: now.toISOString(),
          dueDate: dueDate.toISOString(),
          paymentStatus: "Pendente",
          paymentMethod: "Manual",
          createdAt: now.toISOString(),
          updatedAt: now.toISOString()
        };

        addDocumentNonBlocking(collection(db, "invoices"), firstInvoice);

        setIsSaving(false)
        setIsCreateOpen(false)
        setExtractedData(null)
        toast({
          title: "Contrato Ativado",
          description: `Débito de R$ ${newContract.monthlyValue} gerado para ${newContract.clientName}.`,
        })
      }
    } catch (err) {
      setIsSaving(false)
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível registrar o contrato.",
      })
    }
  }

  const handleUpdateContract = async () => {
    if (!selectedContract) return
    setIsSaving(true)

    const { id, ...dataToUpdate } = selectedContract
    const updatedData = {
      ...dataToUpdate,
      monthlyValue: Number(dataToUpdate.monthlyValue),
      updatedAt: new Date().toISOString()
    }

    const startDate = parseStartDate(updatedData.startDate);
    let newDueDate = new Date(startDate);
    newDueDate.setDate(newDueDate.getDate() + 30);

    updateDocumentNonBlocking(doc(db, "contracts", id), updatedData)
    
    try {
      const q = query(
        collection(db, "invoices"), 
        where("contractId", "==", id),
        where("paymentStatus", "==", "Pendente")
      );
      
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((invoiceDoc) => {
        updateDocumentNonBlocking(doc(db, "invoices", invoiceDoc.id), {
          amount: updatedData.monthlyValue,
          clientName: updatedData.clientName,
          dueDate: newDueDate.toISOString(),
          updatedAt: new Date().toISOString()
        });
      });
    } catch (e) {
      console.error("Falha ao sincronizar faturas:", e);
    }

    setIsSaving(false)
    setIsEditing(false)
    setIsDetailsOpen(false)
    toast({
      title: "Contrato Atualizado",
      description: "As alterações, valores e vencimentos foram sincronizados.",
    })
  }

  // Novo fluxo de exclusão segura
  const handleDeleteRequest = (id: string) => {
    setContractToDeleteId(id)
    setAdminPassword("")
    setIsDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = () => {
    if (adminPassword === "admin123") {
      if (contractToDeleteId) {
        deleteDocumentNonBlocking(doc(db, "contracts", contractToDeleteId))
        toast({
          title: "Contrato removido",
          description: "O registro foi excluído com sucesso por um administrador.",
        })
      }
      setIsDeleteConfirmOpen(false)
      setContractToDeleteId(null)
      setAdminPassword("")
    } else {
      toast({
        variant: "destructive",
        title: "Acesso Negado",
        description: "Senha de administrador incorreta. Operação cancelada.",
      })
    }
  }

  const openDetails = (contract: any) => {
    setSelectedContract(contract)
    setIsDetailsOpen(true)
    setIsEditing(false)
  }

  const getContractStatus = (contractId: string) => {
    if (!allInvoices) return { hasOverdue: false };
    const contractInvoices = allInvoices.filter(inv => inv.contractId === contractId);
    const now = new Date();
    const hasOverdue = contractInvoices.some(inv => 
      inv.paymentStatus !== "Pago" && 
      inv.dueDate && 
      new Date(inv.dueDate) < now
    );
    return { hasOverdue };
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Contratos</h1>
          <p className="text-muted-foreground">Ciclo de vida e automação inteligente de documentos.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(v) => {
          if (!v) setExtractedData(null);
          setIsCreateOpen(v);
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Novo Contrato
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] bg-card border-border">
            <DialogHeader>
              <DialogTitle>Novo Contrato Inteligente</DialogTitle>
              <DialogDescription>
                Selecione um PDF para que nossa IA extraia os dados automaticamente.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {!extractedData ? (
                <div className={cn(
                  "border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center gap-4 transition-colors relative overflow-hidden",
                  isUploading ? "bg-primary/5 border-primary/50 cursor-wait" : "bg-muted/20 hover:bg-muted/30 cursor-pointer"
                )}>
                  <div className={cn("p-4 rounded-full bg-primary/10", isUploading && "animate-pulse")}>
                    {isUploading ? <Loader2 className="h-8 w-8 text-primary animate-spin" /> : <FileUp className="h-8 w-8 text-primary" />}
                  </div>
                  <div className="text-center pointer-events-none">
                    <p className="text-sm font-semibold">{isUploading ? "IA Analisando Documento..." : "Clique para selecionar o PDF"}</p>
                    <p className="text-xs text-muted-foreground">O processamento pode levar alguns segundos.</p>
                  </div>
                  <Input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer z-50 h-full w-full disabled:cursor-not-allowed" 
                    onChange={handleFileUpload} 
                    disabled={isUploading}
                    accept="application/pdf"
                  />
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500 text-xs font-bold">
                    <Sparkles className="h-3 w-3" /> DADOS EXTRAÍDOS PELA IA
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Cliente</Label>
                      <Input defaultValue={extractedData.clientName} onChange={(e) => setExtractedData({...extractedData, clientName: e.target.value})} className="bg-muted/30" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tipo de Serviço</Label>
                      <Input defaultValue={extractedData.serviceType} onChange={(e) => setExtractedData({...extractedData, serviceType: e.target.value})} className="bg-muted/30" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Valor Mensal</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">R$</span>
                        <Input type="number" defaultValue={extractedData.monthlyValue} onChange={(e) => setExtractedData({...extractedData, monthlyValue: Number(e.target.value)})} className="pl-8 bg-muted/30" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Início do Contrato</Label>
                      <Input defaultValue={extractedData.startDate} onChange={(e) => setExtractedData({...extractedData, startDate: e.target.value})} className="bg-muted/30" />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <Label>Termos de Pagamento</Label>
                      <Input defaultValue={extractedData.paymentTerms} onChange={(e) => setExtractedData({...extractedData, paymentTerms: e.target.value})} className="bg-muted/30" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsCreateOpen(false)} disabled={isSaving || isUploading}>
                Cancelar
              </Button>
              {extractedData && (
                <Button disabled={isSaving} onClick={handleSaveContract} className="bg-primary">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  Confirmar e Ativar
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground font-medium">Sincronizando contratos...</p>
          </div>
        ) : contracts && contracts.length > 0 ? (
          contracts.map((contract) => {
            const { hasOverdue } = getContractStatus(contract.id);
            return (
              <Card key={contract.id} className={cn(
                "card-hover bg-card/50 border-border overflow-hidden group cursor-pointer relative",
                hasOverdue && "border-destructive/50 shadow-lg shadow-destructive/5"
              )} onClick={() => openDetails(contract)}>
                <CardHeader className="pb-2 relative">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                    onClick={(e) => { e.stopPropagation(); handleDeleteRequest(contract.id); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-2">
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-[10px] font-black tracking-widest px-2",
                          contract.status === "Ativo" ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5" : "border-destructive/30 text-destructive bg-destructive/5"
                        )}
                      >
                        {contract.status?.toUpperCase() || "ATIVO"}
                      </Badge>
                      {hasOverdue && (
                        <Badge 
                          variant="destructive" 
                          className="text-[10px] font-black tracking-widest px-2 bg-destructive/90 animate-pulse"
                        >
                          FATURA EM ATRASO
                        </Badge>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground opacity-50">#{contract.id.slice(-4)}</span>
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors truncate">{contract.clientName}</CardTitle>
                  <CardDescription className="truncate font-medium">{contract.serviceType}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  {hasOverdue && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive mb-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Ação Necessária: Pendência Financeira</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-3 border-y border-border/50">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">MENSALIDADE</span>
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="h-3.5 w-3.5 text-accent" />
                        <span className="text-sm font-black">R$ {Number(contract.monthlyValue || 0).toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5 text-right">
                      <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">INÍCIO</span>
                      <div className="flex items-center gap-1.5 justify-end">
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">{contract.startDate || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black tracking-widest">
                      <span className="text-muted-foreground">SCORE DE SAÚDE</span>
                      <span className={cn(contract.score > 80 && !hasOverdue ? "text-emerald-500" : "text-destructive")}>
                        {hasOverdue ? "Risco de Cancelamento" : `${contract.score || 0}%`}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-1000",
                          contract.score > 80 && !hasOverdue ? "bg-emerald-500" : "bg-destructive"
                        )} 
                        style={{ width: `${hasOverdue ? 30 : (contract.score || 0)}%` }} 
                      />
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-full h-9 text-xs font-bold border-border",
                      hasOverdue && "border-destructive/30 hover:bg-destructive/10 text-destructive"
                    )}
                  >
                    Ver Detalhes <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            )
          })
        ) : (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-border rounded-xl bg-muted/5">
             <div className="p-4 rounded-full bg-muted/20 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground opacity-30" />
             </div>
             <h3 className="text-lg font-bold mb-1">Nenhum contrato ativo</h3>
             <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">Inicie agora fazendo o upload de um PDF.</p>
             <Button variant="outline" className="border-border text-xs font-bold" onClick={() => setIsCreateOpen(true)}>
               <Plus className="mr-2 h-4 w-4" /> Criar Primeiro Contrato
             </Button>
          </div>
        )}
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={(v) => { if(!v) setIsEditing(false); setIsDetailsOpen(v); }}>
        <DialogContent className="sm:max-w-[600px] bg-card border-border max-h-[90vh] overflow-y-auto">
          {selectedContract && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between pr-8">
                  <div className="space-y-1">
                    <DialogTitle className="text-2xl font-bold">
                      {isEditing ? "Editar Contrato" : selectedContract.clientName}
                    </DialogTitle>
                    <DialogDescription className="font-medium text-primary">
                      {isEditing ? "Altere os campos abaixo para atualizar o contrato." : selectedContract.serviceType}
                    </DialogDescription>
                  </div>
                  {!isEditing && (
                    <div className="flex flex-col items-end gap-2">
                      <Badge 
                        className={cn(
                          "font-black tracking-widest px-3 py-1",
                          selectedContract.status === "Ativo" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"
                        )}
                      >
                        {selectedContract.status?.toUpperCase() || "ATIVO"}
                      </Badge>
                      {getContractStatus(selectedContract.id).hasOverdue && (
                        <Badge variant="destructive" className="font-black text-[10px] animate-pulse">
                          PENDÊNCIA FINANCEIRA
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </DialogHeader>
              
              <div className="grid gap-6 py-6">
                {isEditing ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome do Cliente</Label>
                        <Input 
                          value={selectedContract.clientName} 
                          onChange={(e) => setSelectedContract({...selectedContract, clientName: e.target.value})}
                          className="bg-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo de Serviço</Label>
                        <Input 
                          value={selectedContract.serviceType} 
                          onChange={(e) => setSelectedContract({...selectedContract, serviceType: e.target.value})}
                          className="bg-muted/30"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Valor Mensal (R$)</Label>
                        <Input 
                          type="number"
                          value={selectedContract.monthlyValue} 
                          onChange={(e) => setSelectedContract({...selectedContract, monthlyValue: e.target.value})}
                          className="bg-muted/30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Data de Início</Label>
                        <Input 
                          value={selectedContract.startDate} 
                          onChange={(e) => setSelectedContract({...selectedContract, startDate: e.target.value})}
                          className="bg-muted/30"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Termos de Pagamento</Label>
                      <Textarea 
                        value={selectedContract.paymentTerms} 
                        onChange={(e) => setSelectedContract({...selectedContract, paymentTerms: e.target.value})}
                        className="bg-muted/30 min-h-[100px]"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 p-4 rounded-xl bg-muted/20 border border-border/50">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CreditCard className="h-4 w-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Valor Mensal</span>
                        </div>
                        <p className="text-xl font-black">R$ {Number(selectedContract.monthlyValue || 0).toLocaleString('pt-BR')}</p>
                      </div>
                      <div className="space-y-2 p-4 rounded-xl bg-muted/20 border border-border/50">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CalendarDays className="h-4 w-4" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Início</span>
                        </div>
                        <p className="text-xl font-black">{selectedContract.startDate || "N/A"}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                       <div className="flex items-center gap-2">
                         <Info className="h-4 w-4 text-accent" />
                         <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Termos e Condições</h4>
                       </div>
                       <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {selectedContract.paymentTerms || "Nenhum termo específico detalhado."}
                          </p>
                       </div>
                    </div>

                    <div className="space-y-3">
                       <div className="flex items-center gap-2">
                         <Clock className="h-4 w-4 text-accent" />
                         <h4 className="text-xs font-black uppercase tracking-widest text-foreground">Audit Trail</h4>
                       </div>
                       <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground font-medium">Registrado em:</span>
                            <span className="font-bold">{selectedContract.createdAt ? new Date(selectedContract.createdAt).toLocaleDateString('pt-BR') : "N/A"}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-muted-foreground font-medium">Saúde do Contrato:</span>
                            <div className="flex items-center gap-2">
                              <span className={cn("font-bold", selectedContract.score > 80 && !getContractStatus(selectedContract.id).hasOverdue ? "text-emerald-500" : "text-destructive")}>
                                {getContractStatus(selectedContract.id).hasOverdue ? "Crítico (Atraso)" : `${selectedContract.score || 0}%`}
                              </span>
                            </div>
                          </div>
                       </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                {!isEditing && (
                  <Button 
                    variant="ghost" 
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteRequest(selectedContract.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Excluir Contrato
                  </Button>
                )}
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  {isEditing ? (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)} className="w-full sm:w-auto">
                        <X className="mr-2 h-4 w-4" /> Descartar
                      </Button>
                      <Button onClick={handleUpdateContract} className="bg-primary w-full sm:w-auto" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                        Salvar Alterações
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setIsDetailsOpen(false)} className="w-full sm:w-auto">
                        Fechar
                      </Button>
                      <Button onClick={() => setIsEditing(true)} className="bg-primary w-full sm:w-auto">
                        <Edit2 className="mr-2 h-4 w-4" /> Editar Contrato
                      </Button>
                    </>
                  )}
                </DialogFooter>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação com Senha */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card border-destructive/20">
          <DialogHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-2">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-bold">Autorização de Segurança</DialogTitle>
            <DialogDescription>
              Esta ação é irreversível. Para excluir este contrato, insira a senha de administrador.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminPassword">Senha do Administrador / Gerente</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="adminPassword" 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-10 bg-muted/30 border-border"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleConfirmDelete()}
                  autoFocus
                />
              </div>
              <p className="text-[10px] text-muted-foreground italic font-medium">
                * Senha padrão para este protótipo: admin123
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)} className="w-full">
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete} 
              className="w-full font-bold shadow-lg shadow-destructive/20"
              disabled={!adminPassword}
            >
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
