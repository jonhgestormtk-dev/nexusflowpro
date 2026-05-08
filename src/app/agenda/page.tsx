
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
  User,
  Loader2,
  CheckCircle2,
  Trash2,
  Info
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase, 
  useUser,
  addDocumentNonBlocking,
  deleteDocumentNonBlocking
} from "@/firebase"
import { collection, query, orderBy, where, doc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function AgendaPage() {
  const { toast } = useToast()
  const db = useFirestore()
  const { user } = useUser()
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  // Query de Eventos
  const eventsQuery = useMemoFirebase(() => {
    if (!user) return null
    return query(collection(db, "scheduleEntries"), orderBy("startTime", "asc"))
  }, [db, user])

  const { data: events, isLoading } = useCollection(eventsQuery)

  // Filtra eventos para o dia selecionado
  const filteredEvents = React.useMemo(() => {
    if (!events || !date) return []
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return events.filter(event => {
      const eventDate = new Date(event.startTime)
      return eventDate >= startOfDay && eventDate <= endOfDay
    })
  }, [events, date])

  const handleSaveEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    const formData = new FormData(e.currentTarget)
    const eventTime = formData.get("time") as string
    const eventDate = date || new Date()
    
    // Combina data do calendário com hora do input
    const [hours, minutes] = eventTime.split(":")
    const startTime = new Date(eventDate)
    startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    
    const endTime = new Date(startTime)
    endTime.setHours(endTime.getHours() + 1) // Padrão 1 hora

    const eventData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as string,
      location: formData.get("location") as string,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      assignedToUserIds: [user?.uid],
      isCompleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    try {
      addDocumentNonBlocking(collection(db, "scheduleEntries"), eventData)
      toast({ title: "Evento Agendado", description: "O compromisso foi adicionado à sua agenda." })
      setIsDialogOpen(false)
    } catch (error) {
      toast({ variant: "destructive", title: "Erro", description: "Falha ao salvar o evento." })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteEvent = (id: string) => {
    deleteDocumentNonBlocking(doc(db, "scheduleEntries", id))
    toast({ title: "Evento removido", description: "O compromisso foi excluído da agenda." })
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-1">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Agenda</h1>
          <p className="text-sm text-muted-foreground">Gerencie seus compromissos integrados.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-primary hover:bg-primary/90 w-full sm:w-auto font-bold shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Novo Evento
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        <Card className="lg:col-span-4 border-border bg-card/50">
          <CardHeader className="p-4">
            <CardTitle className="text-base md:text-lg font-bold">Calendário</CardTitle>
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
              <CardTitle className="text-base md:text-lg font-bold">Programação</CardTitle>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest truncate">
                {date?.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'long' })}
              </p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <Button variant="outline" size="icon" className="h-8 w-8 border-border" onClick={() => {
                const prevDate = new Date(date || new Date())
                prevDate.setDate(prevDate.getDate() - 1)
                setDate(prevDate)
              }}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 border-border" onClick={() => {
                const nextDate = new Date(date || new Date())
                nextDate.setDate(nextDate.getDate() + 1)
                setDate(nextDate)
              }}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-4 md:p-6">
            {isLoading ? (
              <div className="py-20 text-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sincronizando Agenda...</p>
              </div>
            ) : filteredEvents.length > 0 ? (
              filteredEvents.map((event) => (
                <div key={event.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors group relative">
                  <div className="flex sm:flex-col items-center sm:justify-center sm:min-w-[100px] sm:border-r sm:border-border sm:pr-4 gap-2 sm:gap-1">
                    <Clock className="h-4 w-4 text-accent shrink-0" />
                    <div className="flex sm:flex-col items-center sm:items-center gap-1 sm:gap-0">
                      <span className="text-xs font-bold text-foreground">
                        {new Date(event.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-[9px] uppercase font-bold text-accent border-accent/30 shrink-0">
                        {event.type}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    
                    <h3 className="text-base md:text-lg font-bold group-hover:text-primary transition-colors leading-tight">{event.title}</h3>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] md:text-xs font-medium text-muted-foreground">
                      <div className="flex items-center gap-1.5 truncate max-w-full">
                        {event.location?.includes("Meet") || event.location?.includes("Zoom") ? <Video className="h-3 w-3 text-accent shrink-0" /> : <MapPin className="h-3 w-3 shrink-0" />}
                        <span className="truncate">{event.location}</span>
                      </div>
                      {event.description && (
                        <div className="flex items-center gap-1.5 truncate max-w-full">
                          <Info className="h-3 w-3 shrink-0" />
                          <span className="truncate">{event.description}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center space-y-4 border-2 border-dashed border-border rounded-xl">
                <CalendarIcon className="h-10 w-10 text-muted-foreground mx-auto opacity-20" />
                <p className="text-sm text-muted-foreground">Nada agendado para este dia.</p>
                <Button variant="outline" className="border-border text-xs" onClick={() => setIsDialogOpen(true)}>Agendar Compromisso</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[450px] bg-card border-border">
          <form onSubmit={handleSaveEvent}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Agendar Novo Evento</DialogTitle>
              <DialogDescription className="text-xs">
                {date?.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-6">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-xs font-bold uppercase tracking-widest">Título do Evento</Label>
                <Input id="title" name="title" placeholder="Ex: Reunião de Briefing" required className="bg-muted/30" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type" className="text-xs font-bold uppercase tracking-widest">Tipo</Label>
                  <Select name="type" defaultValue="Reunião">
                    <SelectTrigger className="bg-muted/30">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Reunião">Reunião</SelectItem>
                      <SelectItem value="Apresentação">Apresentação</SelectItem>
                      <SelectItem value="Suporte">Suporte</SelectItem>
                      <SelectItem value="Interno">Interno</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time" className="text-xs font-bold uppercase tracking-widest">Horário</Label>
                  <Input id="time" name="time" type="time" required className="bg-muted/30" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location" className="text-xs font-bold uppercase tracking-widest">Localização / Link</Label>
                <Input id="location" name="location" placeholder="Google Meet, Sede, etc." className="bg-muted/30" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest">Observações</Label>
                <Textarea id="description" name="description" placeholder="Detalhes adicionais..." className="bg-muted/30 min-h-[80px]" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancelar</Button>
              <Button type="submit" className="bg-primary font-bold" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Confirmar Agendamento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
