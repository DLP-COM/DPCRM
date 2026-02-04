'use client'

import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { Settings, Plus, Trash2, Save, Moon, Sun, Loader2, Check, X, Edit2, Database, Layout } from 'lucide-react'
import type { Configuracion } from '@/lib/types'

export default function ConfiguracionPage() {
    const supabase = createClient()

    const [loading, setLoading] = useState(false)
    const [saveMessage, setSaveMessage] = useState<string | null>(null)
    const [config, setConfig] = useState<Configuracion | null>(null)
    const [theme, setTheme] = useState<'claro' | 'oscuro'>('claro')

    const [newTipo, setNewTipo] = useState('')
    const [newProveedor, setNewProveedor] = useState('')
    const [newCategoria, setNewCategoria] = useState('')

    useEffect(() => {
        const loadConfig = async () => {
            const savedTheme = localStorage.getItem('theme') as 'claro' | 'oscuro' | null
            if (savedTheme) {
                setTheme(savedTheme)
            }

            const { data } = await supabase
                .from('configuraciones')
                .select('*')
                .single()

            if (data) {
                setConfig(data)
            } else {
                // Crear configuración por defecto
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                    const defaultConfig: Partial<Configuracion> = {
                        user_id: user.id,
                        tema: 'claro',
                        tipos_trabajo: ['Offset', 'Digital', 'Web', 'Meta Ads', 'Asesoramiento', 'Diseño'],
                        proveedores: ['Taller Interno', 'Proveedor Externo'],
                        estados: ['Presupuestado', 'En Cola', 'En Curso', 'Terminado'],
                        categorias_gasto: ['Insumos', 'Servicios', 'Fijos', 'Mantenimiento']
                    }
                    const { data: newConfig } = await supabase
                        .from('configuraciones')
                        .insert(defaultConfig)
                        .select()
                        .single()
                    if (newConfig) setConfig(newConfig)
                }
            }
        }
        loadConfig()
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'claro' ? 'oscuro' : 'claro'
        setTheme(newTheme)
        localStorage.setItem('theme', newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
    }

    const addTipo = () => {
        if (!newTipo.trim() || !config) return
        setConfig({ ...config, tipos_trabajo: [...config.tipos_trabajo, newTipo.trim()] })
        setNewTipo('')
    }

    const removeTipo = (tipo: string) => {
        if (!config) return
        setConfig({ ...config, tipos_trabajo: config.tipos_trabajo.filter(t => t !== tipo) })
    }

    const addProveedor = () => {
        if (!newProveedor.trim() || !config) return
        setConfig({ ...config, proveedores: [...config.proveedores, newProveedor.trim()] })
        setNewProveedor('')
    }

    const removeProveedor = (prov: string) => {
        if (!config) return
        setConfig({ ...config, proveedores: config.proveedores.filter(p => p !== prov) })
    }

    const addCategoria = () => {
        if (!newCategoria.trim() || !config) return
        setConfig({ ...config, categorias_gasto: [...config.categorias_gasto, newCategoria.trim()] })
        setNewCategoria('')
    }

    const removeCategoria = (cat: string) => {
        if (!config) return
        setConfig({ ...config, categorias_gasto: config.categorias_gasto.filter(c => c !== cat) })
    }

    const saveConfig = async () => {
        if (!config) return
        setLoading(true)
        setSaveMessage(null)

        try {
            const { error } = await supabase
                .from('configuraciones')
                .update({
                    tema: theme,
                    tipos_trabajo: config.tipos_trabajo,
                    proveedores: config.proveedores,
                    categorias_gasto: config.categorias_gasto
                })
                .eq('id', config.id)

            if (error) throw error
            setSaveMessage('✓ Configuración guardada exitosamente')
        } catch (err: any) {
            setSaveMessage('Error: ' + (err.message || 'No se pudo guardar'))
        } finally {
            setLoading(false)
            setTimeout(() => setSaveMessage(null), 3000)
        }
    }

    return (
        <>
            <Header title="Configuración del Sistema" />

            <div className="grid-2" style={{ alignItems: 'flex-start' }}>
                {/* Panel izquierdo - Listas */}
                <div className="card">
                    <div className="card-body">
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>
                            📋 Listas Desplegables
                        </h3>

                        {/* Tipos de Trabajo */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div className="flex-between mb-sm">
                                <label className="form-label" style={{ margin: 0 }}>TIPOS DE TRABAJO</label>
                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                    {config?.tipos_trabajo?.length || 0} Opciones
                                </span>
                            </div>
                            <div className="flex gap-sm" style={{ flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                                {config?.tipos_trabajo?.map(tipo => (
                                    <span
                                        key={tipo}
                                        className="badge primary"
                                        style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        {tipo}
                                        <button
                                            onClick={() => removeTipo(tipo)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-sm">
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Agregar tipo..."
                                    value={newTipo}
                                    onChange={(e) => setNewTipo(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addTipo()}
                                    style={{ flex: 1 }}
                                />
                                <button className="btn btn-primary" onClick={addTipo}>
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Proveedores */}
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div className="flex-between mb-sm">
                                <label className="form-label" style={{ margin: 0 }}>PROVEEDORES</label>
                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                    {config?.proveedores?.length || 0} Opciones
                                </span>
                            </div>
                            <div className="flex gap-sm" style={{ flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                                {config?.proveedores?.map(prov => (
                                    <span
                                        key={prov}
                                        className="badge success"
                                        style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        {prov}
                                        <button
                                            onClick={() => removeProveedor(prov)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-sm">
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Agregar proveedor..."
                                    value={newProveedor}
                                    onChange={(e) => setNewProveedor(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addProveedor()}
                                    style={{ flex: 1 }}
                                />
                                <button className="btn btn-success" onClick={addProveedor}>
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Categorías de Gastos */}
                        <div>
                            <div className="flex-between mb-sm">
                                <label className="form-label" style={{ margin: 0 }}>CATEGORÍAS DE GASTOS</label>
                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                    {config?.categorias_gasto?.length || 0} Opciones
                                </span>
                            </div>
                            <div className="flex gap-sm" style={{ flexWrap: 'wrap', marginBottom: '0.5rem' }}>
                                {config?.categorias_gasto?.map(cat => (
                                    <span
                                        key={cat}
                                        className="badge warning"
                                        style={{ padding: '0.5rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                    >
                                        {cat}
                                        <button
                                            onClick={() => removeCategoria(cat)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-sm">
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Agregar categoría..."
                                    value={newCategoria}
                                    onChange={(e) => setNewCategoria(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addCategoria()}
                                    style={{ flex: 1 }}
                                />
                                <button className="btn btn-outline" onClick={addCategoria} style={{ borderColor: 'var(--color-warning)' }}>
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Panel derecho - Campos y tema */}
                <div>
                    <div className="card mb-md">
                        <div className="card-body">
                            <div className="flex-between mb-md">
                                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                                    ⚙️ Editor de Campos Dinámicos
                                </h3>
                                <button className="btn btn-success btn-sm">Guardar Esquema</button>
                            </div>

                            <p className="text-muted mb-md" style={{ fontSize: '0.875rem' }}>
                                Gestione tipos de datos y flexibilidad de las plantillas
                            </p>

                            <table className="table" style={{ fontSize: '0.875rem' }}>
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>Nombre del Campo</th>
                                        <th>Tipo de Campo</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><span style={{ color: 'var(--color-text-muted)' }}>●</span></td>
                                        <td>Descripción Corta</td>
                                        <td>
                                            <select className="form-select" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                                                <option>Texto</option>
                                                <option>Número</option>
                                                <option>Selección</option>
                                            </select>
                                        </td>
                                        <td><span className="badge success">ACTIVO</span></td>
                                        <td><button className="btn btn-ghost"><Edit2 size={14} /></button></td>
                                    </tr>
                                    <tr>
                                        <td><span style={{ color: 'var(--color-warning)' }}>●</span></td>
                                        <td>Etiquetas de Proyecto</td>
                                        <td>
                                            <select className="form-select" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                                                <option>Selección</option>
                                                <option>Texto</option>
                                            </select>
                                        </td>
                                        <td><span className="badge warning">DINÁMICO</span></td>
                                        <td><button className="btn btn-ghost"><Edit2 size={14} /></button></td>
                                    </tr>
                                    <tr>
                                        <td><span style={{ color: 'var(--color-primary)' }}>●</span></td>
                                        <td>Presupuesto Estimado</td>
                                        <td>
                                            <select className="form-select" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                                                <option>Numérico</option>
                                                <option>Texto</option>
                                            </select>
                                        </td>
                                        <td><span className="badge primary">SISTEMA</span></td>
                                        <td><button className="btn btn-ghost"><Edit2 size={14} /></button></td>
                                    </tr>
                                </tbody>
                            </table>

                            <button className="btn btn-outline mt-md" style={{ width: '100%' }}>
                                <Plus size={16} /> Agregar Nuevo Campo Personalizado
                            </button>
                        </div>
                    </div>

                    {/* Métricas */}
                    <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                            <Database size={20} style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }} />
                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>84%</div>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>USO DE CAMPOS</div>
                        </div>
                        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                            <Layout size={20} style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }} />
                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>32</div>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>TOTAL COLUMNAS</div>
                        </div>
                        <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                            <Check size={20} style={{ color: 'var(--color-success)', marginBottom: '0.5rem' }} />
                            <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>hace 2 min</div>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>ÚLTIMA SINCRONÍA</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer con tema y guardar */}
            <div className="card mt-lg">
                <div className="card-body flex-between">
                    <button
                        className="btn btn-outline"
                        onClick={toggleTheme}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        {theme === 'claro' ? <Moon size={18} /> : <Sun size={18} />}
                        MODO {theme === 'claro' ? 'OSCURO' : 'CLARO'}
                    </button>

                    <div className="flex gap-md" style={{ alignItems: 'center' }}>
                        {saveMessage && (
                            <span style={{
                                fontSize: '0.875rem',
                                color: saveMessage.includes('Error') ? 'var(--color-danger)' : 'var(--color-success)'
                            }}>
                                {saveMessage}
                            </span>
                        )}
                        <button
                            className="btn btn-success"
                            onClick={saveConfig}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="spin" /> Guardando...
                                </>
                            ) : (
                                <>
                                    <Save size={16} /> Guardar Configuración
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            <div className="text-center mt-md text-muted" style={{ fontSize: '0.75rem' }}>
                © 2024 DPCOM360 - Sistema de Gestión v2.5.0 | SOPORTE TÉCNICO | PREVISUALIZAR CAMBIOS
            </div>
        </>
    )
}
