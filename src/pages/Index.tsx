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
        <div className="container mx-auto px-4 py-6 lg:py-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Agenda de Eventos</h1>
              <p className="text-sm sm:text-base lg:text-lg opacity-90">Descubra e confirme presença nos melhores eventos</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link to="/admin/import">
                <Button variant="ghost" size="sm" className="w-full sm:w-auto text-primary-foreground hover:bg-white/20">
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Importar CSV</span>
                  <span className="sm:hidden">Import</span>
                </Button>
              </Link>
              <Link to="/admin/confirmations">
                <Button variant="ghost" size="sm" className="w-full sm:w-auto text-primary-foreground hover:bg-white/20">
                  <Users className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Ver Confirmações</span>
                  <span className="sm:hidden">Confirmações</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-sm sm:max-w-md mx-auto mb-6 lg:mb-8">
            <TabsTrigger value="all" className="text-xs sm:text-sm px-2 sm:px-4">
              <span className="hidden sm:inline">Todos os Eventos</span>
              <span className="sm:hidden">Todos</span>
              <span className="ml-1">({mockEvents.length})</span>
            </TabsTrigger>
            <TabsTrigger value="confirmed" className="text-xs sm:text-sm px-2 sm:px-4">
              <span className="hidden sm:inline">Meus Eventos</span>
              <span className="sm:hidden">Meus</span>
              <span className="ml-1">({confirmedEventsList.length})</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-foreground mb-2">Todos os Eventos</h2>
              <p className="text-muted-foreground">Explore nossa seleção completa de eventos</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
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
