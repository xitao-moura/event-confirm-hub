import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Users, Calendar, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

interface Confirmation {
  id: string;
  user_session_id: string;
  event_id: string;
  confirmed_at: string;
  events: {
    title: string;
    date: string;
    time: string;
    location: string;
  };
}

const AdminConfirmations = () => {
  const [confirmations, setConfirmations] = useState<Confirmation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfirmations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('event_confirmations')
        .select(`
          id,
          user_session_id,
          event_id,
          confirmed_at,
          events (
            title,
            date,
            time,
            location
          )
        `)
        .order('confirmed_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar confirmações:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar confirmações.",
          variant: "destructive"
        });
      } else {
        setConfirmations(data || []);
      }
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar confirmações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConfirmation = async (confirmationId: string) => {
    try {
      const { error } = await supabase
        .from('event_confirmations')
        .delete()
        .eq('id', confirmationId);

      if (error) {
        console.error('Erro ao deletar confirmação:', error);
        toast({
          title: "Erro",
          description: "Erro ao deletar confirmação.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Confirmação deletada com sucesso.",
        });
        fetchConfirmations(); // Recarregar a lista
      }
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Erro ao deletar confirmação.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchConfirmations();
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('pt-BR');
  };

  const getUniqueUsers = () => {
    return new Set(confirmations.map(c => c.user_session_id)).size;
  };

  const getUniqueEvents = () => {
    return new Set(confirmations.map(c => c.event_id)).size;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl font-bold mb-2">Confirmações de Presença</h1>
          <p className="text-lg opacity-90">Visualize todas as confirmações de eventos</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Confirmações</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{confirmations.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Únicos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getUniqueUsers()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eventos com Confirmações</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getUniqueEvents()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Confirmations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Confirmações</CardTitle>
            <CardDescription>
              Todas as confirmações de presença registradas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-2">Carregando confirmações...</span>
              </div>
            ) : confirmations.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Evento</TableHead>
                      <TableHead>Data do Evento</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>ID do Usuário</TableHead>
                      <TableHead>Confirmado em</TableHead>
                      <TableHead className="w-[100px]">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {confirmations.map((confirmation) => (
                      <TableRow key={confirmation.id}>
                        <TableCell className="font-medium">
                          {confirmation.events?.title || 'Evento não encontrado'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{formatDate(confirmation.events?.date || '')}</span>
                            <span className="text-sm text-muted-foreground">
                              {confirmation.events?.time}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{confirmation.events?.location}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono text-xs">
                            {confirmation.user_session_id.substring(0, 8)}...
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDateTime(confirmation.confirmed_at)}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteConfirmation(confirmation.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-32 h-32 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <Users className="text-4xl text-muted-foreground" />
                </div>
                <p className="text-lg text-muted-foreground mb-2">Nenhuma confirmação encontrada</p>
                <p className="text-sm text-muted-foreground">
                  As confirmações aparecerão aqui quando os usuários confirmarem presença
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminConfirmations;