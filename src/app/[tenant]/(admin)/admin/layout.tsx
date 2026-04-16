import { getTenantBySubdomain } from '@/lib/tenant/get-tenant'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Users, Package, Settings, Bell, LogOut, ShieldAlert, CreditCard, Calendar, Zap, ChevronRight } from 'lucide-react'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { MobileNav } from '@/components/layout/mobile-nav'
import { FontSizeSelector } from '@/components/layout/font-size-selector'

export default async function AdminDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ tenant: string }>
}) {
  const resolvedParams = await params
  const { tenant } = resolvedParams
  const tenantData = await getTenantBySubdomain(tenant)

  if (!tenantData) return notFound()

  const navItems = [
    { href: `/admin`, label: 'Resumen', iconName: 'LayoutDashboard' },
    { href: `/admin/clientes`, label: 'Clientes', iconName: 'Users' },
    { href: `/admin/paquetes`, label: 'Paquetes', iconName: 'Package' },
    { href: `/admin/planes`, label: 'Planes de Cobro', iconName: 'CreditCard' },
    { href: `/admin/notificaciones`, label: 'Notificaciones', iconName: 'Bell' },
  ]

  const footerItems = [
    { href: `/admin/configuracion`, label: 'Configuración', iconName: 'Settings' },
    { href: '#', label: 'Cerrar sesión', iconName: 'LogOut' },
  ]

  // Subscription Card for Admin (Same design as client)
  const subscriptionCard = (
    <div className="px-4 py-6">
        <div className="rounded-xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <Zap className="h-4 w-4 fill-current" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Suscripción</span>
            </div>
            <div className="font-bold text-base mb-2">{tenantData.plan_type === 'monthly' ? 'Plan Mensual' : 'Plan Anual'}</div>
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" /> Expiración:
                    </span>
                    <span className="font-mono font-bold text-primary">
                        {tenantData.plan_expiry_date ? new Date(tenantData.plan_expiry_date).toLocaleDateString() : 'Indefinida'}
                    </span>
                </div>
            </div>
            <Link 
                href="/admin/configuracion" 
                className="mt-3 flex items-center justify-center gap-1 w-full py-2 rounded-md text-[10px] font-black uppercase tracking-tighter bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
            >
                Gestionar Cuenta <ChevronRight className="h-3 w-3" />
            </Link>
        </div>
    </div>
  )

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row relative">
      {!tenantData.is_active && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-destructive/90 backdrop-blur-sm text-destructive-foreground py-2 px-4 shadow-lg flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-4 duration-500">
           <ShieldAlert className="h-4 w-4 shrink-0" />
           <p className="text-sm font-bold tracking-tight">
             MODO SOLO LECTURA: Tu cuenta ha sido suspendida. Contacta a soporte para más detalles.
           </p>
        </div>
      )}

      {/* Sidebar Desktop */}
      <aside className={`hidden w-64 flex-col border-r bg-background md:flex ${!tenantData.is_active ? 'pt-10' : ''}`}>
        <div className="flex h-16 items-center border-b px-6 bg-primary/5">
          <Link href={`/${tenant}/admin`} className="flex items-center gap-2 font-bold text-lg">
            <span className="truncate">Admin - {tenantData.name}</span>
          </Link>
        </div>
        
        <div className="flex-1 flex flex-col justify-between overflow-y-auto">
            <nav className="space-y-1.5 px-3 py-4">
            {navItems.map((item) => {
                const Icon = item.iconName === 'LayoutDashboard' ? LayoutDashboard : 
                            item.iconName === 'Users' ? Users : 
                            item.iconName === 'Package' ? Package : 
                            item.iconName === 'CreditCard' ? CreditCard : Bell
                return (
                <Link 
                    key={item.href}
                    href={item.href} 
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:text-primary hover:bg-muted"
                >
                    <Icon className="h-4 w-4" />
                    {item.label}
                </Link>
                )
            })}
            </nav>

            {subscriptionCard}
        </div>

        <div className="border-t p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
                <FontSizeSelector />
                <ThemeToggle />
            </div>
           <Link href={`/${tenant}/admin/configuracion`} className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">
             <Settings className="h-4 w-4" />
             Configuración
           </Link>
        </div>
      </aside>

      <div className={`flex flex-1 flex-col ${!tenantData.is_active ? 'pt-10' : ''}`}>
        <MobileNav 
          title={tenantData.name} 
          items={navItems} 
          footerItems={footerItems}
          logo={tenantData.logo_url}
          extraContent={subscriptionCard}
        />

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 md:pt-4 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  )
}
