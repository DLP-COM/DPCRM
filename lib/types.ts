// ============ TABLA: CLIENTES ============
export interface Cliente {
    id: string
    user_id: string
    nombre: string
    apellido: string
    empresa: string | null
    telefono_personal: string | null
    telefono_empresa: string | null
    email: string | null
    cuit: string | null
    domicilio: string | null
    created_at: string
}

// ============ TABLA: PEDIDOS ============
export interface Pedido {
    id: string
    user_id: string
    nro_pedido: number
    nombre_trabajo: string
    cliente_id: string | null
    tipo_trabajo: string[]
    etiqueta_proveedor: string[]
    estado: string
    costo: number
    precio_venta: number
    sena: number
    pagado: 'pendiente' | 'señado' | 'pagado'
    fecha_inicio: string | null
    fecha_entrega: string | null
    created_at: string
    // Relación
    cliente?: Cliente
}

// ============ TABLA: GASTOS ============
export interface Gasto {
    id: string
    user_id: string
    concepto: string
    monto: number
    fecha_pago: string | null
    categoria: string[]
    created_at: string
}

// ============ CONFIGURACIÓN ============
export interface Configuracion {
    id: string
    user_id: string
    tema: 'claro' | 'oscuro'
    tipos_trabajo: string[]
    proveedores: string[]
    estados: string[]
    categorias_gasto: string[]
}

// ============ TIPOS DE FORMULARIO ============
export type ClienteFormData = Omit<Cliente, 'id' | 'user_id' | 'created_at'>
export type PedidoFormData = Omit<Pedido, 'id' | 'user_id' | 'nro_pedido' | 'created_at' | 'cliente'>
export type GastoFormData = Omit<Gasto, 'id' | 'user_id' | 'created_at'>

// ============ KANBAN ============
export interface KanbanColumn {
    id: string
    title: string
    pedidos: Pedido[]
}
