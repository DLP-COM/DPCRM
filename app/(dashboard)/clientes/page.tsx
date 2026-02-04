import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, UserPlus, UserCheck, Plus, Search, Filter } from 'lucide-react'

export default async function ClientesPage() {
    const supabase = await createClient()

    const { data: clientes, count } = await supabase
        .from('clientes')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

    // Contar altas del mes
    const { count: altasMes } = await supabase
        .from('clientes')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

    return (
        <>
            <Header title="Listado de Clientes" subtitle="Gestión y administración de cartera" />

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card primary">
                    <Users size={24} className="kpi-icon" />
                    <div className="kpi-label">Total Clientes</div>
                    <div className="kpi-value">{count || 0}</div>
                </div>

                <div className="kpi-card success">
                    <UserPlus size={24} className="kpi-icon" />
                    <div className="kpi-label">Altas Mes</div>
                    <div className="kpi-value">{altasMes || 0}</div>
                </div>

                <div className="kpi-card orange">
                    <UserCheck size={24} className="kpi-icon" />
                    <div className="kpi-label">Activos</div>
                    <div className="kpi-value">{count || 0}</div>
                </div>
            </div>

            {/* Búsqueda y Filtros */}
            <div className="card mb-md">
                <div className="card-body" style={{ padding: '1rem' }}>
                    <div className="flex-between">
                        <div className="search-box" style={{ minWidth: '350px' }}>
                            <Search size={18} style={{ color: 'var(--color-text-muted)' }} />
                            <input type="text" placeholder="Buscar por nombre o empresa..." />
                        </div>
                        <div className="flex gap-sm">
                            <button className="btn btn-outline">
                                <Filter size={16} /> Filtros
                            </button>
                            <Link href="/clientes/nuevo" className="btn btn-success">
                                <Plus size={16} /> NUEVO CLIENTE
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla de Clientes */}
            <div className="card">
                <div className="card-body">
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Nombre y Apellido</th>
                                    <th>Empresa</th>
                                    <th>Email</th>
                                    <th>Teléfono</th>
                                    <th>CUIT</th>
                                    <th>Domicilio</th>
                                    <th style={{ width: '50px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {clientes && clientes.length > 0 ? (
                                    clientes.map((cliente) => (
                                        <tr key={cliente.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div
                                                        style={{
                                                            width: '36px',
                                                            height: '36px',
                                                            borderRadius: '50%',
                                                            background: 'var(--color-primary)',
                                                            color: 'white',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            fontWeight: 600,
                                                            fontSize: '0.875rem'
                                                        }}
                                                    >
                                                        {cliente.nombre?.charAt(0)}{cliente.apellido?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 500 }}>{cliente.nombre} {cliente.apellido}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                            ID: Cl-{cliente.id.substring(0, 4)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>{cliente.empresa || '-'}</td>
                                            <td>{cliente.email || '-'}</td>
                                            <td>
                                                <div>{cliente.telefono_personal || '-'}</div>
                                                {cliente.telefono_empresa && (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                        Emp: {cliente.telefono_empresa}
                                                    </div>
                                                )}
                                            </td>
                                            <td>{cliente.cuit || '-'}</td>
                                            <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {cliente.domicilio || '-'}
                                            </td>
                                            <td>
                                                <Link
                                                    href={`/clientes/${cliente.id}`}
                                                    className="btn btn-primary btn-sm"
                                                    style={{
                                                        padding: '4px',
                                                        minWidth: '28px',
                                                        height: '28px',
                                                        borderRadius: '4px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                    title="Ver más detalle"
                                                >
                                                    <Plus size={16} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} style={{ textAlign: 'center', padding: '3rem' }}>
                                            <Users size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                                            <div style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                                No hay clientes registrados
                                            </div>
                                            <Link href="/clientes/nuevo" className="btn btn-primary">
                                                <Plus size={16} /> Agregar primer cliente
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Paginación */}
                    {clientes && clientes.length > 0 && (
                        <div className="flex-between mt-md">
                            <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                                Mostrando 1-{clientes.length} de {count} clientes
                            </div>
                            <div className="flex gap-sm">
                                <button className="btn btn-outline" disabled>← Anterior</button>
                                <button className="btn btn-primary">1</button>
                                <button className="btn btn-outline">2</button>
                                <button className="btn btn-outline">3</button>
                                <button className="btn btn-outline">Siguiente →</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
