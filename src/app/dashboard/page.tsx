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
  LineChart, 
  Line,
  Cell,
  PieChart,
  Pie
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

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
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Visão Geral</h1>
        <p className="text-muted-foreground">Bem-vindo ao NexusFlow. Aqui está o resumo operacional da sua empresa.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="card-hover border-border bg-card/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={cn("h-4 w-4", stat.color)} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-border bg-card/50">
          <CardHeader>
            <CardTitle>Crescimento Financeiro</CardTitle>
            <CardDescription>Receita mensal recorrente (MRR) nos últimos 6 meses.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  tickFormatter={(value) => `R$ ${value / 1000}k`}
                />
                <Tooltip 
                  cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-popover border border-border p-3 rounded-lg shadow-xl">
                          <p className="text-sm font-bold text-foreground">{payload[0].payload.month}</p>
                          <p className="text-sm text-primary font-medium">R$ {payload[0].value?.toLocaleString()}</p>
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

        <Card className="lg:col-span-3 border-border bg-card/50">
          <CardHeader>
            <CardTitle>Distribuição de Serviços</CardTitle>
            <CardDescription>Baseado em contratos ativos por categoria.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
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
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">128</span>
              <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total</span>
            </div>
          </CardContent>
          <div className="p-6 pt-0 grid grid-cols-2 gap-4">
            {serviceData.map((service) => (
              <div key={service.name} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: service.color }} />
                <span className="text-xs font-medium">{service.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">{service.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Últimos Clientes</CardTitle>
              <CardDescription>Empresas recém adicionadas à plataforma.</CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] font-bold">VER TODOS</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Tech Solutions Inc", segment: "Sistemas de Gestão", date: "Há 2 horas" },
                { name: "Padaria Bella Massa", segment: "App de Delivery", date: "Há 5 horas" },
                { name: "Eco Vida Solar", segment: "Web & Branding", date: "Há 1 dia" },
                { name: "Advocacia Lemos", segment: "Sistema Jurídico", date: "Há 2 dias" },
              ].map((client, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {client.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{client.segment}</p>
                  </div>
                  <div className="text-right">
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
              <CardTitle>Próximos Vencimentos</CardTitle>
              <CardDescription>Faturas e renovações para os próximos 7 dias.</CardDescription>
            </div>
            <Clock className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { client: "Global Logística", type: "Mensalidade", value: "R$ 1.500", date: "Amanhã" },
                { client: "Market Prime", type: "Manutenção", value: "R$ 450", date: "Em 3 dias" },
                { client: "Health Care", type: "Cloud SaaS", value: "R$ 2.800", date: "Em 5 dias" },
                { client: "Indústria Metal", type: "Suporte 24/7", value: "R$ 900", date: "Em 6 dias" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 border-b border-border last:border-0">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{item.client}</span>
                    <span className="text-xs text-muted-foreground">{item.type}</span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className="text-sm font-bold text-foreground">{item.value}</span>
                    <span className="text-xs font-medium text-accent">{item.date}</span>
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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ")
}