
"use client"

import * as React from "react"
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  Video,
  User
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"

const events = [
  { 
    id: 1, 
    title: "Reunião de Briefing", 
    client: "Silva Tech", 
    time: "09:00 - 10:30", 
    type: "Reunião", 
    location: "Google Meet",
    status: "Confirmado"
  },
  { 
    id: 2, 
    title: "Apresentação de Layout", 
    client: "Moda Viva", 
    time: "14:00 - 15:00", 
    type: "Apresentação", 
    location: "Sede do Cliente",
    status: "Pendente"
  },
  { 
    id: 3, 
    title: "Suporte Técnico", 
    client: "Dental Clinic", 
    time: "16:30 - 17:30", 
    type: "Suporte", 
    location: "Remoto",
    status: "Confirmado"
  }
]

export default function AgendaPage() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Agenda & Compromissos</h1>
          <p className="text-muted-foreground">Gerencie seu tempo e compromissos com clientes de forma integrada.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Novo Evento
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-4 lg:col-span-3 border-border bg-card/50">
          <CardHeader className="p-4">
            <CardTitle className="text-lg">Calendário</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border-0"
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-8 lg:col-span-9 border-border bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Programação para Hoje</CardTitle>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
                {date?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8 border-border">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 border-border">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="flex gap-4 p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors group">
                <div className="hidden sm:flex flex-col items-center justify-center min-w-[100px] border-r border-border pr-4">
                  <Clock className="h-4 w-4 text-accent mb-1" />
                  <span className="text-xs font-bold text-foreground">{event.time.split(' - ')[0]}</span>
                  <span className="text-[10px] text-muted-foreground">{event.time.split(' - ')[1]}</span>
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] uppercase font-bold text-accent border-accent/30">
                      {event.type}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={`text-[10px] uppercase font-bold ${
                        event.status === "Confirmado" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      {event.status}
                    </Badge>
                  </div>
                  
                  <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{event.title}</h3>
                  
                  <div className="flex flex-wrap gap-4 text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3 w-3" />
                      {event.client}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {event.location.includes("Meet") ? <Video className="h-3 w-3 text-accent" /> : <MapPin className="h-3 w-3" />}
                      {event.location}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {events.length === 0 && (
              <div className="py-20 text-center space-y-4 border-2 border-dashed border-border rounded-xl">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto opacity-20" />
                <p className="text-muted-foreground">Nenhum compromisso agendado para este dia.</p>
                <Button variant="outline" className="border-border">Agendar Reunião</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
