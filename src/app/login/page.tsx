"use client"

import * as React from "react"
import { ShieldCheck, Mail, Lock, Loader2, UserPlus, LogIn } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth, useFirestore, setDocumentNonBlocking } from "@/firebase"
import { initiateEmailSignIn, initiateEmailSignUp } from "@/firebase/non-blocking-login"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { doc, serverTimestamp } from "firebase/firestore"

export default function LoginPage() {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [fullName, setFullName] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isSignUp, setIsSignUp] = React.useState(false)
  
  const auth = useAuth()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    if (isSignUp) {
      initiateEmailSignUp(auth, email, password, async (error: any) => {
        setIsLoading(false)
        if (error) {
          toast({
            variant: "destructive",
            title: "Erro no cadastro",
            description: error.message || "Não foi possível criar sua conta.",
          })
          return
        }

        if (auth.currentUser) {
          const userId = auth.currentUser.uid;
          
          // Criar documento do usuário no Firestore
          setDocumentNonBlocking(doc(db, "users", userId), {
            id: userId,
            email: email,
            fullName: fullName,
            role: "Admin",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }, { merge: true });

          // Adicionar permissão de Admin na coleção DBAC
          setDocumentNonBlocking(doc(db, "roles_admin", userId), { 
            active: true,
            email: email,
            createdAt: new Date().toISOString()
          }, { merge: true });

          toast({
            title: "Conta criada!",
            description: "Bem-vindo ao NexusFlow Pro. Suas permissões de Admin foram configuradas.",
          });
        }
      })
    } else {
      initiateEmailSignIn(auth, email, password, (error: any) => {
        setIsLoading(false)
        if (error) {
          let errorMessage = "Verifique seus dados e tente novamente."
          if (error.code === 'auth/invalid-credential') {
            errorMessage = "E-mail ou senha incorretos."
          }
          toast({
            variant: "destructive",
            title: "Erro no login",
            description: errorMessage,
          })
        }
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

      <Card className="w-full max-w-[400px] border-border bg-card/50 backdrop-blur-xl shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
        <CardHeader className="space-y-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground mx-auto shadow-lg shadow-primary/30">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-black tracking-tight">
              {isSignUp ? "Criar Conta" : "NexusFlow Pro"}
            </CardTitle>
            <CardDescription className="text-muted-foreground font-medium">
              {isSignUp ? "Registre-se para começar" : "Entre para gerenciar sua operação"}
            </CardDescription>
          </div>
        </CardHeader>
        <form onSubmit={handleAuth}>
          <CardContent className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <div className="relative">
                  <LogIn className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="name" 
                    placeholder="Seu nome" 
                    className="pl-10 bg-muted/30 border-border"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
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
                {!isSignUp && (
                  <Button variant="link" type="button" className="px-0 font-bold text-xs text-accent">Esqueceu a senha?</Button>
                )}
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
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                isSignUp ? "Finalizar Cadastro" : "Acessar Plataforma"
              )}
            </Button>
            <Button 
              variant="ghost" 
              type="button"
              className="w-full text-xs font-bold"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Já tenho uma conta. Entrar" : "Não tem conta? Criar agora"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}