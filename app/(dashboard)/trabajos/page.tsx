import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Briefcase, Plus, Filter, LayoutGrid } from 'lucide-react'

export default async function TrabajosPage() {
    const supabase = await createClient()

    const { data: pedidos } = await supabase
        .from('pedidos')
        .select(`
      *,
      cliente:clientes(nombre, apellido, empresa)
    `)
        .order('created_at', { ascending: false })

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0
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
            'en_curso': { class: 'primary', label: 'EN CURSO' },
            'terminado': { class: 'success', label: 'TERMINADO' },
        }
        return estados[estado] || { class: 'primary', label: estado.toUpperCase() }
    }

    const getPagoBadge = (pagado: string) => {
        const pagos: Record<string, { class: string; label: string }> = {
            'pendiente': { class: 'danger', label: 'SIN PAGAR' },
            'señado': { class: 'warning', label: 'SEÑADO' },
            'pagado': { class: 'success', label: 'PAGADO' },
        }
        return pagos[pagado] || { class: 'danger', label: 'SIN PAGAR' }
    }

    return (
        <>
            <Header title="Listado de Trabajos" />

            {/* Filtros y acciones */}
            <div className="card mb-md">
                <div className="card-body" style={{ padding: '1rem' }}>
                    <div className="flex-between">
                        <div className="flex gap-md">
                            <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                                <Filter size={16} style={{ color: 'var(--color-text-muted)' }} />
                                <span className="text-muted" style={{ fontSize: '0.875rem' }}>Filtros</span>
                            </div>
                            <select className="form-select" style={{ width: 'auto', padding: '0.5rem 1rem' }}>
                                <option>ESTADO: Todos</option>
                                <option>Presupuestado</option>
                                <option>En Cola</option>
                                <option>En Curso</option>
                                <option>Terminado</option>
                            </select>
                            <select className="form-select" style={{ width: 'auto', padding: '0.5rem 1rem' }}>
                                <option>PAGO: Todos</option>
                                <option>Sin Pagar</option>
                                <option>Señado</option>
                                <option>Pagado</option>
                            </select>
                        </div>
                        <div className="flex gap-sm">
                            <Link href="/trabajos/kanban" className="btn btn-outline">
                                <LayoutGrid size={16} /> Vista Kanban
                            </Link>
                            <Link href="/trabajos/nuevo" className="btn btn-success">
                                <Plus size={16} /> Nuevo Trabajo
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla */}
            <div className="card">
                <div className="card-body">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nro Pedido</th>
                                    <th>Trabajo</th>
                                    <th>Cliente/Empresa</th>
                                    <th>Estado</th>
                                    <th>Pago</th>
                                    <th>Entrega</th>
                                    <th>Saldo</th>
                                    <th style={{ width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedidos && pedidos.length > 0 ? (
                                    pedidos.map((pedido) => {
                                        const saldo = (pedido.precio_venta || 0) - (pedido.sena || 0)
                                        const estadoBadge = getEstadoBadge(pedido.estado)
                                        const pagoBadge = getPagoBadge(pedido.pagado)

                                        return (
                                            <tr key={pedido.id}>
                                                <td>
                                                    <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>
                                                        #{String(pedido.nro_pedido).padStart(5, '0')}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div>
                                                        <div style={{ fontWeight: 500 }}>{pedido.nombre_trabajo}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                            {pedido.tipo_trabajo?.join(', ') || '-'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div>{pedido.cliente?.empresa || `${pedido.cliente?.nombre} ${pedido.cliente?.apellido}`}</div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${estadoBadge.class}`}>{estadoBadge.label}</span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${pagoBadge.class}`}>{pagoBadge.label}</span>
                                                </td>
                                                <td>{formatDate(pedido.fecha_entrega)}</td>
                                                <td style={{ fontWeight: 600, color: saldo > 0 ? 'var(--color-success)' : 'inherit' }}>
                                                    {formatCurrency(saldo)}
                                                </td>
                                                <td>
                                                    <div className="flex gap-sm items-center">
                                                        <Link
                                                            href={`/trabajos/${pedido.id}`}
                                                            className="btn-icon"
                                                            title="Ver más detalle"
                                                        >
                                                            <img src="/icons/edit.png" alt="Editar" style={{ width: '20px', height: '20px', opacity: 0.6 }} />
                                                        </Link>
                                                        <Link
                                                            href={`/trabajos/${pedido.id}`}
                                                            className="btn-icon"
                                                            title="Ver detalle"
                                                        >
                                                            <img src="/icons/search.png" alt="Buscar" style={{ width: '20px', height: '20px', opacity: 0.6 }} />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}>
                                            <Briefcase size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                                            <div style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                                No hay trabajos registrados
                                            </div>
                                            <Link href="/trabajos/nuevo" className="btn btn-primary">
                                                <Plus size={16} /> Crear primer trabajo
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {pedidos && pedidos.length > 0 && (
                        <div className="flex-between mt-md">
                            <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                                Mostrando {pedidos.length} trabajos
                            </div>
                            <div className="flex gap-sm">
                                <button className="btn btn-primary">1</button>
                                <button className="btn btn-outline">2</button>
                                <button className="btn btn-outline">3</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
