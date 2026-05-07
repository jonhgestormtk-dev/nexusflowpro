
"use client"

import * as React from "react"
import { 
  Users, 
  FileCheck, 
  DollarSign, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  TrendingUp,
  Clock
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
import { collection, query, where, orderBy } from "firebase/firestore"

const COLORS = ["#6033CC", "#2AA1F0", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

export default function DashboardPage() {
  const db = useFirestore()
  const { user } = useUser()
  
  // Consultas em tempo real
  const clientsQuery = useMemoFirebase(() => user ? collection(db, "clients") : null, [db, user])
  const contractsQuery = useMemoFirebase(() => user ? collection(db, "contracts") : null, [db, user])
  const invoicesQuery = useMemoFirebase(() => user ? query(collection(db, "invoices"), orderBy("dueDate", "asc")) : null, [db, user])
  
  const { data: clients, isLoading: loadingClients } = useCollection(clientsQuery)
  const { data: contracts, isLoading: loadingContracts } = useCollection(contractsQuery)
  const { data: invoices, isLoading: loadingInvoices } = useCollection(invoicesQuery)

  // Cálculos de Estatísticas Reais
  const stats = React.useMemo(() => {
    if (!clients || !contracts || !invoices) return null;

    const activeContracts = contracts.filter(c => c.status === "Ativo");
    const mrr = activeContracts.reduce((acc, curr) => acc + (Number(curr.monthlyValue) || 0), 0);
    
    const now = new Date();
    const pendingInvoices = invoices.filter(inv => inv.paymentStatus === "Pendente");
    const totalPendingAmount = pendingInvoices.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    
    const overdueInvoices = invoices.filter(inv => 
      inv.paymentStatus !== "Pago" && 
      inv.dueDate && 
      new Date(inv.dueDate) < now
    );
    const overdueCount = overdueInvoices.length;

    return [
      {
        title: "Contratos Ativos",
        value: activeContracts.length.toString(),
        description: "Contratos em vigência",
        icon: FileCheck,
        color: "text-primary",
        trend: "up"
      },
      {
        title: "Receita Recorrente (MRR)",
        value: `R$ ${mrr.toLocaleString('pt-BR')}`,
        description: "Baseado em contratos ativos",
        icon: DollarSign,
        color: "text-accent",
        trend: "up"
      },
      {
        title: "Volume Pendente",
        value: `R$ ${totalPendingAmount.toLocaleString('pt-BR')}`,
        description: `${pendingInvoices.length} faturas aguardando`,
        icon: Clock,
        color: "text-emerald-500",
        trend: "neutral"
      },
      {
        title: "Inadimplência",
        value: overdueCount.toString(),
        description: "Faturas vencidas",
        icon: AlertCircle,
        color: "text-destructive",
        trend: overdueCount > 0 ? "down" : "up"
      }
    ];
  }, [clients, contracts, invoices]);

  // Gráfico de Crescimento (Baseado em Faturas Pagas por Mês)
  const revenueChartData = React.useMemo(() => {
    if (!invoices) return [];
    
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const currentYear = new Date().getFullYear();
    
    const monthlyData: Record<string, number> = {};
    
    // Inicializa últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = months[d.getMonth()];
      monthlyData[monthLabel] = 0;
    }

    invoices.forEach(inv => {
      if (inv.paymentStatus === "Pago" && inv.paidDate) {
        const date = new Date(inv.paidDate);
        const monthLabel = months[date.getMonth()];
        if (monthlyData[monthLabel] !== undefined) {
          monthlyData[monthLabel] += Number(inv.amount || 0);
        }
      }
    });

    return Object.entries(monthlyData).map(([month, value]) => ({ month, value }));
  }, [invoices]);

  // Distribuição de Serviços
  const serviceDistribution = React.useMemo(() => {
    if (!contracts || contracts.length === 0) return []
    
    const counts: Record<string, number> = {}
    contracts.forEach(c => {
      const type = c.serviceType || "Outros"
      counts[type] = (counts[type] || 0) + 1
    })

    return Object.entries(counts).map(([name, count], index) => ({
      name,
      value: count,
      percentage: Math.round((count / contracts.length) * 100),
      color: COLORS[index % COLORS.length]
    }))
  }, [contracts]);

  if (loadingClients || loadingContracts || loadingInvoices) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
          Sincronizando faturamento real...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 overflow-x-hidden">
      <div className="flex flex-col gap-2 px-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Visão Geral do Negócio</h1>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-black uppercase tracking-widest px-2">
            Tempo Real
          </Badge>
          <p className="text-xs text-muted-foreground">Métricas extraídas de faturas e contratos vigentes.</p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats?.map((stat) => (
          <Card key={stat.title} className="card-hover border-border bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black tracking-tight">{stat.value}</div>
              <p className="text-[10px] text-muted-foreground mt-1 font-bold">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        {/* Gráfico de Receita */}
        <Card className="lg:col-span-4 border-border bg-card/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Fluxo de Caixa</CardTitle>
                <CardDescription className="text-xs font-medium">Receita liquidada nos últimos meses.</CardDescription>
              </div>
              <Badge className="bg-emerald-500/10 text-emerald-500 border-none font-black text-[9px] uppercase">
                <TrendingUp className="h-3 w-3 mr-1" /> Performance
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[300px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontWeight: 700 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  tickFormatter={(value) => `R$ ${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                  width={45}
                />
                <Tooltip 
                  cursor={{ fill: "hsl(var(--muted) / 0.3)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-popover border border-border p-3 rounded-xl shadow-2xl">
                          <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">{payload[0].payload.month}</p>
                          <p className="text-sm font-black text-primary">R$ {payload[0].value?.toLocaleString('pt-BR')}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição de Serviços */}
        <Card className="lg:col-span-3 border-border bg-card/50 relative">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Tipos de Serviço</CardTitle>
            <CardDescription className="text-xs font-medium">Divisão por categoria de contrato.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceDistribution.length > 0 ? serviceDistribution : [{ name: "Nenhum", value: 1, color: "#333" }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {(serviceDistribution.length > 0 ? serviceDistribution : [{color: "#333"}]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-10">
              <span className="text-2xl font-black tracking-tighter">{contracts?.length || 0}</span>
              <span className="text-[9px] text-muted-foreground uppercase font-black tracking-widest">Total</span>
            </div>
          </CardContent>
          <div className="p-6 pt-0 space-y-2">
            {serviceDistribution.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-2 rounded-lg bg-muted/10 border border-border/30">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: service.color }} />
                  <span className="text-[10px] font-bold uppercase truncate max-w-[140px]">{service.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-foreground">{service.value}</span>
                  <span className="text-[10px] font-medium text-muted-foreground">{service.percentage}%</span>
                </div>
              </div>
            ))}
            {serviceDistribution.length === 0 && (
              <p className="text-[10px] text-center text-muted-foreground italic py-4">Nenhum dado de contrato disponível.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Tabela de Atividade Recente */}
      <Card className="border-border bg-card/50">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Faturas Pendentes Próximas</CardTitle>
          <CardDescription className="text-xs font-medium">Listagem automática das próximas cobranças.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices?.filter(i => i.paymentStatus === "Pendente").slice(0, 5).map((inv) => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/10 hover:bg-muted/20 transition-colors">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
                    new Date(inv.dueDate) < new Date() ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"
                  )}>
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-bold truncate">{inv.clientName}</span>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase">Vence em: {new Date(inv.dueDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-black">R$ {Number(inv.amount || 0).toLocaleString('pt-BR')}</span>
                  <Badge variant="outline" className={cn(
                    "text-[8px] font-black uppercase tracking-tighter px-1.5 py-0 border-none",
                    new Date(inv.dueDate) < new Date() ? "text-destructive" : "text-accent"
                  )}>
                    {new Date(inv.dueDate) < new Date() ? "Atrasado" : "No Prazo"}
                  </Badge>
                </div>
              </div>
            ))}
            {(!invoices || invoices.filter(i => i.paymentStatus === "Pendente").length === 0) && (
              <div className="py-10 text-center">
                <p className="text-xs text-muted-foreground italic">Nenhuma fatura pendente encontrada.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
