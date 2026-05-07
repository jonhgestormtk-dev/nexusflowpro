
"use client"

import * as React from "react"
import { 
  Plus, 
  MoreVertical, 
  Mail, 
  Phone, 
  MessageSquare,
  UserPlus,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Trash2,
  Search,
  Filter
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase, 
  useUser,
  addDocumentNonBlocking,
  updateDocumentNonBlocking,
  deleteDocumentNonBlocking
} from "@/firebase"
import { collection, query, orderBy, doc, where } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

const stages = [
  { id: "new", name: "Novos Leads", color: "bg-blue-500" },
  { id: "contacted", name: "Em Contato", color: "bg-amber-500" },
  { id: "qualified", name: "Qualificados", color: "bg-indigo-500" },
  { id: "proposal", name: "Proposta", color: "bg-purple-500" }
]

export default function CRMPage() {
  const { toast } = useToast()
  const db = useFirestore()
  const { user } = useUser()
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [selectedLead, setSelectedLead] = React.useState<any>(null)
  const [isSaving, setIsSaving] = React.useState(false)

  // Query de Leads
  const leadsQuery = useMemoFirebase(() => {
    if (!user) return null
    return query(collection(db, "crmLeads"), orderBy("createdAt", "desc"))
  }, [db, user])

  const { data: leads, isLoading } = useCollection(leadsQuery)

  const handleOpenCreate = () => {
    setSelectedLead(null)
    setIsDialogOpen(true)
  }

  const handleOpenEdit = (lead: any) => {
    setSelectedLead(lead)
    setIsDialogOpen(true)
  }

  const handleSaveLead = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    const formData = new FormData(e.currentTarget)
    const leadData = {
      fullName: formData.get("fullName") as string,
      companyName: formData.get("companyName") as string,
      email: formData.get("email") as string,
      whatsapp: formData.get("whatsapp") as string || "",
      pipelineStage: selectedLead?.pipelineStage || "new",
      status: selectedLead?.status || "Novo",
      assignedToUserId: user?.uid,
      assignedToUserFullName: user?.displayName || user?.email,
      updatedAt: new Date().toISOString(),
    }

    try {
      if (selectedLead) {
        updateDocumentNonBlocking(doc(db, "crmLeads", selectedLead.id), leadData)
        toast({ title: "Lead atualizado", description: "As informações foram salvas com sucesso." })
      } else {
        const newLead = { ...leadData, createdAt: new Date().toISOString() }
        addDocumentNonBlocking(collection(db, "crmLeads"), newLead)
        toast({ title: "Lead cadastrado", description: "O novo lead foi adicionado ao pipeline." })
      }
      setIsDialogOpen(false)
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar o lead." })
    } finally {
      setIsSaving(false)
    }
  }

  const handleMoveStage = (leadId: string, newStage: string) => {
    updateDocumentNonBlocking(doc(db, "crmLeads", leadId), {
      pipelineStage: newStage,
      updatedAt: new Date().toISOString()
    })
    toast({ title: "Estágio alterado", description: "Lead movido com sucesso." })
  }

  const handleDeleteLead = (id: string) => {
    deleteDocumentNonBlocking(doc(db, "crmLeads", id))
    toast({ title: "Lead removido", description: "O registro foi excluído do CRM." })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 flex flex-col h-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Pipeline de Vendas</h1>
          <p className="text-sm text-muted-foreground">Gerencie seus leads e negociações em tempo real.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-primary hover:bg-primary/90 w-full sm:w-auto font-bold shadow-lg shadow-primary/20">
          <UserPlus className="mr-2 h-4 w-4" /> Novo Lead
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto pb-6 -mx-1 px-1 scrollbar-hide">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sincronizando Leads...</p>
          </div>
        ) : (
          <div className="flex gap-4 min-w-max">
            {stages.map((stage) => (
              <div key={stage.id} className="w-[280px] md:w-[320px] space-y-4">
                <div className="flex items-center justify-between px-3 bg-muted/10 py-2.5 rounded-xl border border-border/50">
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", stage.color)} />
                    <h3 className="font-black text-[10px] uppercase tracking-wider truncate">{stage.name}</h3>
                    <Badge variant="secondary" className="text-[10px] px-1.5 font-black bg-primary/10 text-primary border-none">
                      {leads?.filter(l => l.pipelineStage === stage.id).length || 0}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  {leads?.filter(l => l.pipelineStage === stage.id).map((lead) => (
                    <Card 
                      key={lead.id} 
                      className="bg-card/50 border-border card-hover cursor-pointer group"
                      onClick={() => handleOpenEdit(lead)}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 overflow-hidden">
                            <p className="font-bold text-sm leading-none group-hover:text-primary transition-colors truncate">{lead.fullName}</p>
                            <p className="text-[10px] font-medium text-muted-foreground truncate uppercase tracking-tighter">{lead.companyName}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={(e) => e.stopPropagation()}>
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                              <DropdownMenuItem className="text-[10px] font-bold uppercase" onClick={(e) => { e.stopPropagation(); handleOpenEdit(lead); }}>Editar</DropdownMenuItem>
                              <DropdownMenuSeparator className="opacity-10" />
                              <DropdownMenuItem className="text-[10px] font-bold uppercase text-destructive focus:text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteLead(lead.id); }}>Excluir</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/50">
                          <span className="text-[10px] font-black text-accent uppercase tracking-widest">{lead.status || "NOVO"}</span>
                          <span className="text-[9px] text-muted-foreground font-medium">
                            {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('pt-BR') : 'Recente'}
                          </span>
                        </div>

                        <div className="flex gap-1.5">
                          <Button variant="outline" size="icon" className="h-7 w-7 rounded-full border-border/50 bg-muted/20" onClick={(e) => e.stopPropagation()}>
                            <Phone className="h-3 w-3" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-7 w-7 rounded-full border-border/50 bg-muted/20" onClick={(e) => e.stopPropagation()}>
                            <Mail className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="ml-auto h-7 px-2 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentIndex = stages.findIndex(s => s.id === stage.id);
                              if (currentIndex < stages.length - 1) {
                                handleMoveStage(lead.id, stages[currentIndex + 1].id);
                              }
                            }}
                          >
                            Mover <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Button 
                    variant="ghost" 
                    onClick={handleOpenCreate}
                    className="w-full border-2 border-dashed border-border h-14 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-muted/20 rounded-xl"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Novo Lead {stage.name}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px] bg-card border-border">
          <form onSubmit={handleSaveLead}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{selectedLead ? "Editar Lead" : "Novo Lead"}</DialogTitle>
              <DialogDescription className="text-xs">
                Preencha os dados do potencial cliente para iniciar a jornada.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-6">
              <div className="grid gap-2">
                <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-widest">Nome Completo</Label>
                <Input id="fullName" name="fullName" defaultValue={selectedLead?.fullName} required className="bg-muted/30" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="companyName" className="text-xs font-bold uppercase tracking-widest">Empresa</Label>
                <Input id="companyName" name="companyName" defaultValue={selectedLead?.companyName} required className="bg-muted/30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest">E-mail</Label>
                  <Input id="email" name="email" type="email" defaultValue={selectedLead?.email} required className="bg-muted/30" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="whatsapp" className="text-xs font-bold uppercase tracking-widest">WhatsApp</Label>
                  <Input id="whatsapp" name="whatsapp" defaultValue={selectedLead?.whatsapp} className="bg-muted/30" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancelar</Button>
              <Button type="submit" className="bg-primary font-bold" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                {selectedLead ? "Salvar Alterações" : "Cadastrar Lead"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("h-px bg-muted my-1", className)} />
}
