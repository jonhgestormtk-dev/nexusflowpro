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
  CheckCircle2
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
  addDocumentNonBlocking 
} from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"
import { cn } from "@/lib/utils"

export default function ContractsPage() {
  const { toast } = useToast()
  const db = useFirestore()
  const [isUploading, setIsUploading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [extractedData, setExtractedData] = React.useState<AIContractDetailExtractorOutput | null>(null)
  const [open, setOpen] = React.useState(false)

  // Fetch real contracts
  const contractsQuery = useMemoFirebase(() => {
    return query(collection(db, "contracts"), orderBy("createdAt", "desc"))
  }, [db])
  const { data: contracts, isLoading } = useCollection(contractsQuery)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async () => {
        const dataUri = reader.result as string
        const result = await extractContractDetails({ pdfDataUri: dataUri })
        setExtractedData(result)
        setIsUploading(false)
        toast({
          title: "Análise Concluída",
          description: "Os dados do contrato foram extraídos com inteligência artificial.",
        })
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error processing contract:", error)
      setIsUploading(false)
      toast({
        variant: "destructive",
        title: "Erro ao processar",
        description: "Não foi possível analisar este PDF. Tente novamente.",
      })
    }
  }

  const handleSaveContract = () => {
    if (!extractedData) return
    setIsSaving(true)

    const newContract = {
      clientName: extractedData.clientName,
      serviceType: extractedData.serviceType,
      monthlyValue: extractedData.monthlyValue,
      startDate: extractedData.startDate,
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
          description: "O contrato foi salvo com sucesso no banco de dados.",
        })
      })
      .catch(() => {
        setIsSaving(false)
        toast({
          variant: "destructive",
          title: "Erro ao salvar",
          description: "Não foi possível registrar o contrato.",
        })
      })
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Contratos</h1>
          <p className="text-muted-foreground">Ciclo de vida, renovações e automação de documentos.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Novo Contrato
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] bg-card border-border">
            <DialogHeader>
              <DialogTitle>Novo Contrato Inteligente</DialogTitle>
              <DialogDescription>
                Faça o upload do PDF para que nossa IA preencha os dados automaticamente.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {!extractedData ? (
                <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center gap-4 bg-muted/20 relative">
                  <div className={cn("p-4 rounded-full bg-primary/10", isUploading && "animate-pulse")}>
                    {isUploading ? <Loader2 className="h-8 w-8 text-primary animate-spin" /> : <FileUp className="h-8 w-8 text-primary" />}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">{isUploading ? "Analisando Contrato..." : "Clique para selecionar o PDF"}</p>
                    <p className="text-xs text-muted-foreground">Arquivos suportados: PDF (max 10MB)</p>
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
                    <Sparkles className="h-3 w-3" /> DADOS EXTRAÍDOS COM SUCESSO
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Cliente</Label>
                      <Input value={extractedData.clientName} readOnly className="bg-muted/50" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Tipo de Serviço</Label>
                      <Input value={extractedData.serviceType} readOnly className="bg-muted/50" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Valor Mensal</Label>
                      <Input value={`R$ ${extractedData.monthlyValue}`} readOnly className="bg-muted/50" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Início</Label>
                      <Input value={extractedData.startDate} readOnly className="bg-muted/50" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {setExtractedData(null); setOpen(false)}}>Cancelar</Button>
              <Button disabled={!extractedData || isSaving} onClick={handleSaveContract}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Confirmar Registro
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p className="text-muted-foreground">Carregando seus contratos...</p>
          </div>
        ) : contracts && contracts.length > 0 ? (
          contracts.map((contract) => (
            <Card key={contract.id} className="card-hover bg-card/50 border-border overflow-hidden group">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[10px] font-black tracking-widest",
                      contract.status === "Ativo" ? "border-emerald-500/30 text-emerald-500" : "border-destructive/30 text-destructive"
                    )}
                  >
                    {contract.status.toUpperCase()}
                  </Badge>
                  <span className="text-[10px] font-bold text-muted-foreground">ID: {contract.id.slice(-6)}</span>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors truncate">{contract.clientName}</CardTitle>
                <CardDescription className="truncate">{contract.serviceType}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-center justify-between py-2 border-y border-border">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-bold">R$ {contract.monthlyValue}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{contract.startDate}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-muted-foreground">SCORE DE SAÚDE</span>
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

                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  Ver Documentação <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-xl">
             <p className="text-muted-foreground">Nenhum contrato encontrado. Use a IA para cadastrar o primeiro!</p>
          </div>
        )}
      </div>
    </div>
  )
}
