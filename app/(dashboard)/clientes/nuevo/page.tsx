'use client'

import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Users, UserCheck, Loader2, Save, X } from 'lucide-react'

export default function NuevoClientePage() {
    const router = useRouter()
    const supabase = createClient()

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [recentClientes, setRecentClientes] = useState<any[]>([])

    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        empresa: '',
        telefono_personal: '',
        telefono_empresa: '',
        email: '',
        cuit: '',
        domicilio: ''
    })

    useEffect(() => {
        // Cargar clientes recientes
        const loadRecent = async () => {
            const { data } = await supabase
                .from('clientes')
                .select('id, nombre, apellido, empresa, created_at')
                .order('created_at', { ascending: false })
                .limit(5)
            if (data) setRecentClientes(data)
        }
        loadRecent()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No autenticado')

            const { error } = await supabase.from('clientes').insert({
                ...formData,
                user_id: user.id
            })

            if (error) throw error

            router.push('/clientes')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Error al guardar cliente')
        } finally {
            setLoading(false)
        }
    }

    const clearForm = () => {
        setFormData({
            nombre: '',
            apellido: '',
            empresa: '',
            telefono_personal: '',
            telefono_empresa: '',
            email: '',
            cuit: '',
            domicilio: ''
        })
        setError(null)
    }

    return (
        <>
            <Header title="Registro de Nuevo Cliente" />

            {/* KPI Cards */}
            <div className="kpi-grid">
                <div className="kpi-card primary">
                    <Users size={24} className="kpi-icon" />
                    <div className="kpi-label">Clientes Totales</div>
                    <div className="kpi-value">{recentClientes.length}</div>
                </div>
                <div className="kpi-card warning">
                    <div className="kpi-label">Pendientes</div>
                    <div className="kpi-value">0</div>
                </div>
                <div className="kpi-card orange">
                    <UserCheck size={24} className="kpi-icon" />
                    <div className="kpi-label">Proyectos Activos</div>
                    <div className="kpi-value">0</div>
                </div>
            </div>

            <div className="grid-2">
                {/* Formulario */}
                <div className="card">
                    <div className="card-body">
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                            Detalles del Nuevo Cliente
                        </h2>
                        <p className="text-muted mb-md" style={{ fontSize: '0.875rem' }}>
                            Complete la información para registrar un nuevo cliente.
                        </p>

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
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: 'var(--color-text-muted)',
                                    marginBottom: '1rem'
                                }}>
                                    Información Personal
                                </h3>

                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Nombre</label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            className="form-input"
                                            placeholder="Juan"
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
                                            placeholder="Pérez"
                                            value={formData.apellido}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-input"
                                        placeholder="juan.perez@ejemplo.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Celular Personal</label>
                                    <input
                                        type="tel"
                                        name="telefono_personal"
                                        className="form-input"
                                        placeholder="54 9 11 1234 5678"
                                        value={formData.telefono_personal}
                                        onChange={handleChange}
                                    />
                                    <small className="text-muted">Formato: +54 9 (Cód. Área) Número</small>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{
                                    fontSize: '0.75rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    color: 'var(--color-text-muted)',
                                    marginBottom: '1rem'
                                }}>
                                    Información de la Empresa
                                </h3>

                                <div className="form-group">
                                    <label className="form-label">Empresa</label>
                                    <input
                                        type="text"
                                        name="empresa"
                                        className="form-input"
                                        placeholder="Nombre de la empresa"
                                        value={formData.empresa}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="grid-2">
                                    <div className="form-group">
                                        <label className="form-label">Teléfono Empresa</label>
                                        <input
                                            type="tel"
                                            name="telefono_empresa"
                                            className="form-input"
                                            placeholder="+54 11 4000-0000"
                                            value={formData.telefono_empresa}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">CUIT</label>
                                        <input
                                            type="text"
                                            name="cuit"
                                            className="form-input"
                                            placeholder="30-12345678-9"
                                            value={formData.cuit}
                                            onChange={handleChange}
                                            maxLength={13}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Domicilio</label>
                                    <input
                                        type="text"
                                        name="domicilio"
                                        className="form-input"
                                        placeholder="Av. Corrientes 1234, CABA, Argentina"
                                        value={formData.domicilio}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-md">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={clearForm}
                                >
                                    <X size={16} /> Limpiar Formulario
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
                                            <Save size={16} /> Registrar Cliente
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Panel lateral */}
                <div>
                    {/* Registros recientes */}
                    <div className="card mb-md">
                        <div className="card-body">
                            <div className="flex-between mb-md">
                                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Registros Recientes</h3>
                                <a href="/clientes" className="text-primary" style={{ fontSize: '0.875rem' }}>Ver Todos</a>
                            </div>

                            {recentClientes.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {recentClientes.map(cliente => (
                                        <div key={cliente.id} className="flex-between" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
                                            <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                                                <div
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        background: 'var(--color-success)',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 600,
                                                        fontSize: '0.75rem'
                                                    }}
                                                >
                                                    {cliente.nombre?.charAt(0)}{cliente.apellido?.charAt(0)}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>
                                                        {cliente.empresa || `${cliente.nombre} ${cliente.apellido}`}
                                                    </div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                        {new Date(cliente.created_at).toLocaleDateString('es-AR')}
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="badge success">Verificado</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                    No hay clientes registrados aún
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="card" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                        <div className="card-body">
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>💡 Próximos Pasos</h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                Después de registrar al cliente, podrá crear su primer proyecto de diseño o factura.
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
                                <strong>Tip:</strong> Use el CUIT para obtener automáticamente datos fiscales para clientes argentinos.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
