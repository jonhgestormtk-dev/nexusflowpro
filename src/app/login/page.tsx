
"use client"

import * as React from "react"
import { ShieldCheck, Mail, Lock, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/firebase"
import { initiateEmailSignIn } from "@/firebase/non-blocking-login"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const auth = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      initiateEmailSignIn(auth, email, password)
      // O estado de carregamento será limpo pelo listener global de auth no layout
      // Mas podemos adicionar um timeout curto ou feedback
      toast({
        title: "Aguardando autenticação",
        description: "Verificando suas credenciais no servidor...",
      })
    } catch (error: any) {
      setIsLoading(false)
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: error.message || "Verifique seus dados e tente novamente.",
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-[400px] border-border bg-card/50 backdrop-blur-xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
        <CardHeader className="space-y-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mx-auto shadow-lg shadow-primary/30">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-black tracking-tight">NexusFlow Pro</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">
              Entre para gerenciar sua operação digital
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail Corporativo</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="nome@empresa.com" 
                  className="pl-10 bg-muted/30 border-border"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Button variant="link" className="px-0 font-bold text-xs text-accent">Esqueceu a senha?</Button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="password" 
                  type="password" 
                  className="pl-10 bg-muted/30 border-border"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90 font-bold h-11 text-lg shadow-lg shadow-primary/20" 
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Acessar Plataforma"}
            </Button>
            <p className="text-xs text-center text-muted-foreground font-medium">
              Ao entrar, você concorda com nossos <span className="text-accent cursor-pointer hover:underline">Termos de Serviço</span>.
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
