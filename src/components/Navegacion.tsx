import { useState } from "react";
import { cn } from "@/lib/utils";
import { BarChart3, Activity, Calculator } from "lucide-react";

interface NavegacionProps {
  seccionActiva: 'dashboard' | 'actividad' | 'calculadora';
  onCambiarSeccion: (seccion: 'dashboard' | 'actividad' | 'calculadora') => void;
}

const opcionesMenu = [
  {
    id: 'dashboard' as const,
    nombre: 'Dashboard',
    icono: BarChart3,
    descripcion: 'Visualización financiera'
  },
  {
    id: 'actividad' as const,
    nombre: 'Actividad',
    icono: Activity,
    descripcion: 'Seguimiento de transacciones'
  },
  {
    id: 'calculadora' as const,
    nombre: 'Metas',
    icono: Calculator,
    descripcion: 'Calculadora de ahorro'
  }
];

export function Navegacion({ seccionActiva, onCambiarSeccion }: NavegacionProps) {
  return (
    <nav className="bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo y título */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Dashboard Financiero</h1>
              <p className="text-xs text-muted-foreground">Gestión financiera personal</p>
            </div>
          </div>

          {/* Menú de navegación */}
          <div className="flex space-x-1">
            {opcionesMenu.map((opcion) => {
              const Icono = opcion.icono;
              const esActiva = seccionActiva === opcion.id;
              
              return (
                <button
                  key={opcion.id}
                  onClick={() => onCambiarSeccion(opcion.id)}
                  className={cn(
                    "flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    esActiva
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icono className="h-4 w-4" />
                  <span className="hidden sm:block">{opcion.nombre}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}