import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { MobileNav } from '@/components/layout/mobile-nav'
import { LayoutDashboard, Building, Users, LogOut } from 'lucide-react'
import Link from 'next/link'
import { FontSizeProvider } from '@/components/providers/font-size-provider'

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
    <FontSizeProvider>
      <div className="flex min-h-screen w-full flex-col bg-background/95 md:flex-row">
        {/* Sidebar Desktop */}
        <aside className="hidden w-64 flex-col border-r bg-card/30 backdrop-blur-xl md:flex sticky top-0 h-screen overflow-y-auto">
          <div className="flex h-16 items-center border-b px-6 bg-primary/5">
            <Link href="/super-admin" className="flex items-center gap-2 font-bold text-lg tracking-tight">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <span className="text-foreground">Super<span className="text-primary">Admin</span></span>
            </Link>
          </div>
          
          <div className="flex-1 flex flex-col justify-between py-6">
            <nav className="space-y-1 px-3">
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Menú Principal</div>
              {navItems.map((item) => {
                const Icon = item.iconName === 'LayoutDashboard' ? LayoutDashboard : 
                              item.iconName === 'Building' ? Building : Users
                return (
                  <Link 
                    key={item.href}
                    href={item.href} 
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-300 hover:text-primary hover:bg-primary/5 group"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            <div className="px-6">
              <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-transparent p-4 border border-primary/10 shadow-sm shadow-primary/5">
                <div className="text-xs font-bold text-primary mb-1 uppercase tracking-tighter">Soporte Técnico</div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">¿Necesitas ayuda con el sistema? Contacta con desarrollo.</p>
              </div>
            </div>
          </div>

          <div className="border-t p-4 flex items-center justify-between gap-3 bg-primary/5">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-muted-foreground">Sistema Online</span>
              </div>
              <ThemeToggle />
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <MobileNav 
            title="Super Admin" 
            items={navItems} 
            footerItems={footerItems}
          />

          <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 md:pt-4 md:gap-8 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </FontSizeProvider>
  )
}
