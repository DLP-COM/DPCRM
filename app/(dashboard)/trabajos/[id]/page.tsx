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

            <div className="mb-md">
                <button onClick={() => router.back()} className="btn btn-outline btn-sm">
                    <ArrowLeft size={16} /> Volver al Listado
                </button>
            </div>

            <div className="grid-2">
                {/* Columna Principal: Datos del Trabajo */}
                <div className="card">
                    <div className="card-body">
                        <div className="flex gap-sm items-center mb-lg">
                            <FileText size={24} className="text-primary" />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Información del Pedido</h2>
                        </div>

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div className="flex-between border-b pb-sm">
                                <span className="text-muted font-medium">Nro Pedido:</span>
                                <span style={{ fontWeight: 600 }}>#{String(pedido.nro_pedido).padStart(5, '0')}</span>
                            </div>

                            <div className="flex-between border-b pb-sm">
                                <span className="text-muted font-medium">Nombre del Trabajo:</span>
                                <span style={{ fontWeight: 600 }}>{pedido.nombre_trabajo}</span>
                            </div>

                            <div className="flex-between border-b pb-sm">
                                <span className="text-muted font-medium">Empresa:</span>
                                <span style={{ fontWeight: 600 }}>{pedido.cliente?.empresa || 'Particular'}</span>
                            </div>

                            <div className="border-b pb-sm">
                                <span className="text-muted font-medium block mb-xs">Tipo de Trabajo:</span>
                                <div className="flex gap-sm flex-wrap">
                                    {pedido.tipo_trabajo.length > 0 ? pedido.tipo_trabajo.map(t => (
                                        <span key={t} className="badge-tag">{t}</span>
                                    )) : <span className="text-muted">-</span>}
                                </div>
                            </div>

                            <div className="border-b pb-sm">
                                <span className="text-muted font-medium block mb-xs">Etiqueta/Proveedor:</span>
                                <div className="flex gap-sm flex-wrap">
                                    {(pedido.etiqueta_proveedor && pedido.etiqueta_proveedor.length > 0) ? pedido.etiqueta_proveedor.map(p => (
                                        <span key={p} className="badge-tag orange">{p}</span>
                                    )) : <span className="text-muted">-</span>}
                                </div>
                            </div>

                            <div className="flex-between border-b pb-sm">
                                <span className="text-muted font-medium">Estado:</span>
                                <span className="badge primary">{pedido.estado.toUpperCase()}</span>
                            </div>

                            <div className="flex-between border-b pb-sm">
                                <span className="text-muted font-medium">Pagado:</span>
                                <span className={`badge ${pedido.pagado === 'pagado' ? 'success' : pedido.pagado === 'señado' ? 'warning' : 'danger'}`}>
                                    {pedido.pagado.toUpperCase()}
                                </span>
                            </div>

                            <div className="grid-2 gap-md">
                                <div>
                                    <span className="text-muted font-medium block mb-xs">Fecha inicio:</span>
                                    <div className="flex gap-sm items-center">
                                        <Calendar size={14} className="text-muted" />
                                        <span>{pedido.fecha_inicio ? new Date(pedido.fecha_inicio).toLocaleDateString('es-AR') : 'N/A'}</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-muted font-medium block mb-xs">Fecha entrega:</span>
                                    <div className="flex gap-sm items-center">
                                        <Truck size={14} className="text-muted" />
                                        <span>{pedido.fecha_entrega ? new Date(pedido.fecha_entrega).toLocaleDateString('es-AR') : 'N/A'}</span>
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
                            <div className="flex-between border-b pb-sm">
                                <span className="text-muted">Costo:</span>
                                <span className="font-semibold">$ {pedido.costo.toLocaleString()}</span>
                            </div>

                            <div className="flex-between border-b pb-sm">
                                <span className="text_muted">Precio Venta:</span>
                                <span className="font-bold text-lg">$ {pedido.precio_venta.toLocaleString()}</span>
                            </div>

                            <div className="flex-between border-b pb-sm">
                                <span className="text-muted">Seña:</span>
                                <span className="font-semibold">$ {pedido.sena.toLocaleString()}</span>
                            </div>

                            <div className="p-md rounded mt-md" style={{ background: saldo > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', border: saldo > 0 ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(34, 197, 94, 0.2)' }}>
                                <div className="flex-between items-center">
                                    <div>
                                        <div className="text-muted mb-xs" style={{ fontSize: '0.875rem', fontWeight: 600 }}>Saldo:</div>
                                        <div style={{
                                            fontWeight: 800,
                                            fontSize: '1.75rem',
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

                            <div className="mt-xl p-md rounded border border-dashed">
                                <h4 className="flex gap-sm items-center mb-xs" style={{ fontSize: '0.875rem' }}>
                                    <Receipt size={16} /> Nota de Pago
                                </h4>
                                <p className="text-muted" style={{ fontSize: '0.75rem' }}>
                                    El cliente: <strong>{pedido.cliente?.nombre} {pedido.cliente?.apellido}</strong> debe cancelar el saldo al momento de la entrega.
                                </p>
                                <button
                                    onClick={() => router.push(`/clientes/${pedido.cliente_id}`)}
                                    className="btn btn-ghost btn-sm mt-sm"
                                    style={{ padding: 0 }}
                                >
                                    Ver Perfil del Cliente →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
