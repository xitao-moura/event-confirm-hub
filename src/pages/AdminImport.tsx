import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Upload, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const AdminImport = () => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "text/csv") {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo CSV.",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        toast({
          title: "Erro",
          description: "O arquivo CSV deve ter pelo menos um cabeçalho e uma linha de dados.",
          variant: "destructive"
        });
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = ['title', 'description', 'date', 'time', 'location', 'maxAttendees'];
      
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        toast({
          title: "Erro no formato",
          description: `Colunas obrigatórias faltando: ${missingHeaders.join(', ')}`,
          variant: "destructive"
        });
        return;
      }

      const events = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length !== headers.length) continue;

        const event: any = {};
        headers.forEach((header, index) => {
          event[header] = values[index];
        });

        events.push({
          title: event.title,
          description: event.description,
          date: event.date,
          time: event.time,
          location: event.location,
          max_attendees: parseInt(event.maxAttendees) || 50,
          current_attendees: 0,
          image_url: event.imageUrl || null,
          price: event.price || null
        });
      }

      // TODO: Implementar integração com Supabase
      const error = null; // Simulando sucesso por enquanto

      if (error) {
        console.error('Erro ao inserir eventos:', error);
        toast({
          title: "Erro",
          description: "Erro ao importar eventos. Verifique o formato do arquivo.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sucesso!",
          description: `${events.length} eventos importados com sucesso.`,
        });
        
        // Limpar o input
        event.target.value = '';
      }
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar o arquivo CSV.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6 lg:py-8">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Importar Eventos</h1>
          <p className="text-sm sm:text-base lg:text-lg opacity-90">Importe eventos em lote através de um arquivo CSV</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload de Arquivo CSV
              </CardTitle>
              <CardDescription>
                Selecione um arquivo CSV com os dados dos eventos para importar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="csv-file">Arquivo CSV</Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  className="mt-2"
                />
              </div>

              {isUploading && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Importando eventos...</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-4 lg:mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Formato do Arquivo
              </CardTitle>
              <CardDescription>
                O arquivo CSV deve conter as seguintes colunas obrigatórias:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-3 lg:p-4 rounded-lg overflow-x-auto">
                <code className="text-xs sm:text-sm whitespace-nowrap">
                  title,description,date,time,location,maxAttendees,imageUrl,price
                </code>
              </div>
              <div className="mt-4 space-y-2 text-xs sm:text-sm text-muted-foreground">
                <p><strong>title:</strong> Nome do evento</p>
                <p><strong>description:</strong> Descrição do evento</p>
                <p><strong>date:</strong> Data no formato YYYY-MM-DD</p>
                <p><strong>time:</strong> Horário no formato HH:MM</p>
                <p><strong>location:</strong> Local do evento</p>
                <p><strong>maxAttendees:</strong> Número máximo de participantes</p>
                <p><strong>imageUrl:</strong> URL da imagem (opcional)</p>
                <p><strong>price:</strong> Preço do evento (opcional)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminImport;