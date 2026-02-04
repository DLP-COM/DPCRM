-- =============================================
-- DPCOM360 - RECREAR TABLAS (OPCIÓN 1)
-- Ejecutar TODO junto en Supabase SQL Editor
-- =============================================

-- PASO 1: Borrar tablas existentes
DROP TABLE IF EXISTS configuraciones CASCADE;
DROP TABLE IF EXISTS gastos CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;

-- PASO 2: Crear tablas nuevas

-- ============ TABLA: CLIENTES ============
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  empresa TEXT,
  telefono_personal TEXT,
  telefono_empresa TEXT,
  email TEXT,
  cuit TEXT,
  domicilio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ TABLA: PEDIDOS ============
CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nro_pedido SERIAL,
  nombre_trabajo TEXT NOT NULL,
  cliente_id UUID REFERENCES clientes(id),
  tipo_trabajo TEXT[] DEFAULT '{}',
  etiqueta_proveedor TEXT[] DEFAULT '{}',
  estado TEXT DEFAULT 'presupuestado',
  costo NUMERIC(12,2) DEFAULT 0,
  precio_venta NUMERIC(12,2) DEFAULT 0,
  sena NUMERIC(12,2) DEFAULT 0,
  pagado TEXT DEFAULT 'pendiente',
  fecha_inicio DATE,
  fecha_entrega DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ TABLA: GASTOS ============
CREATE TABLE gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  concepto TEXT NOT NULL,
  monto NUMERIC(12,2) NOT NULL,
  fecha_pago DATE,
  categoria TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============ TABLA: CONFIGURACIONES ============
CREATE TABLE configuraciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  tema TEXT DEFAULT 'claro',
  tipos_trabajo TEXT[] DEFAULT ARRAY['Offset', 'Digital', 'Web', 'Meta Ads', 'Asesoramiento'],
  proveedores TEXT[] DEFAULT ARRAY['Taller Interno', 'Proveedor Externo'],
  estados TEXT[] DEFAULT ARRAY['Presupuestado', 'En Cola', 'En Curso', 'Terminado'],
  categorias_gasto TEXT[] DEFAULT ARRAY['Insumos', 'Servicios', 'Fijos', 'Mantenimiento']
);

-- PASO 3: Habilitar RLS
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuraciones ENABLE ROW LEVEL SECURITY;

-- PASO 4: Crear políticas RLS
CREATE POLICY "Users can CRUD own clientes" ON clientes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own pedidos" ON pedidos
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own gastos" ON gastos
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own config" ON configuraciones
  FOR ALL USING (auth.uid() = user_id);

-- PASO 5: Índices para performance
CREATE INDEX idx_clientes_user_id ON clientes(user_id);
CREATE INDEX idx_pedidos_user_id ON pedidos(user_id);
CREATE INDEX idx_pedidos_cliente_id ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);
CREATE INDEX idx_gastos_user_id ON gastos(user_id);
CREATE INDEX idx_configuraciones_user_id ON configuraciones(user_id);

-- ✅ LISTO! Las tablas fueron recreadas
