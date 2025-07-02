import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Calculator, Target, TrendingDown, Calendar } from "lucide-react";

interface ResultadoCalculo {
  ahorroMensual: number;
  fechaFinalizacion: string;
  recomendaciones: string[];
  montoMeta: number;
  plazoMeses: number;
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

  const procesarConsulta = (consulta: string): ResultadoCalculo | null => {
    // Expresiones regulares para extraer información
    const montoRegex = /(\d+(?:\.\d+)?)\s*(?:millones?|m)/i;
    const plazoRegex = /(\d+)\s*(?:meses?|años?|año)/i;
    const porcentajeRegex = /(\d+)%/;

    let montoMeta = 0;
    let plazoMeses = 12;

    // Extraer monto
    const montoMatch = consulta.match(montoRegex);
    if (montoMatch) {
      montoMeta = parseFloat(montoMatch[1]) * 1000000; // Convertir millones a pesos
    } else {
      // Buscar números grandes (asumiendo que son pesos directamente)
      const numeroGrande = consulta.match(/(\d{1,3}(?:\.\d{3})+)/);
      if (numeroGrande) {
        montoMeta = parseInt(numeroGrande[1].replace(/\./g, ''));
      }
    }

    // Extraer plazo
    const plazoMatch = consulta.match(plazoRegex);
    if (plazoMatch) {
      const numero = parseInt(plazoMatch[1]);
      if (consulta.toLowerCase().includes('año')) {
        plazoMeses = numero * 12;
      } else {
        plazoMeses = numero;
      }
    }

    if (montoMeta === 0) {
      return null;
    }

    const ahorroMensual = montoMeta / plazoMeses;
    const fechaActual = new Date();
    const fechaFinalizacion = new Date(fechaActual.getTime() + (plazoMeses * 30 * 24 * 60 * 60 * 1000));

    // Generar recomendaciones basadas en el monto
    const recomendaciones = [];
    
    if (ahorroMensual > 1000000) {
      recomendaciones.push("Considera reducir gastos en entretenimiento y restaurantes");
      recomendaciones.push("Busca ingresos adicionales o un trabajo de medio tiempo");
      recomendaciones.push("Revisa suscripciones y servicios que no uses frecuentemente");
    } else if (ahorroMensual > 500000) {
      recomendaciones.push("Reduce gastos en compras no esenciales");
      recomendaciones.push("Utiliza cupones y ofertas para las compras necesarias");
      recomendaciones.push("Considera cocinar más en casa en lugar de comer fuera");
    } else {
      recomendaciones.push("Establece un presupuesto mensual y síguelo estrictamente");
      recomendaciones.push("Automatiza tu ahorro para que sea más fácil cumplir la meta");
      recomendaciones.push("Busca formas de aumentar tus ingresos gradualmente");
    }

    // Añadir recomendaciones específicas por tipo de meta
    if (consulta.toLowerCase().includes('casa') || consulta.toLowerCase().includes('vivienda')) {
      recomendaciones.push("Investiga opciones de crédito hipotecario para complementar tu ahorro");
      recomendaciones.push("Considera ahorrar primero para la cuota inicial (30% del valor)");
    } else if (consulta.toLowerCase().includes('carro') || consulta.toLowerCase().includes('vehículo')) {
      recomendaciones.push("Evalúa opciones de crédito vehicular con tasas preferenciales");
      recomendaciones.push("Considera vehículos usados en buen estado para reducir el costo");
    } else if (consulta.toLowerCase().includes('viaje') || consulta.toLowerCase().includes('vacaciones')) {
      recomendaciones.push("Busca ofertas y promociones de temporada baja");
      recomendaciones.push("Considera destinos locales para reducir costos de transporte");
    }

    return {
      ahorroMensual,
      fechaFinalizacion: fechaFinalizacion.toLocaleDateString('es-CO', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      recomendaciones,
      montoMeta,
      plazoMeses
    };
  };

  const handleCalcular = () => {
    if (!consulta.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu consulta de ahorro.",
        variant: "destructive",
      });
      return;
    }

    setCalculando(true);
    
    // Simular procesamiento
    setTimeout(() => {
      const resultado = procesarConsulta(consulta);
      
      if (resultado) {
        setResultado(resultado);
        toast({
          title: "Cálculo completado",
          description: "Se ha generado tu plan de ahorro personalizado.",
        });
      } else {
        toast({
          title: "Error en el cálculo",
          description: "No se pudo procesar tu consulta. Asegúrate de incluir el monto y plazo deseado.",
          variant: "destructive",
        });
      }
      
      setCalculando(false);
    }, 1500);
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Ahorro Mensual Requerido */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ahorro Mensual Requerido</CardTitle>
              <Target className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(resultado.ahorroMensual)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Para alcanzar tu meta de {formatCurrency(resultado.montoMeta)}
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
                {resultado.fechaFinalizacion}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                En {resultado.plazoMeses} meses alcanzarás tu meta
              </p>
            </CardContent>
          </Card>

          {/* Resumen de la Meta */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meta Total</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-foreground">
                {formatCurrency(resultado.montoMeta)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Objetivo de ahorro establecido
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
              {resultado.recomendaciones.map((recomendacion, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-relaxed">{recomendacion}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-medium text-primary mb-2">💡 Consejo adicional</h4>
              <p className="text-sm text-foreground">
                Considera automatizar tu ahorro configurando una transferencia automática mensual 
                de {formatCurrency(resultado.ahorroMensual)} a una cuenta de ahorros separada. 
                Esto te ayudará a mantener la disciplina y alcanzar tu meta más fácilmente.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}