
"use client"

import * as React from "react"
import { 
  TrendingUp, 
  Users, 
  FileCheck, 
  Clock, 
  DollarSign, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight
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

const stats = [
  {
    title: "Contratos Ativos",
    value: "128",
    change: "+12%",
    trend: "up",
    icon: FileCheck,
    color: "text-primary"
  },
  {
    title: "Faturamento Mensal",
    value: "R$ 45.230",
    change: "+5.4%",
    trend: "up",
    icon: DollarSign,
    color: "text-accent"
  },
  {
    title: "Clientes Ativos",
    value: "84",
    change: "+8%",
    trend: "up",
    icon: Users,
    color: "text-emerald-500"
  },
  {
    title: "Inadimplência",
    value: "R$ 3.120",
    change: "-2.1%",
    trend: "down",
    icon: AlertCircle,
    color: "text-destructive"
  }
]

const revenueData = [
  { month: "Jan", value: 32000 },
  { month: "Fev", value: 35000 },
  { month: "Mar", value: 33000 },
  { month: "Abr", value: 38000 },
  { month: "Mai", value: 42000 },
  { month: "Jun", value: 45230 },
]

const serviceData = [
  { name: "Sites", value: 45, color: "#6033CC" },
  { name: "Apps", value: 25, color: "#2AA1F0" },
  { name: "Sistemas", value: 20, color: "#10b981" },
  { name: "Consultoria", value: 10, color: "#f59e0b" },
]

export default function DashboardPage() {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => setMounted(true), [])

  if (!mounted) return null

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 overflow-x-hidden">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Visão Geral</h1>
        <p className="text-sm md:text-base text-muted-foreground text-balance">Bem-vindo ao NexusFlow. Aqui está o resumo operacional da sua empresa.</p>
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
            <CardDescription>Receita mensal recorrente (MRR) nos últimos 6 meses.</CardDescription>
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
                  tickFormatter={(value) => `R$ ${value / 1000}k`}
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
            <CardDescription>Baseado em contratos ativos por categoria.</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] md:h-[300px] flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {serviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-16">
              <span className="text-xl md:text-2xl font-bold">128</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total</span>
            </div>
          </CardContent>
          <div className="p-4 md:p-6 pt-0 grid grid-cols-2 gap-2 md:gap-4">
            {serviceData.map((service) => (
              <div key={service.name} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: service.color }} />
                <span className="text-[10px] md:text-xs font-medium truncate">{service.name}</span>
                <span className="text-[10px] md:text-xs text-muted-foreground ml-auto">{service.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card className="border-border bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg md:text-xl">Últimos Clientes</CardTitle>
              <CardDescription>Adicionados recentemente.</CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold shrink-0">VER TODOS</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Tech Solutions Inc", segment: "Sistemas", date: "2h atrás" },
                { name: "Bella Massa", segment: "App Delivery", date: "5h atrás" },
                { name: "Eco Vida Solar", segment: "Branding", date: "1 dia atrás" },
              ].map((client, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                    {client.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{client.name}</p>
                    <p className="text-[10px] md:text-xs text-muted-foreground truncate">{client.segment}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">{client.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between">
             <div>
              <CardTitle className="text-lg md:text-xl">Próximos Vencimentos</CardTitle>
              <CardDescription>Faturas e renovações (7 dias).</CardDescription>
            </div>
            <Clock className="h-4 w-4 text-accent shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { client: "Global Logística", type: "Mensalidade", value: "R$ 1.500", date: "Amanhã" },
                { client: "Market Prime", type: "Manutenção", value: "R$ 450", date: "3 dias" },
                { client: "Health Care", type: "Cloud SaaS", value: "R$ 2.800", date: "5 dias" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 border-b border-border last:border-0">
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate">{item.client}</span>
                    <span className="text-[10px] text-muted-foreground">{item.type}</span>
                  </div>
                  <div className="text-right flex flex-col shrink-0">
                    <span className="text-sm font-bold text-foreground">{item.value}</span>
                    <span className="text-[10px] font-medium text-accent">{item.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
