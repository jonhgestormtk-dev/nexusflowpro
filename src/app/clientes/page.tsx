
"use client"

import * as React from "react"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Building2,
  Trash2,
  Edit,
  Loader2,
  CheckCircle2
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase, 
  useUser,
  addDocumentNonBlocking,
  deleteDocumentNonBlocking
} from "@/firebase"
import { collection, query, orderBy, doc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function ClientsPage() {
  const { toast } = useToast()
  const db = useFirestore()
  const { user } = useUser()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  // Firestore Realtime Collection - Espera o usuário estar logado
  const clientsQuery = useMemoFirebase(() => {
    if (!user) return null
    return query(collection(db, "clients"), orderBy("createdAt", "desc"))
  }, [db, user])

  const { data: clients, isLoading } = useCollection(clientsQuery)

  const filteredClients = React.useMemo(() => {
    if (!clients) return []
    return clients.filter(c => 
      c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [clients, searchTerm])

  const handleCreateClient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    const formData = new FormData(e.currentTarget)
    
    const newClient = {
      fullName: formData.get("fullName") as string,
      companyName: formData.get("companyName") as string,
      documentNumber: formData.get("documentNumber") as string,
      email: formData.get("email") as string,
      whatsapp: formData.get("whatsapp") as string,
      status: "Ativo",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      address: formData.get("address") as string || "N/A",
      city: formData.get("city") as string || "N/A",
      state: formData.get("state") as string || "N/A",
      zipCode: formData.get("zipCode") as string || "N/A",
    }

    addDocumentNonBlocking(collection(db, "clients"), newClient)
      .then(() => {
        setIsSaving(false)
        setIsDialogOpen(false)
        toast({
          title: "Cliente cadastrado",
          description: `${newClient.fullName} foi adicionado com sucesso.`,
        })
      })
      .catch(() => {
        setIsSaving(false)
        toast({
          variant: "destructive",
          title: "Erro ao cadastrar",
          description: "Não foi possível salvar o cliente.",
        })
      })
  }

  const handleDeleteClient = (id: string, name: string) => {
    deleteDocumentNonBlocking(doc(db, "clients", id))
    toast({
      title: "Cliente removido",
      description: `${name} foi excluído do sistema.`,
    })
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Clientes</h1>
          <p className="text-muted-foreground">Gerencie sua base de clientes e acompanhe o relacionamento.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] bg-card border-border">
            <form onSubmit={handleCreateClient}>
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
                <DialogDescription>
                  Preencha as informações básicas para registrar o cliente no NexusFlow Pro.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input id="fullName" name="fullName" placeholder="Ex: João Silva" required className="bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Empresa</Label>
                    <Input id="companyName" name="companyName" placeholder="Nome Fantasia" required className="bg-muted/30" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" name="email" type="email" placeholder="contato@empresa.com" required className="bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input id="whatsapp" name="whatsapp" placeholder="(00) 00000-0000" className="bg-muted/30" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="documentNumber">CPF/CNPJ</Label>
                    <Input id="documentNumber" name="documentNumber" placeholder="Documento do cliente" required className="bg-muted/30" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">CEP</Label>
                    <Input id="zipCode" name="zipCode" placeholder="00000-000" className="bg-muted/30" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input id="address" name="address" placeholder="Rua, Número, Bairro" className="bg-muted/30" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                  Confirmar Cadastro
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
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
                <TableHead>Empresa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-muted-foreground font-medium">Carregando clientes...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                          {client.fullName?.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold">{client.fullName}</span>
                          <span className="text-xs text-muted-foreground">{client.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{client.companyName}</span>
                        <span className="text-[10px] text-accent font-bold uppercase tracking-wider">{client.documentNumber}</span>
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
                        {client.status || "Ativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {client.createdAt ? new Date(client.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
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
                          <DropdownMenuItem 
                            className="cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => handleDeleteClient(client.id, client.fullName)}
                          >
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
