import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { MobileNav } from '@/components/layout/mobile-nav'
import { LayoutDashboard, Building, Users, LogOut } from 'lucide-react'
import Link from 'next/link'

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // 1. Check if user is logged in
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  // 2. Check if user is super_admin
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || profile?.role !== 'super_admin') {
    redirect('/login')
  }

  const navItems = [
    { href: '/super-admin', label: 'Resumen', iconName: 'LayoutDashboard' },
    { href: '/super-admin/tenants', label: 'Empresas', iconName: 'Building' },
    { href: '/super-admin/usuarios', label: 'Administradores', iconName: 'Users' },
  ]

  const footerItems = [
    { href: '#', label: 'Cerrar Sesión', iconName: 'LogOut' },
  ]

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden w-64 flex-col border-r bg-background md:flex">
        <div className="flex h-16 items-center border-b px-6 bg-primary/10">
          <Link href="/super-admin" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-primary">Super Admin</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-2 px-4 py-4">
          {navItems.map((item) => {
             const Icon = item.iconName === 'LayoutDashboard' ? LayoutDashboard : 
                          item.iconName === 'Building' ? Building : Users
             return (
              <Link 
                key={item.href}
                href={item.href} 
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-foreground transition-all hover:text-primary hover:bg-muted font-medium"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
             )
          })}
        </nav>
        <div className="border-t p-4 flex items-center justify-end gap-3">
            <ThemeToggle />
            <span className="text-xs font-mono text-muted-foreground uppercase text-right">v1.2.0</span>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <MobileNav 
          title="Super Admin" 
          items={navItems} 
          footerItems={footerItems}
        />

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 md:pt-4 md:gap-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
