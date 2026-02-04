'use client'

import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Loader2, Save, X, HelpCircle } from 'lucide-react'
import type { Cliente, Configuracion } from '@/lib/types'

export default function NuevoTrabajoPage() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [config, setConfig] = useState<Configuracion | null>(null)

    const [formData, setFormData] = useState({
        nombre_trabajo: '',
        cliente_id: '',
        tipo_trabajo: [] as string[],
        etiqueta_proveedor: [] as string[],
        estado: 'presupuestado',
        costo: 0,
        precio_venta: 0,
        sena: 0,
        pagado: 'pendiente',
        fecha_inicio: '',
        fecha_entrega: ''
    })

    useEffect(() => {
        const loadData = async () => {
            // Cargar clientes
            const { data: clientesData } = await supabase
                .from('clientes')
                .select('*')
                .order('empresa', { ascending: true })
            if (clientesData) setClientes(clientesData)

            // Cargar configuración
            const { data: configData } = await supabase
                .from('configuraciones')
                .select('*')
                .single()
            if (configData) setConfig(configData)
        }
        loadData()
    }, [])

    // Valores por defecto si no hay configuración
    const tiposTrabajo = config?.tipos_trabajo || ['Offset', 'Digital', 'Web', 'Meta Ads', 'Asesoramiento', 'Diseño']
    const proveedores = config?.proveedores || ['Taller Interno', 'Proveedor Externo']
    const estados = config?.estados || ['Presupuestado', 'En Cola', 'En Curso', 'Terminado']

    const saldoPendiente = formData.precio_venta - formData.sena

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: ['costo', 'precio_venta', 'sena'].includes(name) ? parseFloat(value) || 0 : value
        }))
    }

    const toggleTipo = (tipo: string) => {
        setFormData(prev => ({
            ...prev,
            tipo_trabajo: prev.tipo_trabajo.includes(tipo)
                ? prev.tipo_trabajo.filter(t => t !== tipo)
                : [...prev.tipo_trabajo, tipo]
        }))
    }

    const toggleProveedor = (prov: string) => {
        setFormData(prev => ({
            ...prev,
            etiqueta_proveedor: prev.etiqueta_proveedor.includes(prov)
                ? prev.etiqueta_proveedor.filter(p => p !== prov)
                : [...prev.etiqueta_proveedor, prov]
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No autenticado')

            const { error } = await supabase.from('pedidos').insert({
                ...formData,
                estado: formData.estado.toLowerCase().replace(' ', '_'),
                user_id: user.id
            })

            if (error) throw error

            router.push('/trabajos')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Error al guardar trabajo')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div />
                <div className="flex gap-sm">
                    <button type="button" className="btn btn-outline" onClick={() => router.back()}>
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="trabajo-form"
                        className="btn btn-success"
                        disabled={loading}
                    >
                        {loading ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                        Guardar Pedido
                    </button>
                </div>
            </div>

            <form id="trabajo-form" onSubmit={handleSubmit}>
                <div className="card mb-md">
                    <div className="card-body">
                        <h3 style={{
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: 'var(--color-primary)',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            ● Identificación del Trabajo
                        </h3>

                        {error && (
                            <div style={{
                                padding: '0.75rem',
                                borderRadius: '0.5rem',
                                marginBottom: '1rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                color: 'var(--color-danger)',
                                fontSize: '0.875rem'
                            }}>
                                {error}
                            </div>
                        )}

                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Nombre del Trabajo</label>
                                <input
                                    type="text"
                                    name="nombre_trabajo"
                                    className="form-input"
                                    placeholder="ej. Branding Festival de Verano"
                                    value={formData.nombre_trabajo}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Selección de Cliente</label>
                                <select
                                    name="cliente_id"
                                    className="form-select"
                                    value={formData.cliente_id}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Buscar un cliente...</option>
                                    {clientes.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.empresa || `${c.nombre} ${c.apellido}`}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card mb-md">
                    <div className="card-body">
                        <h3 style={{
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: 'var(--color-primary)',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            ● Detalles del Servicio
                        </h3>

                        <div className="form-group">
                            <label className="form-label">Tipo de Trabajo</label>
                            <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                                {tiposTrabajo.map(tipo => (
                                    <button
                                        key={tipo}
                                        type="button"
                                        onClick={() => toggleTipo(tipo)}
                                        className={`badge ${formData.tipo_trabajo.includes(tipo) ? 'primary' : ''}`}
                                        style={{
                                            cursor: 'pointer',
                                            padding: '0.5rem 0.75rem',
                                            border: formData.tipo_trabajo.includes(tipo)
                                                ? '1px solid var(--color-primary)'
                                                : '1px solid var(--color-border)'
                                        }}
                                    >
                                        {tipo} {formData.tipo_trabajo.includes(tipo) && '×'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Proveedor / Etiqueta</label>
                            <div className="flex gap-sm" style={{ flexWrap: 'wrap' }}>
                                {proveedores.map(prov => (
                                    <button
                                        key={prov}
                                        type="button"
                                        onClick={() => toggleProveedor(prov)}
                                        className={`badge ${formData.etiqueta_proveedor.includes(prov) ? 'success' : ''}`}
                                        style={{
                                            cursor: 'pointer',
                                            padding: '0.5rem 0.75rem',
                                            border: formData.etiqueta_proveedor.includes(prov)
                                                ? '1px solid var(--color-success)'
                                                : '1px solid var(--color-border)'
                                        }}
                                    >
                                        {prov} {formData.etiqueta_proveedor.includes(prov) && '×'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                            <div className="form-group">
                                <label className="form-label">Estado Actual</label>
                                <select
                                    name="estado"
                                    className="form-select"
                                    value={formData.estado}
                                    onChange={handleChange}
                                >
                                    {estados.map(e => (
                                        <option key={e} value={e.toLowerCase().replace(' ', '_')}>{e}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Fecha de Inicio</label>
                                <input
                                    type="date"
                                    name="fecha_inicio"
                                    className="form-input"
                                    value={formData.fecha_inicio}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Fecha de Entrega</label>
                                <input
                                    type="date"
                                    name="fecha_entrega"
                                    className="form-input"
                                    value={formData.fecha_entrega}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card mb-md">
                    <div className="card-body">
                        <h3 style={{
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: 'var(--color-primary)',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            ● Resumen Financiero
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Costo (Interno)</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--color-text-muted)'
                                    }}>$</span>
                                    <input
                                        type="number"
                                        name="costo"
                                        className="form-input"
                                        style={{ paddingLeft: '30px' }}
                                        value={formData.costo || ''}
                                        onChange={handleChange}
                                        min={0}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label" style={{ color: 'var(--color-primary)' }}>Precio de Venta</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--color-text-muted)'
                                    }}>$</span>
                                    <input
                                        type="number"
                                        name="precio_venta"
                                        className="form-input"
                                        style={{ paddingLeft: '30px', borderColor: 'var(--color-primary)' }}
                                        value={formData.precio_venta || ''}
                                        onChange={handleChange}
                                        min={0}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Seña</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: 'var(--color-text-muted)'
                                    }}>$</span>
                                    <input
                                        type="number"
                                        name="sena"
                                        className="form-input"
                                        style={{ paddingLeft: '30px' }}
                                        value={formData.sena || ''}
                                        onChange={handleChange}
                                        min={0}
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Saldo Pendiente</label>
                                <div style={{
                                    padding: '1rem',
                                    background: 'var(--color-bg-tertiary)',
                                    borderRadius: 'var(--radius-md)',
                                    textAlign: 'right',
                                    fontWeight: 700,
                                    fontSize: '1.25rem',
                                    color: saldoPendiente > 0 ? 'var(--color-success)' : 'var(--color-text)'
                                }}>
                                    ${saldoPendiente.toLocaleString('es-AR')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>

            {/* Ayuda */}
            <div className="card" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <div className="card-body" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <HelpCircle size={24} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                    <div>
                        <h4 style={{ fontWeight: 600, marginBottom: '0.25rem' }}>¿Necesitás ayuda con este pedido?</h4>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                            Revisá la configuración de precios o contactá al gerente.
                        </p>
                    </div>
                    <a href="/configuracion" className="btn btn-outline" style={{ marginLeft: 'auto' }}>
                        Ver Guías
                    </a>
                </div>
            </div>
        </>
    )
}
