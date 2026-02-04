import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { DollarSign, TrendingUp, FileText, Plus, Edit2, Filter } from 'lucide-react'

export default async function GastosPage() {
    const supabase = await createClient()

    const { data: gastos } = await supabase
        .from('gastos')
        .select('*')
        .order('fecha_pago', { ascending: false })

    // Calcular totales del mes
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const { data: gastosMes } = await supabase
        .from('gastos')
        .select('monto')
        .gte('created_at', inicioMes)

    const totalMes = gastosMes?.reduce((acc, g) => acc + (g.monto || 0), 0) || 0

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

    const getCategoriaColor = (categoria: string[]) => {
        const cat = categoria?.[0]?.toLowerCase() || ''
        if (cat.includes('insumo')) return 'primary'
        if (cat.includes('servicio')) return 'success'
        if (cat.includes('mantenimiento')) return 'warning'
        if (cat.includes('fijo')) return 'orange'
        return 'primary'
    }

    return (
        <>
            <Header title="Gastos y Egresos" subtitle="Gestión de gastos operativos y pagos de la agencia" />

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card warning">
                    <DollarSign size={24} className="kpi-icon" />
                    <div className="kpi-label">Gasto Total Mes</div>
                    <div className="kpi-value" style={{ fontSize: '1.5rem' }}>
                        ARS<br />{formatCurrency(totalMes).replace('ARS', '').trim()}
                    </div>
                </div>

                <div className="kpi-card primary">
                    <TrendingUp size={24} className="kpi-icon" />
                    <div className="kpi-label">Presupuesto Ejecutado</div>
                    <div className="kpi-value">64.5%</div>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>ANUAL</span>
                </div>

                <div className="kpi-card orange">
                    <FileText size={24} className="kpi-icon" />
                    <div className="kpi-label">Pendientes de Pago</div>
                    <div className="kpi-value">0</div>
                    <span style={{ fontSize: '0.75rem', opacity: 0.8 }}>CANTIDAD</span>
                </div>
            </div>

            {/* Filtros */}
            <div className="card mb-md">
                <div className="card-body" style={{ padding: '1rem' }}>
                    <div className="flex-between">
                        <div className="flex gap-md">
                            <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                                <Filter size={16} style={{ color: 'var(--color-text-muted)' }} />
                                <select className="form-select" style={{ width: 'auto', padding: '0.5rem 1rem' }}>
                                    <option>Todas las Categorías</option>
                                    <option>Insumos</option>
                                    <option>Servicios</option>
                                    <option>Mantenimiento</option>
                                    <option>Fijos</option>
                                </select>
                            </div>
                            <input type="date" className="form-input" style={{ width: 'auto', padding: '0.5rem 1rem' }} />
                            <input type="date" className="form-input" style={{ width: 'auto', padding: '0.5rem 1rem' }} />
                        </div>
                        <Link href="/gastos/nuevo" className="btn btn-success">
                            <Plus size={16} /> Nuevo Gasto
                        </Link>
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
                                    <th>Concepto</th>
                                    <th>Monto (ARS)</th>
                                    <th>Fecha de Pago</th>
                                    <th>Categoría</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {gastos && gastos.length > 0 ? (
                                    gastos.map((gasto) => (
                                        <tr key={gasto.id}>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <DollarSign size={18} style={{ color: 'var(--color-warning)' }} />
                                                    <div>
                                                        <div style={{ fontWeight: 500 }}>{gasto.concepto}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                            ID: #GS-{gasto.id.substring(0, 4)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ fontWeight: 600 }}>{formatCurrency(gasto.monto)}</td>
                                            <td>{formatDate(gasto.fecha_pago)}</td>
                                            <td>
                                                <span className={`badge ${getCategoriaColor(gasto.categoria)}`}>
                                                    {gasto.categoria?.[0] || 'Sin categoría'}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn btn-ghost">
                                                    <Edit2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '3rem' }}>
                                            <DollarSign size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                                            <div style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                                No hay gastos registrados
                                            </div>
                                            <Link href="/gastos/nuevo" className="btn btn-primary">
                                                <Plus size={16} /> Registrar primer gasto
                                            </Link>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {gastos && gastos.length > 0 && (
                        <div className="flex-between mt-md">
                            <div className="text-muted" style={{ fontSize: '0.875rem' }}>
                                Mostrando 1-{gastos.length} de {gastos.length} registros
                            </div>
                            <div className="flex gap-sm">
                                <button className="btn btn-primary">1</button>
                                <button className="btn btn-outline">2</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Registro rápido */}
            <div className="card mt-md">
                <div className="card-body">
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
                        📝 Registro Rápido de Gasto
                    </h3>
                    <form className="flex gap-md" style={{ alignItems: 'flex-end' }}>
                        <div className="form-group" style={{ flex: 2, marginBottom: 0 }}>
                            <label className="form-label">Concepto</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Ej: Compra Vinilos"
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                            <label className="form-label">Monto (ARS)</label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                            <label className="form-label">Categoría</label>
                            <select className="form-select">
                                <option>Insumos</option>
                                <option>Servicios</option>
                                <option>Mantenimiento</option>
                                <option>Fijos</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-success">
                            Guardar Gasto
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}
