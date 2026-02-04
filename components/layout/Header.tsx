'use client'

import { Search, Bell, Moon, Sun, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'

interface HeaderProps {
    title: string
    subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
    const router = useRouter()
    const supabase = createClient()
    const [theme, setTheme] = useState<'claro' | 'oscuro'>('claro')
    const [userEmail, setUserEmail] = useState<string>('')

    useEffect(() => {
        // Cargar tema guardado
        const savedTheme = localStorage.getItem('theme') as 'claro' | 'oscuro' | null
        if (savedTheme) {
            setTheme(savedTheme)
            document.documentElement.setAttribute('data-theme', savedTheme)
        }

        // Obtener usuario
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (user?.email) {
                setUserEmail(user.email)
            }
        })
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'claro' ? 'oscuro' : 'claro'
        setTheme(newTheme)
        localStorage.setItem('theme', newTheme)
        document.documentElement.setAttribute('data-theme', newTheme)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    const userInitials = userEmail ? userEmail.substring(0, 2).toUpperCase() : 'US'

    return (
        <header className="header">
            <div className="header-title">
                <h1>{title}</h1>
                {subtitle && <p>{subtitle}</p>}
            </div>

            <div className="header-actions">
                <div className="search-box">
                    <Search size={18} style={{ color: 'var(--color-text-muted)' }} />
                    <input type="text" placeholder="Buscar trabajos, clientes..." />
                </div>

                <button className="btn btn-ghost" onClick={toggleTheme} title="Cambiar tema">
                    {theme === 'claro' ? <Moon size={20} /> : <Sun size={20} />}
                </button>

                <button className="btn btn-ghost" title="Notificaciones">
                    <Bell size={20} />
                </button>

                <div className="user-avatar" title={userEmail}>
                    {userInitials}
                </div>

                <button className="btn btn-ghost" onClick={handleLogout} title="Cerrar sesión">
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    )
}
