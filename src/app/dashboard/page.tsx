
"use client"

import * as React from "react"
import { 
  Users, 
  FileCheck, 
  DollarSign, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from "lucide-react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie,
  Cell
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase"
import { collection, query, where } from "firebase/firestore"

const COLORS = ["#6033CC", "#2AA1F0", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

export default function DashboardPage() {
  const db = useFirestore()
  const { user } = useUser()
  
  // Realtime queries - Somente se usuário logado
  const clientsQuery = useMemoFirebase(() => user ? collection(db, "clients") : null, [db, user])
  const contractsQuery = useMemoFirebase(() => user ? collection(db, "contracts") : null, [db, user])
  const pendingInvoicesQuery = useMemoFirebase(() => 
    user ? query(collection(db, "invoices"), where("paymentStatus", "==", "Pendente")) : null, 
  [db, user])
  
  const { data: clients, isLoading: loadingClients } = useCollection(clientsQuery)
  const { data: contracts, isLoading: loadingContracts } = useCollection(contractsQuery)
  const { data: pendingInvoices, isLoading: loadingInvoices } = useCollection(pendingInvoicesQuery)

  // Cálculos de Estatísticas
  const mrr = React.useMemo(() => {
    if (!contracts) return 0
    return contracts
      .filter(c => c.status === "Ativo")
      .reduce((acc, curr) => acc + (Number(curr.monthlyValue) || 0), 0)
  }, [contracts])

  const stats = [
    {
      title: "Contratos Ativos",
      value: loadingContracts ? "..." : (contracts?.filter(c => c.status === "Ativo").length || 0).toString(),
      change: "+2.4%",
      trend: "up",
      icon: FileCheck,
      color: "text-primary"
    },
    {
      title: "Receita Recorrente (MRR)",
      value: loadingContracts ? "..." : `R$ ${mrr.toLocaleString('pt-BR')}`,
      change: "+5.4%",
      trend: "up",
      icon: DollarSign,
      color: "text-accent"
    },
    {
      title: "Clientes Totais",
      value: loadingClients ? "..." : (clients?.length || 0).toString(),
      change: "+8%",
      trend: "up",
      icon: Users,
      color: "text-emerald-500"
    },
    {
      title: "Faturas Pendentes",
      value: loadingInvoices ? "..." : (pendingInvoices?.length || 0).toString(),
      change: "Critico",
      trend: "down",
      icon: AlertCircle,
      color: "text-destructive"
    }
  ]

  // Cálculo de Distribuição de Serviços (Dinâmico)
  const serviceDistribution = React.useMemo(() => {
    if (!contracts || contracts.length === 0) return []
    
    const counts: Record<string, number> = {}
    contracts.forEach(c => {
      const type = c.serviceType || "Outros"
      counts[type] = (counts[type] || 0) + 1
    })

    return Object.entries(counts).map(([name, count], index) => ({
      name,
      value: Math.round((count / contracts.length) * 100),
      color: COLORS[index % COLORS.length]
    }))
  }, [contracts])

  // Mock para crescimento (Em um app real, buscaríamos histórico de pagamentos)
  const revenueData = [
    { month: "Jan", value: mrr * 0.85 },
    { month: "Fev", value: mrr * 0.90 },
    { month: "Mar", value: mrr * 0.92 },
    { month: "Abr", value: mrr * 0.95 },
    { month: "Mai", value: mrr * 0.98 },
    { month: "Jun", value: mrr },
  ]

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 overflow-x-hidden">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Visão Geral</h1>
        <p className="text-sm md:text-base text-muted-foreground text-balance">Métricas reais conectadas ao seu banco de dados Firestore.</p>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="card-hover border-border bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
              <p className="text-[10px] md:text-xs text-muted-foreground flex items-center gap-1 mt-1">
                <span className={cn(
                  "flex items-center font-semibold",
                  stat.trend === "up" ? "text-emerald-500" : "text-destructive"
                )}>
                  {stat.trend === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stat.change}
                </span>
                em relação ao mês passado
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-border bg-card/50">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Crescimento Financeiro</CardTitle>
            <CardDescription>Receita mensal recorrente (MRR) projetada.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickFormatter={(value) => `R$ ${Math.round(value / 1000)}k`}
                  width={40}
                />
                <Tooltip 
                  cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-popover border border-border p-2 md:p-3 rounded-lg shadow-xl">
                          <p className="text-xs md:text-sm font-bold text-foreground">{payload[0].payload.month}</p>
                          <p className="text-xs md:text-sm text-primary font-medium">R$ {payload[0].value?.toLocaleString()}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-border bg-card/50 relative">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Distribuição de Serviços</CardTitle>
            <CardDescription>Baseado em categorias ativas.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] md:h-[300px] flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceDistribution.length > 0 ? serviceDistribution : [{ name: "Nenhum", value: 100, color: "#333" }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(serviceDistribution.length > 0 ? serviceDistribution : [{color: "#333"}]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-16">
              <span className="text-xl md:text-2xl font-bold">{contracts?.length || 0}</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Contratos</span>
            </div>
          </CardContent>
          <div className="p-4 md:p-6 pt-0 grid grid-cols-2 gap-2 md:gap-4">
            {serviceDistribution.map((service) => (
              <div key={service.name} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: service.color }} />
                <span className="text-[10px] md:text-xs font-medium truncate">{service.name}</span>
                <span className="text-[10px] md:text-xs text-muted-foreground ml-auto">{service.value}%</span>
              </div>
            ))}
            {serviceDistribution.length === 0 && (
              <p className="col-span-2 text-[10px] text-center text-muted-foreground italic">Nenhum dado de serviço disponível.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
