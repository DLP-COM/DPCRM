'use client'

import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Loader2, Save, AlertCircle } from 'lucide-react'

export default function NuevoGastoPage() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [categorias, setCategorias] = useState<string[]>(['Insumos', 'Servicios', 'Fijos', 'Mantenimiento'])

    const [formData, setFormData] = useState({
        concepto: '',
        monto: 0,
        fecha_pago: '',
        categoria: [] as string[],
        notas: ''
    })

    useEffect(() => {
        // Cargar categorías de configuración
        const loadConfig = async () => {
            const { data } = await supabase
                .from('configuraciones')
                .select('categorias_gasto')
                .single()
            if (data?.categorias_gasto) setCategorias(data.categorias_gasto)
        }
        loadConfig()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        if (name === 'categoria') {
            setFormData(prev => ({ ...prev, categoria: [value] }))
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: name === 'monto' ? parseFloat(value) || 0 : value
            }))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No autenticado')

            const { error } = await supabase.from('gastos').insert({
                concepto: formData.concepto,
                monto: formData.monto,
                fecha_pago: formData.fecha_pago || null,
                categoria: formData.categoria,
                user_id: user.id
            })

            if (error) throw error

            router.push('/gastos')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Error al guardar gasto')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Gastos y Egresos / <span style={{ color: 'var(--color-text)' }}>Nuevo Gasto</span>
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Registrar Nuevo Gasto
            </h1>
            <p className="text-muted mb-lg">
                Complete los detalles del costo operativo para su registro contable.
            </p>

            <div className="card" style={{ maxWidth: '600px' }}>
                <div className="card-body">
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

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label">Concepto del Gasto</label>
                            <input
                                type="text"
                                name="concepto"
                                className="form-input"
                                placeholder="Ej: Compra de papel fotográfico mate 200g"
                                value={formData.concepto}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="grid-2">
                            <div className="form-group">
                                <label className="form-label">Monto ($ ARS)</label>
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
                                        name="monto"
                                        className="form-input"
                                        style={{ paddingLeft: '30px' }}
                                        placeholder="0.00"
                                        value={formData.monto || ''}
                                        onChange={handleChange}
                                        required
                                        min={0}
                                        step="0.01"
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Fecha de Pago</label>
                                <input
                                    type="date"
                                    name="fecha_pago"
                                    className="form-input"
                                    value={formData.fecha_pago}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Categoría</label>
                            <select
                                name="categoria"
                                className="form-select"
                                value={formData.categoria[0] || ''}
                                onChange={handleChange}
                            >
                                <option value="">Seleccione una categoría</option>
                                {categorias.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Notas (Opcional)</label>
                            <textarea
                                name="notas"
                                className="form-input"
                                placeholder="Detalles adicionales sobre el gasto..."
                                value={formData.notas}
                                onChange={handleChange}
                                rows={3}
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <div className="flex gap-md mt-lg">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => router.back()}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-success"
                                disabled={loading}
                                style={{ flex: 1 }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={16} className="spin" /> Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} /> Guardar Gasto
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Aviso */}
            <div className="card mt-md" style={{
                maxWidth: '600px',
                background: 'rgba(99, 102, 241, 0.05)',
                border: '1px solid rgba(99, 102, 241, 0.2)'
            }}>
                <div className="card-body" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                    <AlertCircle size={20} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                    <div>
                        <h4 style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                            Aviso de Control
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                            Este gasto se reflejará inmediatamente en el balance mensual del tablero principal.
                            Asegúrese de que la categoría sea la correcta para reportes fiscales precisos.
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
