import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import { Truck, Clock, CheckCircle, MapPin, Plus, Printer, Calendar } from 'lucide-react'

export default async function EntregasPage() {
    const supabase = await createClient()

    // Obtener pedidos con fecha de entrega
    const { data: pedidos } = await supabase
        .from('pedidos')
        .select(`
      *,
      cliente:clientes(nombre, apellido, empresa, domicilio)
    `)
        .not('fecha_entrega', 'is', null)
        .order('fecha_entrega', { ascending: true })

    const hoy = new Date().toISOString().split('T')[0]
    const pendientesHoy = pedidos?.filter(p => p.fecha_entrega === hoy && p.estado !== 'terminado')?.length || 0
    const enCamino = pedidos?.filter(p => p.estado === 'en_curso')?.length || 0
    const completadas = pedidos?.filter(p => p.estado === 'terminado')?.length || 0

    const formatDate = (date: string) => {
        const d = new Date(date)
        return {
            day: d.getDate(),
            month: d.toLocaleDateString('es-AR', { month: 'short' }).toUpperCase()
        }
    }

    const getEstadoBadge = (estado: string) => {
        const estados: Record<string, { class: string; label: string }> = {
            'presupuestado': { class: 'warning', label: 'PENDIENTE DESPACHO' },
            'en_cola': { class: 'warning', label: 'PENDIENTE DESPACHO' },
            'en_curso': { class: 'primary', label: 'EN REPARTO' },
            'terminado': { class: 'success', label: 'ENTREGADO' },
        }
        return estados[estado] || { class: 'primary', label: estado.toUpperCase() }
    }

    return (
        <>
            <Header title="Calendario de Entregas" subtitle="Planificación de ruta y logística de despachos" />

            {/* Filtros */}
            <div className="flex-between mb-md">
                <div className="flex gap-md" style={{ alignItems: 'center' }}>
                    <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                        <span className="text-muted" style={{ fontSize: '0.875rem' }}>DESDE</span>
                        <input type="date" className="form-input" style={{ width: 'auto', padding: '0.5rem' }} />
                    </div>
                    <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                        <span className="text-muted" style={{ fontSize: '0.875rem' }}>HASTA</span>
                        <input type="date" className="form-input" style={{ width: 'auto', padding: '0.5rem' }} />
                    </div>
                    <select className="form-select" style={{ width: 'auto', padding: '0.5rem 1rem' }}>
                        <option>Todos los estados</option>
                        <option>Pendiente</option>
                        <option>En Reparto</option>
                        <option>Entregado</option>
                    </select>
                </div>
                <div className="flex gap-sm">
                    <button className="btn btn-success">
                        <Plus size={16} /> Nueva Entrega
                    </button>
                    <button className="btn btn-outline">
                        <Printer size={16} /> Imprimir Hoja de Ruta
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="card" style={{ padding: '1rem' }}>
                    <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(99, 102, 241, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Clock size={20} style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>HOY</div>
                            <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>{pendientesHoy} Pendientes</div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '1rem' }}>
                    <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(234, 179, 8, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Truck size={20} style={{ color: 'var(--color-warning)' }} />
                        </div>
                        <div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>EN PROCESO</div>
                            <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>{enCamino} En Camino</div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '1rem' }}>
                    <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(34, 197, 94, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <CheckCircle size={20} style={{ color: 'var(--color-success)' }} />
                        </div>
                        <div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>COMPLETADAS</div>
                            <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>{completadas} Entregas</div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '1rem' }}>
                    <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: 'rgba(99, 102, 241, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <MapPin size={20} style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>ZONAS</div>
                            <div style={{ fontWeight: 700, fontSize: '1.25rem' }}>CABA & GBA</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lista de entregas */}
            <div className="card mt-md">
                <div className="card-body">
                    {pedidos && pedidos.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {pedidos.map(pedido => {
                                const date = formatDate(pedido.fecha_entrega)
                                const badge = getEstadoBadge(pedido.estado)

                                return (
                                    <div
                                        key={pedido.id}
                                        className="card"
                                        style={{
                                            display: 'flex',
                                            gap: '1.5rem',
                                            padding: '1rem',
                                            alignItems: 'center',
                                            borderLeft: `4px solid ${pedido.estado === 'terminado' ? 'var(--color-success)' :
                                                    pedido.estado === 'en_curso' ? 'var(--color-primary)' :
                                                        'var(--color-warning)'
                                                }`
                                        }}
                                    >
                                        {/* Fecha */}
                                        <div style={{
                                            textAlign: 'center',
                                            minWidth: '60px',
                                            background: 'var(--color-bg-tertiary)',
                                            padding: '0.5rem',
                                            borderRadius: 'var(--radius-md)'
                                        }}>
                                            <div style={{ fontSize: '0.65rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                                                {date.month}
                                            </div>
                                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{date.day}</div>
                                        </div>

                                        {/* Producto */}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                                                {pedido.nombre_trabajo}
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                                {pedido.cliente?.empresa || `${pedido.cliente?.nombre} ${pedido.cliente?.apellido}`}
                                            </div>
                                        </div>

                                        {/* Dirección */}
                                        <div style={{ flex: 1 }}>
                                            <div className="flex gap-sm" style={{ alignItems: 'flex-start' }}>
                                                <MapPin size={16} style={{ color: 'var(--color-danger)', marginTop: '2px' }} />
                                                <div>
                                                    <div style={{ fontSize: '0.875rem' }}>
                                                        {pedido.cliente?.domicilio || 'Sin dirección'}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                        CABA
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Estado */}
                                        <div>
                                            <span className={`badge ${badge.class}`}>{badge.label}</span>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                                Remito: #R-{String(pedido.nro_pedido).padStart(5, '0')}
                                            </div>
                                        </div>

                                        {/* Acciones */}
                                        <div className="flex gap-sm">
                                            <button className="btn btn-ghost" title="Ver detalles">
                                                <Calendar size={18} />
                                            </button>
                                            <button className="btn btn-ghost" title="Imprimir">
                                                <Printer size={18} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <Truck size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                            <div style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                No hay entregas programadas
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                Las entregas aparecerán aquí cuando agregues fechas de entrega a los trabajos.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Sugerencia */}
            <div className="card mt-md" style={{
                background: 'linear-gradient(135deg, var(--sidebar-bg) 0%, #312E81 100%)',
                color: 'white'
            }}>
                <div className="card-body flex-between">
                    <div>
                        <h3 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>🚚 Optimización de Rutas</h3>
                        <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                            Sugerencia: Tienes entregas próximas en zonas cercanas. Podrías unificar el flete.
                        </p>
                    </div>
                    <button className="btn" style={{ background: 'white', color: 'var(--sidebar-bg)' }}>
                        Calcular Ruta Eficiente
                    </button>
                </div>
            </div>
        </>
    )
}
