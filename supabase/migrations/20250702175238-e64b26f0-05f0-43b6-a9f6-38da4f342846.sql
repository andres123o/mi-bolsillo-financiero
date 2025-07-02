-- Crear tabla de transacciones financieras
CREATE TABLE public.transacciones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('ingreso', 'gasto')),
  descripcion TEXT NOT NULL,
  categoria TEXT NOT NULL,
  cuenta TEXT NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  monto NUMERIC(15,2) NOT NULL CHECK (monto > 0),
  metodo_pago TEXT NOT NULL,
  notas TEXT,
  recibo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear función para actualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualización automática de timestamps
CREATE TRIGGER update_transacciones_updated_at
  BEFORE UPDATE ON public.transacciones
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insertar datos de ejemplo
INSERT INTO public.transacciones (tipo, descripcion, categoria, cuenta, fecha, monto, metodo_pago, notas) VALUES
('gasto', 'Compra en supermercado', 'Alimentación', 'Cuenta Corriente', '2024-06-15', 120000, 'Tarjeta de Débito', 'Compras semanales'),
('gasto', 'Transporte público', 'Transporte', 'Efectivo', '2024-06-14', 8500, 'Efectivo', ''),
('ingreso', 'Salario mensual', 'Salario', 'Cuenta Corriente', '2024-06-01', 3500000, 'Transferencia', 'Pago de nómina'),
('gasto', 'Cine', 'Entretenimiento', 'Tarjeta de Crédito', '2024-06-13', 25000, 'Tarjeta de Crédito', 'Película con amigos'),
('gasto', 'Internet', 'Servicios', 'Cuenta Corriente', '2024-06-05', 65000, 'Transferencia', 'Pago mensual'),
('gasto', 'Gasolina', 'Transporte', 'Tarjeta de Crédito', '2024-06-10', 85000, 'Tarjeta de Crédito', 'Tanque lleno'),
('gasto', 'Almuerzo', 'Alimentación', 'Efectivo', '2024-06-12', 18000, 'Efectivo', 'Restaurante'),
('ingreso', 'Freelance', 'Trabajo Extra', 'Cuenta de Ahorros', '2024-06-08', 500000, 'Transferencia', 'Proyecto web');