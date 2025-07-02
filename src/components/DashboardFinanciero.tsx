import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Transaccion {
  id: string;
  tipo: 'ingreso' | 'gasto';
  descripcion: string;
  categoria: string;
  cuenta: string;
  fecha: string;
  monto: number;
  metodo_pago: string;
  notas?: string;
  recibo?: string;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-3 border rounded-lg shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }}>
            {entry.dataKey === 'ingresos' ? 'Ingresos' : 
             entry.dataKey === 'gastos' ? 'Gastos' : 
             entry.dataKey === 'saldo' ? 'Saldo' : entry.dataKey}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function DashboardFinanciero() {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransacciones();
  }, []);

  const fetchTransacciones = async () => {
    try {
      const { data, error } = await supabase
        .from('transacciones')
        .select('*')
        .order('fecha', { ascending: false });

      if (error) throw error;
      setTransacciones((data || []) as Transaccion[]);
    } catch (error) {
      console.error('Error fetching transacciones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular datos para los gráficos
  const gastosPorCategoria = transacciones
    .filter(t => t.tipo === 'gasto')
    .reduce((acc, transaccion) => {
      const categoria = transaccion.categoria;
      const existing = acc.find(item => item.nombre === categoria);
      if (existing) {
        existing.valor += transaccion.monto;
      } else {
        acc.push({
          nombre: categoria,
          valor: transaccion.monto,
          color: getCategoryColor(categoria)
        });
      }
      return acc;
    }, [] as { nombre: string; valor: number; color: string }[]);

  // Calcular ingresos vs gastos por mes
  const ingresosVsGastos = transacciones.reduce((acc, transaccion) => {
    const fecha = new Date(transaccion.fecha);
    const mes = fecha.toLocaleDateString('es-CO', { month: 'short' });
    const existing = acc.find(item => item.mes === mes);
    
    if (existing) {
      if (transaccion.tipo === 'ingreso') {
        existing.ingresos += transaccion.monto;
      } else {
        existing.gastos += transaccion.monto;
      }
    } else {
      acc.push({
        mes,
        ingresos: transaccion.tipo === 'ingreso' ? transaccion.monto : 0,
        gastos: transaccion.tipo === 'gasto' ? transaccion.monto : 0
      });
    }
    return acc;
  }, [] as { mes: string; ingresos: number; gastos: number }[]);

  // Calcular evolución del saldo
  const saldosCuenta = transacciones
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
    .reduce((acc, transaccion, index) => {
      const fecha = new Date(transaccion.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
      const saldoAnterior = index > 0 ? acc[acc.length - 1].saldo : 0;
      const cambio = transaccion.tipo === 'ingreso' ? transaccion.monto : -transaccion.monto;
      
      acc.push({
        fecha,
        saldo: saldoAnterior + cambio
      });
      return acc;
    }, [] as { fecha: string; saldo: number }[]);

  // Calcular resumen por cuenta
  const cuentasIndividuales = transacciones.reduce((acc, transaccion) => {
    const cuenta = transaccion.cuenta;
    const existing = acc.find(item => item.cuenta === cuenta);
    
    if (existing) {
      if (transaccion.tipo === 'ingreso') {
        existing.ingresos += transaccion.monto;
        existing.saldo += transaccion.monto;
      } else {
        existing.gastos += transaccion.monto;
        existing.saldo -= transaccion.monto;
      }
    } else {
      acc.push({
        cuenta,
        ingresos: transaccion.tipo === 'ingreso' ? transaccion.monto : 0,
        gastos: transaccion.tipo === 'gasto' ? transaccion.monto : 0,
        saldo: transaccion.tipo === 'ingreso' ? transaccion.monto : -transaccion.monto
      });
    }
    return acc;
  }, [] as { cuenta: string; ingresos: number; gastos: number; saldo: number }[]);

  const saldoTotal = cuentasIndividuales.reduce((total, cuenta) => total + cuenta.saldo, 0);
  const ingresosTotal = cuentasIndividuales.reduce((total, cuenta) => total + cuenta.ingresos, 0);
  const gastosTotal = cuentasIndividuales.reduce((total, cuenta) => total + cuenta.gastos, 0);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="text-center">Cargando datos financieros...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Dashboard Financiero</h1>
      </div>

      {/* Resumen Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(saldoTotal)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos del Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(ingresosTotal)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gastos del Mes</CardTitle>
            <TrendingDown className="h-4 w-4 text-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-danger">{formatCurrency(gastosTotal)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Circular - Gastos por Categoría */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gastosPorCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ nombre, percent }) => `${nombre} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="valor"
                >
                  {gastosPorCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Barras - Ingresos vs Gastos */}
        <Card>
          <CardHeader>
            <CardTitle>Ingresos vs Gastos Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ingresosVsGastos}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="ingresos" fill="hsl(var(--success))" name="Ingresos" />
                <Bar dataKey="gastos" fill="hsl(var(--danger))" name="Gastos" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Líneas - Saldos de Cuenta */}
      <Card>
        <CardHeader>
          <CardTitle>Evolución del Saldo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={saldosCuenta}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="saldo" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabla de Cuentas Individuales */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose por Cuenta</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium">Cuenta</th>
                  <th className="text-right p-2 font-medium">Ingresos</th>
                  <th className="text-right p-2 font-medium">Gastos</th>
                  <th className="text-right p-2 font-medium">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {cuentasIndividuales.map((cuenta, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{cuenta.cuenta}</td>
                    <td className="text-right p-2 text-success">{formatCurrency(cuenta.ingresos)}</td>
                    <td className="text-right p-2 text-danger">{formatCurrency(cuenta.gastos)}</td>
                    <td className={`text-right p-2 font-medium ${cuenta.saldo >= 0 ? 'text-success' : 'text-danger'}`}>
                      {formatCurrency(cuenta.saldo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function getCategoryColor(categoria: string): string {
  const colors: { [key: string]: string } = {
    'Alimentación': '#E76161',
    'Transporte': '#1A5F7A',
    'Entretenimiento': '#159947',
    'Servicios': '#F39C12',
    'Salud': '#9B59B6',
    'Educación': '#3498DB',
    'Compras': '#E67E22',
    'Salario': '#27AE60',
    'Trabajo Extra': '#2ECC71'
  };
  return colors[categoria] || '#95A5A6';
}