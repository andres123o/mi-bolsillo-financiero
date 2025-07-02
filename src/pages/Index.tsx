import { useState } from "react";
import { DashboardFinanciero } from "@/components/DashboardFinanciero";
import { SeguimientoActividad } from "@/components/SeguimientoActividad";
import { CalculadoraMetas } from "@/components/CalculadoraMetas";
import { Navegacion } from "@/components/Navegacion";

const Index = () => {
  const [seccionActiva, setSeccionActiva] = useState<'dashboard' | 'actividad' | 'calculadora'>('dashboard');

  const renderSeccionActiva = () => {
    switch (seccionActiva) {
      case 'dashboard':
        return <DashboardFinanciero />;
      case 'actividad':
        return <SeguimientoActividad />;
      case 'calculadora':
        return <CalculadoraMetas />;
      default:
        return <DashboardFinanciero />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navegacion 
        seccionActiva={seccionActiva} 
        onCambiarSeccion={setSeccionActiva} 
      />
      <main>
        {renderSeccionActiva()}
      </main>
    </div>
  );
};

export default Index;
