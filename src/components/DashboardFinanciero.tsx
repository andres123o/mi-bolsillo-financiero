import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, CreditCard } from "lucide-react";

// Datos de ejemplo para los gráficos
const gastosPorCategoria = [
  { nombre: 'Alimentación', valor: 800000, color: '#E76161' },
  { nombre: 'Transporte', valor: 400000, color: '#1A5F7A' },
  { nombre: 'Entretenimiento', valor: 300000, color: '#159947' },
  { nombre: 'Servicios', valor: 500000, color: '#F39C12' },
  { nombre: 'Otros', valor: 200000, color: '#9B59B6' },
];

const ingresosVsGastos = [
  { mes: 'Ene', ingresos: 3500000, gastos: 2200000 },
  { mes: 'Feb', ingresos: 3500000, gastos: 2400000 },
  { mes: 'Mar', ingresos: 3600000, gastos: 2300000 },
  { mes: 'Abr', ingresos: 3500000, gastos: 2500000 },
  { mes: 'May', ingresos: 3700000, gastos: 2600000 },
  { mes: 'Jun', ingresos: 3500000, gastos: 2200000 },
];

const saldosCuenta = [
  { fecha: '1 Jun', saldo: 2500000 },
  { fecha: '8 Jun', saldo: 2800000 },
  { fecha: '15 Jun', saldo: 2600000 },
  { fecha: '22 Jun', saldo: 3200000 },
  { fecha: '29 Jun', saldo: 3500000 },
];

const cuentasIndividuales = [
  { cuenta: 'Cuenta Corriente', ingresos: 3500000, gastos: 1800000, saldo: 1700000 },
  { cuenta: 'Cuenta de Ahorros', ingresos: 200000, gastos: 400000, saldo: 1800000 },
  { cuenta: 'Tarjeta de Crédito', ingresos: 0, gastos: 2000000, saldo: -2000000 },
];

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
  const saldoTotal = cuentasIndividuales.reduce((total, cuenta) => total + cuenta.saldo, 0);
  const ingresosTotal = cuentasIndividuales.reduce((total, cuenta) => total + cuenta.ingresos, 0);
  const gastosTotal = cuentasIndividuales.reduce((total, cuenta) => total + cuenta.gastos, 0);

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