
"use client"

import * as React from "react"
import { 
  Building2, 
  Mail, 
  CreditCard, 
  Save, 
  Loader2, 
  CheckCircle2, 
  Image as ImageIcon,
  ShieldCheck,
  Globe,
  Smartphone
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { 
  useDoc, 
  useFirestore, 
  useMemoFirebase, 
  useUser,
  setDocumentNonBlocking 
} from "@/firebase"
import { doc } from "firebase/firestore"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const { toast } = useToast()
  const db = useFirestore()
  const { user } = useUser()
  const [isSaving, setIsSaving] = React.useState(false)

  // Documento fixo de configurações da empresa
  const settingsRef = useMemoFirebase(() => {
    return doc(db, "companySettings", "companyProfile")
  }, [db])

  const { data: settings, isLoading } = useDoc(settingsRef)

  const handleSaveSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    const formData = new FormData(e.currentTarget)
    const updatedSettings = {
      id: "companyProfile",
      companyName: formData.get("companyName") as string,
      taxId: formData.get("taxId") as string,
      address: formData.get("address") as string,
      emailSenderName: formData.get("emailSenderName") as string,
      emailSenderAddress: formData.get("emailSenderAddress") as string,
      emailSignature: formData.get("emailSignature") as string,
      billingExternalSetupDetails: formData.get("billingDetails") as string,
      updatedAt: new Date().toISOString(),
      createdAt: settings?.createdAt || new Date().toISOString()
    }

    try {
      setDocumentNonBlocking(settingsRef, updatedSettings, { merge: true })
      toast({
        title: "Configurações Salvas",
        description: "As alterações globais da plataforma foram atualizadas.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar",
        description: "Não foi possível atualizar as configurações.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
          Carregando preferências...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1 px-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Configurações do Sistema</h1>
        <p className="text-muted-foreground">Gerencie a identidade e as regras de negócio da sua plataforma.</p>
      </div>

      <form onSubmit={handleSaveSettings}>
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted/20 border border-border p-1 rounded-xl">
            <TabsTrigger value="profile" className="rounded-lg font-bold text-[10px] uppercase tracking-widest gap-2">
              <Building2 className="h-3 w-3" /> Perfil Empresa
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg font-bold text-[10px] uppercase tracking-widest gap-2">
              <Mail className="h-3 w-3" /> E-mails & Notificações
            </TabsTrigger>
            <TabsTrigger value="billing" className="rounded-lg font-bold text-[10px] uppercase tracking-widest gap-2">
              <CreditCard className="h-3 w-3" /> Faturamento & PIX
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6 animate-in slide-in-from-left-2 duration-300">
            <Card className="border-border bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Informações Institucionais</CardTitle>
                <CardDescription className="text-xs">Dados básicos que aparecerão em contratos e faturas.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="text-[10px] font-black uppercase tracking-widest">Razão Social / Nome Fantasia</Label>
                    <Input 
                      id="companyName" 
                      name="companyName" 
                      defaultValue={settings?.companyName} 
                      placeholder="NexusFlow Pro LTDA"
                      className="bg-muted/30 border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId" className="text-[10px] font-black uppercase tracking-widest">CNPJ</Label>
                    <Input 
                      id="taxId" 
                      name="taxId" 
                      defaultValue={settings?.taxId} 
                      placeholder="00.000.000/0001-00"
                      className="bg-muted/30 border-border"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest">Endereço Completo</Label>
                  <Input 
                    id="address" 
                    name="address" 
                    defaultValue={settings?.address} 
                    placeholder="Rua Exemplo, 123 - Centro, São Paulo/SP"
                    className="bg-muted/30 border-border"
                    required
                  />
                </div>
                <div className="pt-4 border-t border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-2xl bg-primary/10 border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-primary/20 transition-colors">
                      <ImageIcon className="h-6 w-6 text-primary" />
                      <span className="text-[8px] font-black uppercase tracking-tighter text-primary">Alterar Logo</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold">Logotipo da Plataforma</h4>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Recomendado: SVG ou PNG transparente (512x512px)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 animate-in slide-in-from-left-2 duration-300">
            <Card className="border-border bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Configuração de Envio</CardTitle>
                <CardDescription className="text-xs">Defina como seus clientes recebem comunicações automáticas.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailSenderName" className="text-[10px] font-black uppercase tracking-widest">Nome do Remetente</Label>
                    <Input 
                      id="emailSenderName" 
                      name="emailSenderName" 
                      defaultValue={settings?.emailSenderName} 
                      placeholder="Faturamento NexusFlow"
                      className="bg-muted/30 border-border"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailSenderAddress" className="text-[10px] font-black uppercase tracking-widest">E-mail de Resposta</Label>
                    <Input 
                      id="emailSenderAddress" 
                      name="emailSenderAddress" 
                      type="email"
                      defaultValue={settings?.emailSenderAddress} 
                      placeholder="financeiro@nexusflow.pro"
                      className="bg-muted/30 border-border"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailSignature" className="text-[10px] font-black uppercase tracking-widest">Assinatura Padrão</Label>
                  <Textarea 
                    id="emailSignature" 
                    name="emailSignature" 
                    defaultValue={settings?.emailSignature} 
                    placeholder="Atenciosamente, Equipe NexusFlow Pro"
                    className="bg-muted/30 border-border min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6 animate-in slide-in-from-left-2 duration-300">
            <Card className="border-border bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Dados de Recebimento</CardTitle>
                <CardDescription className="text-xs">Configure as chaves e instruções para pagamentos via PIX ou Boleto.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="billingDetails" className="text-[10px] font-black uppercase tracking-widest">Chave PIX e Instruções de Depósito</Label>
                  <Textarea 
                    id="billingDetails" 
                    name="billingDetails" 
                    defaultValue={settings?.billingExternalSetupDetails} 
                    placeholder="Chave PIX (CNPJ): 00.000.000/0001-00&#10;Banco: Exemplo S.A.&#10;Agência: 0001 | Conta: 12345-6"
                    className="bg-muted/30 border-border min-h-[120px]"
                  />
                </div>
                <div className="p-4 rounded-xl bg-accent/5 border border-accent/20 flex gap-3">
                  <ShieldCheck className="h-5 w-5 text-accent shrink-0" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-accent">Aviso de Segurança</p>
                    <p className="text-[10px] text-muted-foreground">Estes detalhes serão exibidos em todas as faturas geradas pela plataforma para seus clientes.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border shadow-lg">
            <div className="hidden md:block">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Alterações Ativas</p>
              <p className="text-xs font-medium">As mudanças afetam toda a base de usuários do sistema.</p>
            </div>
            <Button 
              type="submit" 
              className="w-full md:w-auto bg-primary hover:bg-primary/90 font-bold px-8"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </Tabs>
      </form>
    </div>
  )
}
