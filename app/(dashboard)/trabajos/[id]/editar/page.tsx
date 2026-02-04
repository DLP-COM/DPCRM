'use client'

import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Loader2, Save, X, HelpCircle, ArrowLeft } from 'lucide-react'
import type { Cliente, Configuracion, Pedido } from '@/lib/types'

export default function EditarTrabajoPage() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [clientes, setClientes] = useState<Cliente[]>([])
    const [config, setConfig] = useState<Configuracion | null>(null)

    const [formData, setFormData] = useState({
        nombre_trabajo: '',
        cliente_id: '',
        tipo_trabajo: [] as string[],
        etiqueta_proveedor: [] as string[],
        estado: '',
        costo: 0,
        precio_venta: 0,
        sena: 0,
        pagado: 'pendiente',
        fecha_inicio: '',
        fecha_entrega: ''
    })

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Cargar pedido actual
                const { data: pedidoData, error: pedidoError } = await supabase
                    .from('pedidos')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (pedidoError) throw pedidoError
                if (pedidoData) {
                    setFormData({
                        nombre_trabajo: pedidoData.nombre_trabajo,
                        cliente_id: pedidoData.cliente_id || '',
                        tipo_trabajo: pedidoData.tipo_trabajo || [],
                        etiqueta_proveedor: pedidoData.etiqueta_proveedor || [],
                        estado: pedidoData.estado,
                        costo: pedidoData.costo,
                        precio_venta: pedidoData.precio_venta,
                        sena: pedidoData.sena,
                        pagado: pedidoData.pagado,
                        fecha_inicio: pedidoData.fecha_inicio || '',
                        fecha_entrega: pedidoData.fecha_entrega || ''
                    })
                }

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

            } catch (err: any) {
                setError(err.message || 'Error al cargar datos')
            } finally {
                setLoading(false)
            }
        }
        loadInitialData()
    }, [id])

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
        setSaving(true)
        setError(null)

        try {
            const { error } = await supabase
                .from('pedidos')
                .update({
                    ...formData,
                    estado: formData.estado.toLowerCase().replace(' ', '_')
                })
                .eq('id', id)

            if (error) throw error

            router.push(`/trabajos/${id}`)
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Error al actualizar trabajo')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '80vh' }}>
                <Loader2 size={40} className="spin text-primary" />
            </div>
        )
    }

    return (
        <>
            <Header title="Editar Trabajo" subtitle="Modificación completa de los datos del pedido" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <button onClick={() => router.back()} className="btn btn-outline btn-sm">
                    <ArrowLeft size={16} /> Volver
                </button>
                <div className="flex gap-sm">
                    <button
                        type="submit"
                        form="edit-trabajo-form"
                        className="btn btn-success"
                        disabled={saving}
                    >
                        {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                        Guardar Cambios
                    </button>
                </div>
            </div>

            <form id="edit-trabajo-form" onSubmit={handleSubmit}>
                <div className="card mb-md">
                    <div className="card-body">
                        <h3 className="text-primary uppercase mb-md" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
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
                        <h3 className="text-primary uppercase mb-md" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
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
                        <h3 className="text-primary uppercase mb-md" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                            ● Resumen Financiero
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
                            <div className="form-group">
                                <label className="form-label">Costo</label>
                                <input
                                    type="number"
                                    name="costo"
                                    className="form-input"
                                    value={formData.costo}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Precio Venta</label>
                                <input
                                    type="number"
                                    name="precio_venta"
                                    className="form-input"
                                    value={formData.precio_venta}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Seña</label>
                                <input
                                    type="number"
                                    name="sena"
                                    className="form-input"
                                    value={formData.sena}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Saldo</label>
                                <div className="p-md rounded" style={{ background: 'var(--color-bg-tertiary)', fontWeight: 600 }}>
                                    $ {saldoPendiente.toLocaleString()}
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Pago</label>
                                <select
                                    name="pagado"
                                    className="form-select"
                                    value={formData.pagado}
                                    onChange={handleChange}
                                >
                                    <option value="pendiente">Pendiente</option>
                                    <option value="señado">Señado</option>
                                    <option value="pagado">Pagado</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}
