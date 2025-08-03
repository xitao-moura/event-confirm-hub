import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EventCard, Event } from "@/components/EventCard";
import { mockEvents } from "@/data/mockEvents";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Settings, FileText, Users } from "lucide-react";

const Index = () => {
  const [confirmedEvents, setConfirmedEvents] = useState<string[]>([]);
  const { toast } = useToast();

  // Carregar eventos confirmados do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('confirmedEvents');
    if (saved) {
      setConfirmedEvents(JSON.parse(saved));
    }
  }, []);

  // Salvar no localStorage sempre que confirmedEvents mudar
  useEffect(() => {
    localStorage.setItem('confirmedEvents', JSON.stringify(confirmedEvents));
  }, [confirmedEvents]);

  const handleConfirmEvent = (eventId: string) => {
    const event = mockEvents.find(e => e.id === eventId);
    if (event && event.currentAttendees >= event.maxAttendees) {
      toast({
        title: "Evento lotado",
        description: "Não há mais vagas disponíveis para este evento.",
        variant: "destructive"
      });
      return;
    }

    setConfirmedEvents(prev => [...prev, eventId]);
    toast({
      title: "Presença confirmada!",
      description: `Você confirmou presença no evento: ${event?.title}`,
    });
  };

  const handleCancelEvent = (eventId: string) => {
    const event = mockEvents.find(e => e.id === eventId);
    setConfirmedEvents(prev => prev.filter(id => id !== eventId));
    toast({
      title: "Presença cancelada",
      description: `Você cancelou sua presença no evento: ${event?.title}`,
    });
  };

  const confirmedEventsList = mockEvents.filter(event => 
    confirmedEvents.includes(event.id)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2">Agenda de Eventos</h1>
              <p className="text-lg opacity-90">Descubra e confirme presença nos melhores eventos</p>
            </div>
            <div className="flex gap-2">
              <Link to="/admin/import">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/20">
                  <FileText className="w-4 h-4 mr-2" />
                  Importar CSV
                </Button>
              </Link>
              <Link to="/admin/confirmations">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/20">
                  <Users className="w-4 h-4 mr-2" />
                  Ver Confirmações
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="all" className="text-sm">
              Todos os Eventos ({mockEvents.length})
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="text-sm">
              Meus Eventos ({confirmedEventsList.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Todos os Eventos</h2>
              <p className="text-muted-foreground">Explore nossa seleção completa de eventos</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockEvents.map(event => (
                <EventCard
                  key={event.id}
                  event={event}
                  isConfirmed={confirmedEvents.includes(event.id)}
                  onConfirm={handleConfirmEvent}
                  onCancel={handleCancelEvent}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="confirmed" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Meus Eventos</h2>
              <p className="text-muted-foreground">
                {confirmedEventsList.length > 0 
                  ? "Eventos que você confirmou presença" 
                  : "Você ainda não confirmou presença em nenhum evento"
                }
              </p>
            </div>
            
            {confirmedEventsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {confirmedEventsList.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isConfirmed={true}
                    onConfirm={handleConfirmEvent}
                    onCancel={handleCancelEvent}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-32 h-32 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-4xl">📅</span>
                </div>
                <p className="text-lg text-muted-foreground mb-2">Nenhum evento confirmado</p>
                <p className="text-sm text-muted-foreground">
                  Visite a aba "Todos os Eventos" para confirmar sua presença
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
