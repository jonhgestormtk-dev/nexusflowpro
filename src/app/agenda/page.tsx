
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Agenda</h1>
          <p className="text-sm text-muted-foreground">Gerencie seus compromissos integrados.</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Novo Evento
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        <Card className="lg:col-span-4 border-border bg-card/50">
          <CardHeader className="p-4">
            <CardTitle className="text-base md:text-lg">Calendário</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border-0"
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-8 border-border bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between p-4 md:p-6">
            <div className="space-y-1">
              <CardTitle className="text-base md:text-lg">Programação</CardTitle>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest truncate">
                {date?.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <Button variant="outline" size="icon" className="h-8 w-8 border-border">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 border-border">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 md:p-6">
            {events.map((event) => (
              <div key={event.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors group">
                <div className="flex sm:flex-col items-center sm:justify-center sm:min-w-[100px] sm:border-r sm:border-border sm:pr-4 gap-2 sm:gap-1">
                  <Clock className="h-4 w-4 text-accent shrink-0" />
                  <div className="flex sm:flex-col items-center sm:items-center gap-1 sm:gap-0">
                    <span className="text-xs font-bold text-foreground">{event.time.split(' - ')[0]}</span>
                    <span className="hidden sm:inline text-[10px] text-muted-foreground">{event.time.split(' - ')[1]}</span>
                  </div>
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="outline" className="text-[9px] uppercase font-bold text-accent border-accent/30 shrink-0">
                      {event.type}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={`text-[9px] uppercase font-bold shrink-0 ${
                        event.status === "Confirmado" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      {event.status}
                    </Badge>
                  </div>
                  
                  <h3 className="text-base md:text-lg font-bold group-hover:text-primary transition-colors leading-tight">{event.title}</h3>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] md:text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5 truncate max-w-full">
                      <User className="h-3 w-3 shrink-0" />
                      <span className="truncate">{event.client}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate max-w-full">
                      {event.location.includes("Meet") ? <Video className="h-3 w-3 text-accent shrink-0" /> : <MapPin className="h-3 w-3 shrink-0" />}
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center sm:ml-auto">
                  <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto sm:ml-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {events.length === 0 && (
              <div className="py-20 text-center space-y-4 border-2 border-dashed border-border rounded-xl">
                <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto opacity-20" />
                <p className="text-sm text-muted-foreground">Nada agendado para hoje.</p>
                <Button variant="outline" className="border-border text-xs">Agendar Reunião</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
