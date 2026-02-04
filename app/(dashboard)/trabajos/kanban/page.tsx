'use client'

import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Plus, MoreHorizontal, Calendar, Filter } from 'lucide-react'
import Link from 'next/link'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Pedido } from '@/lib/types'

interface KanbanColumn {
    id: string
    title: string
    color: string
}

const columns: KanbanColumn[] = [
    { id: 'presupuestado', title: 'Presupuestado', color: 'var(--color-warning)' },
    { id: 'en_curso', title: 'En Curso', color: 'var(--color-primary)' },
    { id: 'terminado', title: 'Terminado', color: 'var(--color-success)' },
]

function SortableCard({ pedido }: { pedido: Pedido }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: pedido.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const getPagoBadge = (pagado: string) => {
        const pagos: Record<string, { class: string; label: string }> = {
            'pendiente': { class: 'danger', label: 'PENDIENTE' },
            'señado': { class: 'warning', label: 'PAGADO' },
            'pagado': { class: 'success', label: 'PAGADO' },
        }
        return pagos[pagado] || { class: 'danger', label: 'PENDIENTE' }
    }

    const pagoBadge = getPagoBadge(pedido.pagado)

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="kanban-card"
        >
            <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                <span className="kanban-card-id">
                    #DES-{String(pedido.nro_pedido).padStart(4, '0')}
                </span>
                <span className={`badge ${pagoBadge.class}`} style={{ fontSize: '0.65rem' }}>
                    {pagoBadge.label}
                </span>
            </div>
            <div className="kanban-card-title">{pedido.nombre_trabajo}</div>
            <div className="kanban-card-client">
                Cliente: {(pedido as any).cliente?.empresa || (pedido as any).cliente?.nombre || 'Sin asignar'}
            </div>
            <div className="kanban-card-footer">
                <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                    <Calendar size={14} style={{ color: 'var(--color-text-muted)' }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                        {pedido.fecha_entrega
                            ? new Date(pedido.fecha_entrega).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
                            : 'Sin fecha'
                        }
                    </span>
                </div>
                <button className="btn btn-ghost" style={{ padding: '0.25rem' }}>
                    <MoreHorizontal size={16} />
                </button>
            </div>
        </div>
    )
}

function KanbanColumnComponent({
    column,
    pedidos
}: {
    column: KanbanColumn
    pedidos: Pedido[]
}) {
    return (
        <div className="kanban-column">
            <div className="kanban-column-header">
                <div className="kanban-column-title">
                    <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: column.color,
                        display: 'inline-block'
                    }} />
                    {column.title}
                    <span className="kanban-column-count">{pedidos.length}</span>
                </div>
                <button className="btn btn-ghost" style={{ padding: '0.25rem' }}>
                    <MoreHorizontal size={16} />
                </button>
            </div>
            <div className="kanban-cards">
                <SortableContext items={pedidos.map(p => p.id)} strategy={verticalListSortingStrategy}>
                    {pedidos.map(pedido => (
                        <SortableCard key={pedido.id} pedido={pedido} />
                    ))}
                </SortableContext>
            </div>
        </div>
    )
}

export default function KanbanPage() {
    const supabase = createClient()
    const [pedidos, setPedidos] = useState<Pedido[]>([])
    const [activeId, setActiveId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    useEffect(() => {
        const loadPedidos = async () => {
            const { data } = await supabase
                .from('pedidos')
                .select(`
          *,
          cliente:clientes(nombre, apellido, empresa)
        `)
                .order('created_at', { ascending: false })

            if (data) setPedidos(data)
            setLoading(false)
        }
        loadPedidos()
    }, [])

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string)
    }

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event
        setActiveId(null)

        if (!over) return

        const activeId = active.id as string
        const overId = over.id as string

        // Determinar la columna de destino
        let targetColumn: string | null = null

        // Si over es una columna
        if (['presupuestado', 'en_curso', 'terminado'].includes(overId)) {
            targetColumn = overId
        } else {
            // Si over es otro pedido, obtener su columna
            const overPedido = pedidos.find(p => p.id === overId)
            if (overPedido) {
                targetColumn = overPedido.estado
            }
        }

        if (!targetColumn) return

        const activePedido = pedidos.find(p => p.id === activeId)
        if (!activePedido || activePedido.estado === targetColumn) return

        // Actualizar estado local inmediatamente
        setPedidos(prev => prev.map(p =>
            p.id === activeId ? { ...p, estado: targetColumn! } : p
        ))

        // Actualizar en Supabase
        const { error } = await supabase
            .from('pedidos')
            .update({ estado: targetColumn })
            .eq('id', activeId)

        if (error) {
            // Revertir si hay error
            setPedidos(prev => prev.map(p =>
                p.id === activeId ? { ...p, estado: activePedido.estado } : p
            ))
            console.error('Error updating pedido:', error)
        }
    }

    const getPedidosByColumn = (columnId: string) => {
        return pedidos.filter(p => p.estado === columnId)
    }

    const activePedido = activeId ? pedidos.find(p => p.id === activeId) : null

    return (
        <>
            <Header title="Tablero de Trabajos" />

            <div className="flex-between mb-md">
                <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                    <div className="flex gap-sm" style={{ alignItems: 'center' }}>
                        {/* Avatar placeholders */}
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--color-primary)',
                            border: '2px solid white'
                        }} />
                        <span className="text-muted" style={{ fontSize: '0.875rem' }}>+{pedidos.length}</span>
                    </div>
                    <button className="btn btn-outline">
                        <Filter size={16} /> Filtrar
                    </button>
                    <button className="btn btn-outline">
                        Ordenar
                    </button>
                </div>
                <Link href="/trabajos/nuevo" className="btn btn-success">
                    <Plus size={16} /> Nuevo Trabajo
                </Link>
            </div>

            {loading ? (
                <div className="flex-center" style={{ padding: '4rem' }}>
                    <div className="text-muted">Cargando...</div>
                </div>
            ) : (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="kanban-board">
                        {columns.map(column => (
                            <KanbanColumnComponent
                                key={column.id}
                                column={column}
                                pedidos={getPedidosByColumn(column.id)}
                            />
                        ))}
                    </div>

                    <DragOverlay>
                        {activePedido ? (
                            <div className="kanban-card" style={{ boxShadow: 'var(--shadow-lg)', cursor: 'grabbing' }}>
                                <div className="kanban-card-id">
                                    #DES-{String(activePedido.nro_pedido).padStart(4, '0')}
                                </div>
                                <div className="kanban-card-title">{activePedido.nombre_trabajo}</div>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}
        </>
    )
}
