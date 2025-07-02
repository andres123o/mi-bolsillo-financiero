import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon, Upload, Plus, FileText } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface Transaccion {
  id: string;
  tipo: 'ingreso' | 'gasto';
  descripcion: string;
  categoria: string;
  cuenta: string;
  fecha: Date;
  monto: number;
  metodoPago: string;
  notas?: string;
  recibo?: string;
}

const categoriasPredefinidas = [
  'Alimentación',
  'Transporte',
  'Entretenimiento',
  'Servicios',
  'Salud',
  'Educación',
  'Compras',
  'Otros'
];

const cuentasDisponibles = [
  'Cuenta Corriente',
  'Cuenta de Ahorros',
  'Tarjeta de Crédito',
  'Efectivo'
];

const metodosPago = [
  'Efectivo',
  'Tarjeta de Débito',
  'Tarjeta de Crédito',
  'Transferencia',
  'PSE',
  'Nequi',
  'Daviplata'
];

export function SeguimientoActividad() {
  const [fecha, setFecha] = useState<Date>(new Date());
  const [tipo, setTipo] = useState<'ingreso' | 'gasto'>('gasto');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [mostrarNuevaCategoria, setMostrarNuevaCategoria] = useState(false);
  const [cuenta, setCuenta] = useState('');
  const [monto, setMonto] = useState('');
  const [metodoPago, setMetodoPago] = useState('');
  const [notas, setNotas] = useState('');
  const [recibo, setRecibo] = useState<File | null>(null);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);

  useEffect(() => {
    fetchTransacciones();
  }, []);

  const fetchTransacciones = async () => {
    try {
      const { data, error } = await supabase
        .from('transacciones')
        .select('*')
        .order('fecha', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      const transaccionesFormateadas = (data || []).map(t => ({
        ...t,
        fecha: new Date(t.fecha),
        metodoPago: t.metodo_pago
      })) as Transaccion[];
      
      setTransacciones(transaccionesFormateadas);
    } catch (error) {
      console.error('Error fetching transacciones:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!descripcion || !categoria || !cuenta || !monto || !metodoPago) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios.",
        variant: "destructive",
      });
      return;
    }

    const categoriaFinal = mostrarNuevaCategoria ? nuevaCategoria : categoria;
    
    try {
      const { data, error } = await supabase
        .from('transacciones')
        .insert([
          {
            tipo,
            descripcion,
            categoria: categoriaFinal,
            cuenta,
            fecha: fecha.toISOString().split('T')[0],
            monto: parseFloat(monto),
            metodo_pago: metodoPago,
            notas: notas || null,
            recibo: recibo?.name || null,
          }
        ])
        .select();

      if (error) throw error;

      // Actualizar la lista de transacciones
      await fetchTransacciones();
      
      // Limpiar formulario
      setDescripcion('');
      setCategoria('');
      setNuevaCategoria('');
      setMostrarNuevaCategoria(false);
      setCuenta('');
      setMonto('');
      setMetodoPago('');
      setNotas('');
      setRecibo(null);
      setFecha(new Date());

      toast({
        title: "Transacción agregada",
        description: `${tipo === 'ingreso' ? 'Ingreso' : 'Gasto'} de ${formatCurrency(parseFloat(monto))} registrado exitosamente.`,
      });
    } catch (error) {
      console.error('Error al guardar transacción:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la transacción. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setRecibo(file);
      toast({
        title: "Archivo cargado",
        description: `Recibo "${file.name}" cargado correctamente.`,
      });
    }
  };

  const handleCSVImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // En una implementación real, aquí procesarías el archivo CSV
      toast({
        title: "Importación CSV",
        description: "Funcionalidad de importación CSV disponible próximamente.",
      });
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Seguimiento de Actividad</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="relative">
            <FileText className="h-4 w-4 mr-2" />
            Importar CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registrar Nueva Transacción</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo de Transacción */}
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Transacción *</Label>
                <Select value={tipo} onValueChange={(value: 'ingreso' | 'gasto') => setTipo(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gasto">Gasto</SelectItem>
                    <SelectItem value="ingreso">Ingreso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción *</Label>
                <Input
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej: Compra en supermercado"
                />
              </div>

              {/* Categoría */}
              <div className="space-y-2">
                <Label>Categoría *</Label>
                {!mostrarNuevaCategoria ? (
                  <div className="flex gap-2">
                    <Select value={categoria} onValueChange={setCategoria}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriasPredefinidas.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setMostrarNuevaCategoria(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={nuevaCategoria}
                      onChange={(e) => setNuevaCategoria(e.target.value)}
                      placeholder="Nueva categoría"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setMostrarNuevaCategoria(false)}
                    >
                      Cancelar
                    </Button>
                  </div>
                )}
              </div>

              {/* Cuenta */}
              <div className="space-y-2">
                <Label>Cuenta *</Label>
                <Select value={cuenta} onValueChange={setCuenta}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {cuentasDisponibles.map((cta) => (
                      <SelectItem key={cta} value={cta}>{cta}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Fecha */}
              <div className="space-y-2">
                <Label>Fecha *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !fecha && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {fecha ? format(fecha, "PPP", { locale: es }) : "Selecciona una fecha"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={fecha}
                      onSelect={(date) => date && setFecha(date)}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Monto */}
              <div className="space-y-2">
                <Label htmlFor="monto">Monto (COP) *</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="monto"
                    type="number"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    placeholder="0"
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Método de Pago */}
              <div className="space-y-2">
                <Label>Método de Pago *</Label>
                <Select value={metodoPago} onValueChange={setMetodoPago}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    {metodosPago.map((metodo) => (
                      <SelectItem key={metodo} value={metodo}>{metodo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <Label htmlFor="notas">Notas (Opcional)</Label>
              <Textarea
                id="notas"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Notas adicionales sobre la transacción..."
                rows={3}
              />
            </div>

            {/* Carga de Recibo */}
            <div className="space-y-2">
              <Label>Recibo (Opcional)</Label>
              <div className="flex items-center gap-4">
                <Button type="button" variant="outline" className="relative">
                  <Upload className="h-4 w-4 mr-2" />
                  Cargar Recibo
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </Button>
                {recibo && (
                  <span className="text-sm text-muted-foreground">
                    Archivo: {recibo.name}
                  </span>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full md:w-auto">
              Registrar Transacción
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Transacciones Recientes */}
      {transacciones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Transacciones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transacciones.slice(0, 5).map((transaccion) => (
                <div key={transaccion.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        transaccion.tipo === 'ingreso' 
                          ? 'bg-success/10 text-success' 
                          : 'bg-danger/10 text-danger'
                      }`}>
                        {transaccion.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                      </span>
                      <span className="font-medium">{transaccion.descripcion}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {transaccion.categoria} • {transaccion.cuenta} • {format(transaccion.fecha, "dd/MM/yyyy", { locale: es })}
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${
                    transaccion.tipo === 'ingreso' ? 'text-success' : 'text-danger'
                  }`}>
                    {transaccion.tipo === 'ingreso' ? '+' : '-'}{formatCurrency(transaccion.monto)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}