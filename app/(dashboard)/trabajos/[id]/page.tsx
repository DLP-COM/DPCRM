'use client'

import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
    FileText, User, Tag, Truck, Calendar, DollarSign,
    ArrowLeft, Loader2, Info, Receipt, CheckCircle
} from 'lucide-react'
import type { Pedido } from '@/lib/types'

export default function DetalleTrabajoPage() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()
    const [pedido, setPedido] = useState<Pedido | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadPedido = async () => {
            const { data, error } = await supabase
                .from('pedidos')
                .select('*, cliente:clientes(*)')
                .eq('id', id)
                .single()

            if (data) setPedido(data)
            setLoading(false)
        }
        loadPedido()
    }, [id])

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '80vh' }}>
                <Loader2 size={40} className="spin text-primary" />
            </div>
        )
    }

    if (!pedido) {
        return (
            <div className="flex-center flex-column" style={{ height: '80vh' }}>
                <FileText size={64} className="text-muted mb-md" />
                <h2>Pedido no encontrado</h2>
                <button onClick={() => router.back()} className="btn btn-primary mt-md">
                    <ArrowLeft size={16} /> Volver
                </button>
            </div>
        )
    }

    const saldo = pedido.precio_venta - pedido.sena

    return (
        <>
            <Header title={`Detalle de Trabajo #${pedido.nro_pedido}`} />

            <div className="mb-md flex-between">
                <button onClick={() => router.back()} className="btn btn-outline btn-sm">
                    <ArrowLeft size={16} /> Volver al Listado
                </button>
                <div className="flex gap-sm">
                    <span className={`badge ${pedido.pagado === 'pagado' ? 'success' : pedido.pagado === 'señado' ? 'warning' : 'danger'}`}>
                        Pago: {pedido.pagado.toUpperCase()}
                    </span>
                    <span className="badge primary">
                        Estado: {pedido.estado.toUpperCase()}
                    </span>
                </div>
            </div>

            <div className="grid-2">
                {/* Columna Principal: Info del Trabajo */}
                <div className="card">
                    <div className="card-body">
                        <div className="flex gap-sm items-center mb-lg">
                            <FileText size={24} className="text-primary" />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{pedido.nombre_trabajo}</h2>
                        </div>

                        <div style={{ display: 'grid', gap: '2rem' }}>
                            {/* Tags */}
                            <div>
                                <h3 className="text-muted uppercase mb-sm" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                                    Tipos de Trabajo y Proveedores
                                </h3>
                                <div className="flex gap-sm flex-wrap">
                                    {pedido.tipo_trabajo.map(t => (
                                        <span key={t} className="badge-tag">{t}</span>
                                    ))}
                                    {pedido.etiqueta_proveedor.map(p => (
                                        <span key={p} className="badge-tag orange">{p}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Cliente */}
                            <div>
                                <h3 className="text-muted uppercase mb-sm" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                                    Información del Cliente
                                </h3>
                                <div className="flex gap-md p-md rounded border">
                                    <div className="avatar-sm primary">
                                        {pedido.cliente?.nombre.charAt(0)}{pedido.cliente?.apellido.charAt(0)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{pedido.cliente?.nombre} {pedido.cliente?.apellido}</div>
                                        <div className="text-muted" style={{ fontSize: '0.875rem' }}>{pedido.cliente?.empresa || 'Particular'}</div>
                                    </div>
                                    <button
                                        onClick={() => router.push(`/clientes/${pedido.cliente_id}`)}
                                        className="btn btn-ghost btn-sm"
                                        style={{ marginLeft: 'auto' }}
                                    >
                                        Ver Perfil
                                    </button>
                                </div>
                            </div>

                            {/* Fechas */}
                            <div className="grid-2">
                                <div>
                                    <div className="flex gap-sm items-center text-muted mb-xs">
                                        <Calendar size={14} />
                                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Fecha Inicio</span>
                                    </div>
                                    <div style={{ fontWeight: 500 }}>
                                        {pedido.fecha_inicio ? new Date(pedido.fecha_inicio).toLocaleDateString('es-AR') : 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex gap-sm items-center text-muted mb-xs">
                                        <Truck size={14} />
                                        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>Fecha Entrega</span>
                                    </div>
                                    <div style={{ fontWeight: 500 }}>
                                        {pedido.fecha_entrega ? new Date(pedido.fecha_entrega).toLocaleDateString('es-AR') : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Lateral: Resumen Financiero */}
                <div className="card">
                    <div className="card-body">
                        <div className="flex gap-sm items-center mb-lg">
                            <DollarSign size={24} className="text-success" />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Resumen Financiero</h2>
                        </div>

                        <div className="flex-column gap-md">
                            <div className="flex-between p-md rounded" style={{ background: 'var(--color-bg-alt)' }}>
                                <span className="text-muted">Precio de Venta</span>
                                <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>$ {pedido.precio_venta.toLocaleString()}</span>
                            </div>

                            <div className="grid-2 gap-md">
                                <div className="p-md rounded border">
                                    <div className="text-muted mb-xs" style={{ fontSize: '0.75rem' }}>Costo Interno</div>
                                    <div style={{ fontWeight: 600 }}>$ {pedido.costo.toLocaleString()}</div>
                                </div>
                                <div className="p-md rounded border">
                                    <div className="text-muted mb-xs" style={{ fontSize: '0.75rem' }}>Seña</div>
                                    <div style={{ fontWeight: 600 }}>$ {pedido.sena.toLocaleString()}</div>
                                </div>
                            </div>

                            <div className="p-md rounded mt-md" style={{ background: saldo > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', border: saldo > 0 ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(34, 197, 94, 0.2)' }}>
                                <div className="flex-between items-center">
                                    <div>
                                        <div className="text-muted mb-xs" style={{ fontSize: '0.75rem' }}>Saldo Pendiente</div>
                                        <div style={{
                                            fontWeight: 800,
                                            fontSize: '1.5rem',
                                            color: saldo > 0 ? 'var(--color-danger)' : 'var(--color-success)'
                                        }}>
                                            $ {saldo.toLocaleString()}
                                        </div>
                                    </div>
                                    {saldo <= 0 ? (
                                        <CheckCircle size={32} className="text-success" />
                                    ) : (
                                        <Info size={32} className="text-danger" />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-xl p-md rounded border border-dashed">
                            <h4 className="flex gap-sm items-center mb-xs" style={{ fontSize: '0.875rem' }}>
                                <Receipt size={16} /> Nota de Pago
                            </h4>
                            <p className="text-muted" style={{ fontSize: '0.75rem' }}>
                                El saldo debe ser cancelado al momento de la entrega del trabajo.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
