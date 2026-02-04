import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Briefcase, Truck, Users, Star, ArrowUpRight } from 'lucide-react'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Obtener estadísticas
    const { count: totalClientes } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })

    const { count: trabajosActivos } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true })
        .neq('estado', 'terminado')

    const { data: pedidosPendientes } = await supabase
        .from('pedidos')
        .select(`
      *,
      cliente:clientes(nombre, apellido, empresa, cuit)
    `)
        .neq('estado', 'terminado')
        .order('fecha_entrega', { ascending: true })
        .limit(5)

    const { data: ingresosMes } = await supabase
        .from('pedidos')
        .select('precio_venta, sena')
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

    const totalIngresos = ingresosMes?.reduce((acc, p) => acc + (p.precio_venta || 0), 0) || 0
    const entregasPendientes = pedidosPendientes?.filter(p => p.fecha_entrega)?.length || 0

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value)
    }

    const formatDate = (date: string | null) => {
        if (!date) return '-'
        return new Date(date).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    }

    const getEstadoBadge = (estado: string) => {
        const estados: Record<string, { class: string; label: string }> = {
            'presupuestado': { class: 'warning', label: 'PRESUPUESTADO' },
            'en_cola': { class: 'orange', label: 'EN COLA' },
            'en_curso': { class: 'primary', label: 'EN PROCESO' },
            'terminado': { class: 'success', label: 'LISTO' },
        }
        return estados[estado] || { class: 'primary', label: estado.toUpperCase() }
    }

    return (
        <>
            <Header title="Tablero Principal" subtitle="Bienvenido de nuevo 👋" />

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card primary">
                    <Briefcase size={24} className="kpi-icon" />
                    <div className="kpi-label">Trabajos Activos</div>
                    <div className="kpi-value">{trabajosActivos || 0}</div>
                    <Link href="/trabajos" style={{ color: 'white', fontSize: '0.75rem', opacity: 0.8 }}>
                        Activos →
                    </Link>
                </div>

                <div className="kpi-card warning">
                    <Truck size={24} className="kpi-icon" />
                    <div className="kpi-label">Entregas Pendientes</div>
                    <div className="kpi-value">{entregasPendientes}</div>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Pendientes</span>
                </div>

                <div className="kpi-card success">
                    <div className="kpi-label">Ingresos Mensuales</div>
                    <div className="kpi-value" style={{ fontSize: '1.5rem' }}>
                        ARS<br />{formatCurrency(totalIngresos).replace('ARS', '').trim()}
                    </div>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Este Mes</span>
                </div>
            </div>

            {/* Tabla de trabajos pendientes */}
            <div className="card">
                <div className="card-body">
                    <div className="flex-between mb-md">
                        <div>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Trabajos Pendientes Recientes</h2>
                            <p className="text-muted" style={{ fontSize: '0.875rem' }}>Gestión de estados y cobros pendientes</p>
                        </div>
                        <div className="flex gap-sm">
                            <button className="btn btn-outline">Filtrar</button>
                            <Link href="/trabajos" className="btn btn-outline">Ver Todo <ArrowUpRight size={16} /></Link>
                        </div>
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Detalle del Trabajo</th>
                                    <th>Cliente / CUIT</th>
                                    <th>Fecha Entrega</th>
                                    <th>Estado</th>
                                    <th>Precio Venta</th>
                                    <th>Seña</th>
                                    <th>Saldo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedidosPendientes && pedidosPendientes.length > 0 ? (
                                    pedidosPendientes.map((pedido) => {
                                        const saldo = (pedido.precio_venta || 0) - (pedido.sena || 0)
                                        const badge = getEstadoBadge(pedido.estado)
                                        return (
                                            <tr key={pedido.id}>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                        <span
                                                            className={`badge ${pedido.tipo_trabajo?.[0]?.toLowerCase().includes('web') ? 'primary' : 'orange'}`}
                                                            style={{ minWidth: '45px', justifyContent: 'center' }}
                                                        >
                                                            {pedido.tipo_trabajo?.[0]?.substring(0, 3).toUpperCase() || 'TRB'}
                                                        </span>
                                                        <div>
                                                            <div style={{ fontWeight: 500 }}>{pedido.nombre_trabajo}</div>
                                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                                ID #TR-{pedido.nro_pedido}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>{pedido.cliente?.empresa || `${pedido.cliente?.nombre} ${pedido.cliente?.apellido}`}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                        {pedido.cliente?.cuit || '-'}
                                                    </div>
                                                </td>
                                                <td>{formatDate(pedido.fecha_entrega)}</td>
                                                <td>
                                                    <span className={`badge ${badge.class}`}>{badge.label}</span>
                                                </td>
                                                <td>{formatCurrency(pedido.precio_venta || 0)}</td>
                                                <td>{formatCurrency(pedido.sena || 0)}</td>
                                                <td style={{ color: saldo > 0 ? 'var(--color-success)' : 'inherit' }}>
                                                    {formatCurrency(saldo)}
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>
                                            <div style={{ color: 'var(--color-text-muted)' }}>
                                                No hay trabajos pendientes
                                            </div>
                                            <Link href="/trabajos/nuevo" className="btn btn-primary mt-md">
                                                Crear primer trabajo
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Footer Stats */}
            <div className="kpi-grid mt-lg">
                <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                    <Users size={24} style={{ color: 'var(--color-success)', marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{totalClientes || 0}</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>CLIENTES ACTIVOS</div>
                </div>
                <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                    <Truck size={24} style={{ color: 'var(--color-success)', marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>0</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>ENTREGAS REALIZADAS</div>
                </div>
                <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                    <Star size={24} style={{ color: 'var(--color-warning)', marginBottom: '0.5rem' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>4.9</div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>RATING PROMEDIO</div>
                </div>
            </div>
        </>
    )
}
