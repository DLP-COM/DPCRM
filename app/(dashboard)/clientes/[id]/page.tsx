'use client'

import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Users, Building2, Mail, Phone, MapPin, Hash, ArrowLeft, Loader2 } from 'lucide-react'
import type { Cliente } from '@/lib/types'

export default function DetalleClientePage() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()
    const [cliente, setCliente] = useState<Cliente | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadCliente = async () => {
            const { data, error } = await supabase
                .from('clientes')
                .select('*')
                .eq('id', id)
                .single()

            if (data) setCliente(data)
            setLoading(false)
        }
        loadCliente()
    }, [id])

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '80vh' }}>
                <Loader2 size={40} className="spin text-primary" />
            </div>
        )
    }

    if (!cliente) {
        return (
            <div className="flex-center flex-column" style={{ height: '80vh' }}>
                <Users size={64} className="text-muted mb-md" />
                <h2>Cliente no encontrado</h2>
                <button onClick={() => router.back()} className="btn btn-primary mt-md">
                    <ArrowLeft size={16} /> Volver
                </button>
            </div>
        )
    }

    return (
        <>
            <Header title={`Detalle: ${cliente.nombre} ${cliente.apellido}`} />

            <div className="mb-md">
                <button onClick={() => router.back()} className="btn btn-outline btn-sm">
                    <ArrowLeft size={16} /> Volver al Listado
                </button>
            </div>

            <div className="grid-2">
                {/* Columna Principal: Información General */}
                <div className="card">
                    <div className="card-body">
                        <div className="flex gap-md mb-lg" style={{ alignItems: 'center' }}>
                            <div
                                style={{
                                    width: '64px',
                                    height: '64px',
                                    borderRadius: '50%',
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    fontWeight: 700
                                }}
                            >
                                {cliente.nombre.charAt(0)}{cliente.apellido.charAt(0)}
                            </div>
                            <div>
                                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{cliente.nombre} {cliente.apellido}</h1>
                                <p className="text-muted">{cliente.empresa || 'Consumidor Final'}</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div>
                                <h3 className="text-muted uppercase mb-sm" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                                    Información de Contacto
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="flex gap-sm items-center">
                                        <Mail size={16} className="text-primary" />
                                        <span>{cliente.email || 'No tiene'}</span>
                                    </div>
                                    <div className="flex gap-sm items-center">
                                        <Phone size={16} className="text-primary" />
                                        <span>{cliente.telefono_personal || 'No tiene'}</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-muted uppercase mb-sm" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                                    Información Fiscal y Domicilio
                                </h3>
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    <div className="flex gap-sm items-center">
                                        <Hash size={16} className="text-primary" />
                                        <span>CUIT: {cliente.cuit || 'N/A'}</span>
                                    </div>
                                    <div className="flex gap-sm items-center">
                                        <MapPin size={16} className="text-primary" />
                                        <span>{cliente.domicilio || 'No especificado'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Columna Lateral: Info de Empresa y otros */}
                <div className="card">
                    <div className="card-body">
                        <h3 className="mb-md" style={{ fontSize: '1.125rem', fontWeight: 600 }}>Detalles de Empresa</h3>

                        {cliente.empresa ? (
                            <div style={{ display: 'grid', gap: '1.25rem' }}>
                                <div className="flex gap-md p-md rounded" style={{ background: 'var(--color-bg-alt)' }}>
                                    <Building2 size={32} className="text-primary" />
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{cliente.empresa}</div>
                                        <div className="text-muted" style={{ fontSize: '0.875rem' }}>Empresa vinculada</div>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Teléfono Empresa</label>
                                    <div className="flex gap-sm items-center p-sm border rounded">
                                        <Phone size={16} className="text-muted" />
                                        <span>{cliente.telefono_empresa || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-lg text-muted">
                                <Users size={40} className="mb-sm" style={{ margin: '0 auto' }} />
                                <p>Este cliente está registrado como particular.</p>
                            </div>
                        )}

                        <div className="mt-xl">
                            <h3 className="mb-sm text-muted uppercase" style={{ fontSize: '0.75rem' }}>Fecha de Registro</h3>
                            <p>{new Date(cliente.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
