'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    FolderKanban,
    Truck,
    DollarSign,
    Settings,
    Plus,
    Briefcase
} from 'lucide-react'

const navItems = [
    { href: '/', label: 'Tablero Principal', icon: LayoutDashboard },
    { href: '/clientes', label: 'Clientes', icon: Users },
    { href: '/trabajos', label: 'Trabajos', icon: Briefcase },
    { href: '/entregas', label: 'Entregas', icon: Truck },
    { href: '/gastos', label: 'Gastos y Egresos', icon: DollarSign },
    { href: '/configuracion', label: 'Configuración', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/'
        return pathname.startsWith(href)
    }

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <span>📍</span>
                    <div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.7, letterSpacing: '0.1em' }}>AGENCIA</div>
                        <div>DPCOM360</div>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="sidebar-footer">
                <Link href="/clientes/nuevo" className="btn-new" style={{ marginBottom: '0.5rem' }}>
                    <Plus size={18} />
                    Nuevo Cliente
                </Link>
                <Link href="/trabajos/nuevo" className="btn-new" style={{ background: 'var(--color-primary)' }}>
                    <Plus size={18} />
                    Nuevo Trabajo
                </Link>
            </div>
        </aside>
    )
}
