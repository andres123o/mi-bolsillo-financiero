import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Calculator, Target, TrendingDown, Calendar } from "lucide-react";

interface ResultadoCalculo {
  cantidadMensual: number;
  fechaProyectada: string;
  recomendaciones: Record<string, string | { categoria?: string; sugerencia?: string } | object>;
}

export function CalculadoraMetas() {
  const [consulta, setConsulta] = useState('');
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);
  const [calculando, setCalculando] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const llamarWebhook = async (prompt: string): Promise<ResultadoCalculo | null> => {
    try {
      const url = `https://andresolaya.app.n8n.cloud/webhook-test/c5f1788b-e13e-4f9a-8d2e-ff5ea133bd16?prompt=${encodeURIComponent(prompt)}`;
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del webhook');
      }

      const data = await response.json();
      
      return {
        cantidadMensual: data["Cantidad mensual de ahorro requerida"],
        fechaProyectada: data["Fecha proyectada de finalización"],
        recomendaciones: data["Recomendaciones de reducción de gastos"]
      };
    } catch (error) {
      console.error('Error al llamar al webhook:', error);
      return null;
    }
  };

  const handleCalcular = async () => {
    if (!consulta.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu consulta de ahorro.",
        variant: "destructive",
      });
      return;
    }

    setCalculando(true);
    
    try {
      const resultado = await llamarWebhook(consulta);
      
      if (resultado) {
        setResultado(resultado);
        toast({
          title: "Cálculo completado",
          description: "Se ha generado tu plan de ahorro personalizado.",
        });
      } else {
        toast({
          title: "Error en el cálculo",
          description: "No se pudo procesar tu consulta. Por favor intenta de nuevo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al procesar tu consulta. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setCalculando(false);
    }
  };

  const ejemplosConsulta = [
    "Quiero ahorrar 50 millones para comprar una casa en 3 años",
    "Necesito 20 millones para un carro en 18 meses",
    "Quiero ahorrar 5 millones para vacaciones en 8 meses",
    "Meta: 100 millones para inversión en 5 años"
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Calculadora de Metas de Ahorro</h1>
        <Calculator className="h-8 w-8 text-primary" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Consulta de Ahorro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="consulta">
              Describe tu meta de ahorro (incluye monto y plazo)
            </Label>
            <Textarea
              id="consulta"
              value={consulta}
              onChange={(e) => setConsulta(e.target.value)}
              placeholder="Ejemplo: Quiero ahorrar 50 millones para comprar una casa en 3 años"
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-medium">Ejemplos de consultas:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {ejemplosConsulta.map((ejemplo, index) => (
                <button
                  key={index}
                  onClick={() => setConsulta(ejemplo)}
                  className="text-left p-3 rounded-lg border border-dashed border-muted-foreground/30 hover:border-primary hover:bg-primary/5 transition-colors text-sm"
                >
                  {ejemplo}
                </button>
              ))}
            </div>
          </div>

          <Button 
            onClick={handleCalcular} 
            disabled={calculando}
            className="w-full md:w-auto"
          >
            {calculando ? "Calculando..." : "Calcular Plan de Ahorro"}
          </Button>
        </CardContent>
      </Card>

      {resultado && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ahorro Mensual Requerido */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ahorro Mensual Requerido</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(resultado.cantidadMensual)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Cantidad mensual recomendada para tu meta
              </p>
            </CardContent>
          </Card>

          {/* Fecha de Finalización */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fecha Proyectada</CardTitle>
              <Calendar className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-success">
                {resultado.fechaProyectada}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Fecha estimada para alcanzar tu meta
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-danger" />
              Recomendaciones para Reducir Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(resultado.recomendaciones).map(([categoria, recomendacion], index) => (
                <div key={categoria} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium mt-0.5">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">{categoria}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {typeof recomendacion === 'string' 
                        ? recomendacion 
                        : typeof recomendacion === 'object' && recomendacion !== null && 'sugerencia' in recomendacion
                        ? (recomendacion as { sugerencia?: string }).sugerencia
                        : JSON.stringify(recomendacion)
                      }
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-medium text-primary mb-2">💡 Consejo adicional</h4>
              <p className="text-sm text-foreground">
                Considera automatizar tu ahorro configurando una transferencia automática mensual 
                de {formatCurrency(resultado.cantidadMensual)} a una cuenta de ahorros separada. 
                Esto te ayudará a mantener la disciplina y alcanzar tu meta más fácilmente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}