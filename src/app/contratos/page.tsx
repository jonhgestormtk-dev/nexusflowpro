
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
  AlertCircle
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
import { useToast } from "@/hooks/use-toast"
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase, 
  useUser,
  addDocumentNonBlocking 
} from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { cn } from "@/lib/utils"

export default function ContractsPage() {
  const { toast } = useToast()
  const db = useFirestore()
  const { user } = useUser()
  const [isUploading, setIsUploading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [extractedData, setExtractedData] = React.useState<AIContractDetailExtractorOutput | null>(null)
  const [open, setOpen] = React.useState(false)

  // Fetch real contracts - Espera o usuário estar logado
  const contractsQuery = useMemoFirebase(() => {
    if (!user) return null
    return query(collection(db, "contracts"), orderBy("createdAt", "desc"))
  }, [db, user])
  const { data: contracts, isLoading } = useCollection(contractsQuery)

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

    setIsUploading(true)
    const reader = new FileReader()

    reader.onerror = () => {
      setIsUploading(false)
      toast({
        variant: "destructive",
        title: "Erro na leitura",
        description: "Não foi possível ler o arquivo PDF.",
      })
    }

    reader.onload = async () => {
      try {
        const dataUri = reader.result as string
        const result = await extractContractDetails({ pdfDataUri: dataUri })
        
        if (result) {
          setExtractedData(result)
          toast({
            title: "Análise Concluída",
            description: "Os dados do contrato foram extraídos com sucesso via IA.",
          })
        }
      } catch (error) {
        console.error("Error processing contract:", error)
        toast({
          variant: "destructive",
          title: "Erro na IA",
          description: "Nossa IA não conseguiu analisar os detalhes deste contrato. Verifique o arquivo.",
        })
      } finally {
        setIsUploading(false)
      }
    }
    
    reader.readAsDataURL(file)
  }

  const handleSaveContract = () => {
    if (!extractedData) return
    setIsSaving(true)

    const newContract = {
      clientName: extractedData.clientName,
      serviceType: extractedData.serviceType,
      monthlyValue: extractedData.monthlyValue,
      startDate: extractedData.startDate,
      paymentTerms: extractedData.paymentTerms,
      status: "Ativo",
      score: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    addDocumentNonBlocking(collection(db, "contracts"), newContract)
      .then(() => {
        setIsSaving(false)
        setOpen(false)
        setExtractedData(null)
        toast({
          title: "Contrato Registrado",
          description: `O contrato para ${newContract.clientName} foi salvo com sucesso.`,
        })
      })
      .catch((err) => {
        console.error("Error saving contract:", err)
        setIsSaving(false)
        toast({
          variant: "destructive",
          title: "Erro ao salvar",
          description: "Ocorreu um problema ao registrar o contrato no banco de dados.",
        })
      })
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Contratos</h1>
          <p className="text-muted-foreground">Ciclo de vida, renovações e automação de documentos inteligente.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => {
          if (!v) setExtractedData(null);
          setOpen(v);
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
                Nossa IA analisará seu PDF para extrair valores, datas e nomes automaticamente.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {!extractedData ? (
                <div className={cn(
                  "border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center gap-4 transition-colors relative",
                  isUploading ? "bg-primary/5 border-primary/50" : "bg-muted/20 hover:bg-muted/30"
                )}>
                  <div className={cn("p-4 rounded-full bg-primary/10", isUploading && "animate-pulse")}>
                    {isUploading ? <Loader2 className="h-8 w-8 text-primary animate-spin" /> : <FileUp className="h-8 w-8 text-primary" />}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">{isUploading ? "IA Analisando Documento..." : "Clique ou arraste o PDF para selecionar"}</p>
                    <p className="text-xs text-muted-foreground">O processamento leva alguns segundos.</p>
                  </div>
                  <Input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={handleFileUpload} 
                    disabled={isUploading}
                    accept="application/pdf"
                  />
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500 text-xs font-bold">
                    <Sparkles className="h-3 w-3" /> DADOS EXTRAÍDOS COM SUCESSO PELA IA
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Cliente</Label>
                      <Input value={extractedData.clientName} readOnly className="bg-muted/50 focus-visible:ring-0" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tipo de Serviço</Label>
                      <Input value={extractedData.serviceType} readOnly className="bg-muted/50 focus-visible:ring-0" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Valor Mensal</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-xs text-muted-foreground">R$</span>
                        <Input value={extractedData.monthlyValue} readOnly className="pl-8 bg-muted/50 focus-visible:ring-0" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Início do Contrato</Label>
                      <Input value={extractedData.startDate} readOnly className="bg-muted/50 focus-visible:ring-0" />
                    </div>
                    <div className="space-y-1.5 col-span-2">
                      <Label>Termos de Pagamento</Label>
                      <Input value={extractedData.paymentTerms} readOnly className="bg-muted/50 focus-visible:ring-0" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => {setExtractedData(null); setOpen(false)}} disabled={isSaving || isUploading}>
                Cancelar
              </Button>
              <Button disabled={!extractedData || isSaving || isUploading} onClick={handleSaveContract} className="bg-primary">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Confirmar e Registrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground font-medium">Carregando seus contratos...</p>
          </div>
        ) : contracts && contracts.length > 0 ? (
          contracts.map((contract) => (
            <Card key={contract.id} className="card-hover bg-card/50 border-border overflow-hidden group">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px] font-black tracking-widest px-2",
                      contract.status === "Ativo" ? "border-emerald-500/30 text-emerald-500 bg-emerald-500/5" : "border-destructive/30 text-destructive bg-destructive/5"
                    )}
                  >
                    {contract.status.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] font-bold text-muted-foreground opacity-50"># {contract.id.slice(-6)}</span>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors truncate">{contract.clientName}</CardTitle>
                <CardDescription className="truncate font-medium">{contract.serviceType}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-center justify-between py-3 border-y border-border/50">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">VALOR MENSAL</span>
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5 text-accent" />
                      <span className="text-sm font-black">R$ {Number(contract.monthlyValue).toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5 text-right">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">INÍCIO</span>
                    <div className="flex items-center gap-1.5 justify-end">
                      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium">{new Date(contract.startDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-black tracking-widest">
                    <span className="text-muted-foreground">SCORE DE SAÚDE DO CONTRATO</span>
                    <span className={cn(contract.score > 80 ? "text-emerald-500" : "text-destructive")}>
                      {contract.score}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all duration-1000",
                        contract.score > 80 ? "bg-emerald-500" : "bg-destructive"
                      )} 
                      style={{ width: `${contract.score}%` }} 
                    />
                  </div>
                </div>

                <Button variant="outline" className="w-full h-9 text-xs font-bold border-border hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                  Ver Detalhes <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-border rounded-xl bg-muted/5">
             <div className="p-4 rounded-full bg-muted/20 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground opacity-30" />
             </div>
             <h3 className="text-lg font-bold mb-1">Nenhum contrato cadastrado</h3>
             <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">Comece agora fazendo o upload de um PDF e deixe nossa IA fazer o trabalho pesado.</p>
             <Button variant="outline" className="border-border text-xs font-bold" onClick={() => setOpen(true)}>
               <Plus className="mr-2 h-4 w-4" /> Criar Primeiro Contrato
             </Button>
          </div>
        )}
      </div>
    </div>
  )
}
