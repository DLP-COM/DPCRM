'use client'

import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Loader2, Save, X, User, ArrowLeft } from 'lucide-react'
import type { Cliente } from '@/lib/types'

export default function EditarClientePage() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        empresa: '',
        email: '',
        telefono_personal: '',
        telefono_empresa: '',
        cuit: '',
        domicilio: ''
    })

    useEffect(() => {
        const loadCliente = async () => {
            try {
                const { data, error } = await supabase
                    .from('clientes')
                    .select('*')
                    .eq('id', id)
                    .single()

                if (error) throw error
                if (data) {
                    setFormData({
                        nombre: data.nombre,
                        apellido: data.apellido,
                        empresa: data.empresa || '',
                        email: data.email || '',
                        telefono_personal: data.telefono_personal || '',
                        telefono_empresa: data.telefono_empresa || '',
                        cuit: data.cuit || '',
                        domicilio: data.domicilio || ''
                    })
                }
            } catch (err: any) {
                setError(err.message || 'Error al cargar cliente')
            } finally {
                setLoading(false)
            }
        }
        loadCliente()
    }, [id])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError(null)

        try {
            const { error } = await supabase
                .from('clientes')
                .update(formData)
                .eq('id', id)

            if (error) throw error

            router.push('/clientes')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Error al actualizar cliente')
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
            <Header title="Editar Cliente" subtitle="Actualizar información de contacto y facturación" />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <button onClick={() => router.back()} className="btn btn-outline btn-sm">
                    <ArrowLeft size={16} /> Volver
                </button>
                <div className="flex gap-sm">
                    <button
                        type="submit"
                        form="edit-cliente-form"
                        className="btn btn-success"
                        disabled={saving}
                    >
                        {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
                        Guardar Cambios
                    </button>
                </div>
            </div>

            <form id="edit-cliente-form" onSubmit={handleSubmit}>
                <div className="card">
                    <div className="card-body">
                        <div className="flex gap-sm items-center mb-lg">
                            <User size={24} className="text-primary" />
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Información del Cliente</h3>
                        </div>

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

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Nombre</label>
                                    <input
                                        type="text"
                                        name="nombre"
                                        className="form-input"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Apellido</label>
                                    <input
                                        type="text"
                                        name="apellido"
                                        className="form-input"
                                        value={formData.apellido}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Empresa</label>
                                <input
                                    type="text"
                                    name="empresa"
                                    className="form-input"
                                    placeholder="Nombre de la empresa (opcional)"
                                    value={formData.empresa}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-input"
                                        placeholder="ejemplo@correo.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">CUIT</label>
                                    <input
                                        type="text"
                                        name="cuit"
                                        className="form-input"
                                        placeholder="XX-XXXXXXXX-X"
                                        value={formData.cuit}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Teléfono Personal</label>
                                    <input
                                        type="text"
                                        name="telefono_personal"
                                        className="form-input"
                                        placeholder="+54 9..."
                                        value={formData.telefono_personal}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Teléfono Empresa</label>
                                    <input
                                        type="text"
                                        name="telefono_empresa"
                                        className="form-input"
                                        value={formData.telefono_empresa}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Domicilio / Dirección</label>
                                <input
                                    type="text"
                                    name="domicilio"
                                    className="form-input"
                                    placeholder="Calle, Altura, Localidad..."
                                    value={formData.domicilio}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}
