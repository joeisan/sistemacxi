import { getTenantBySubdomain } from '@/lib/tenant/get-tenant'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LayoutDashboard, Users, Package, Settings, Bell, LogOut, ShieldAlert, CreditCard, Calendar, Zap, ChevronRight, User } from 'lucide-react'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { MobileNav } from '@/components/layout/mobile-nav'
import { FontSizeSelector } from '@/components/layout/font-size-selector'
import { Badge } from '@/components/ui/badge'
import { isTenantExpired } from '@/lib/utils/tenant-helpers'

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

  // --- SECURITY GUARD ---
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  // 1. Must be logged in
  if (authError || !user) {
    redirect(`/${tenant}`)
  }

  // 2. Fetch profile to check role and tenant_id
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  // 3. Isolated access: Must be admin of THIS tenant
  // (Isolated means we check if their tenant_id matches the one they are trying to access)
  const isAuthorized = !profileError && 
                       profile?.role === 'admin' && 
                       profile?.tenant_id === tenantData.id

  if (!isAuthorized) {
    redirect(`/${tenant}`)
  }

  const isExpired = isTenantExpired(tenantData)
  const whatsappNumber = "50762879345"
  const whatsappMessage = encodeURIComponent(`Hola, quiero reactivar mi cuenta ${tenantData.name}`)
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`

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
            <div className={`font-bold text-base mb-2 ${isExpired ? 'text-destructive' : ''}`}>
                {isExpired ? 'PLAN EXPIRADO' : (tenantData.plan_type === 'monthly' ? 'Plan Mensual' : 'Plan Anual')}
            </div>
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" /> Expiración:
                    </span>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`font-mono font-bold ${isExpired ? 'text-destructive' : 'text-primary'}`}>
                          {isExpired ? 'EXPIRADO' : (tenantData.plan_expiry_date ? new Date(tenantData.plan_expiry_date).toLocaleDateString() : 'Indefinida')}
                      </span>
                      {tenantData.is_trial && !isExpired && (
                        <Badge variant="destructive" className="h-4 px-1 text-[8px] font-black animate-pulse">
                          PRUEBA ACTIVA
                        </Badge>
                      )}
                    </div>
                </div>
            </div>
            <a 
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-3 flex items-center justify-center gap-1 w-full py-2 rounded-md text-[10px] font-black uppercase tracking-tighter transition-colors ${
                  isExpired ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-primary/10 hover:bg-primary/20 text-primary'
                }`}
            >
                {isExpired ? 'Reactivar Ahora' : 'Gestionar Cuenta'} <ChevronRight className="h-3 w-3" />
            </a>
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

      {isExpired && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-orange-600 backdrop-blur-sm text-white py-2 px-4 shadow-lg flex items-center justify-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
           <Zap className="h-4 w-4 shrink-0 fill-current animate-pulse" />
           <p className="text-sm font-bold tracking-tight">
             TU PLAN HA EXPIRADO: Tu cuenta está en modo lectura. Por favor reactiva tu suscripción para continuar.
           </p>
           <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-orange-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-tighter hover:bg-orange-50 transition-colors"
           >
             Reactivar vía WhatsApp
           </a>
        </div>
      )}

      {/* Sidebar Desktop */}
      <aside className={`hidden w-64 flex-col border-r bg-card/30 backdrop-blur-xl md:flex sticky top-0 h-screen overflow-y-auto ${!tenantData.is_active ? 'pt-10' : ''}`}>
        <div className="flex h-16 items-center border-b px-6 bg-primary/5">
          <Link href={`/${tenant}/admin`} className="flex items-center gap-2 font-bold text-lg tracking-tight group">
            {tenantData.logo_url ? (
              <img src={tenantData.logo_url} alt={tenantData.name} className="h-8 w-auto object-contain transition-transform group-hover:scale-105" />
            ) : (
              <span className="truncate text-foreground">Admin <span className="text-primary">{tenantData.name}</span></span>
            )}
          </Link>
        </div>
        
        <div className="flex-1 flex flex-col justify-between overflow-y-auto py-6">
            <nav className="space-y-1 px-3">
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Gestión</div>
            {navItems.map((item) => {
                const Icon = item.iconName === 'LayoutDashboard' ? LayoutDashboard : 
                            item.iconName === 'Users' ? Users : 
                            item.iconName === 'Package' ? Package : 
                            item.iconName === 'CreditCard' ? CreditCard : Bell
                return (
                <Link 
                    key={item.href}
                    href={item.href} 
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-all duration-300 hover:text-primary hover:bg-primary/5 group"
                >
                    <Icon className="h-4 w-4 group-hover:text-primary transition-colors" />
                    {item.label}
                </Link>
                )
            })}
            </nav>

            <div className="px-3">
              {subscriptionCard}
            </div>
        </div>

        <div className="border-t p-4 flex flex-col gap-3 bg-primary/5">
            <div className="flex items-center justify-between gap-2 px-2">
                <FontSizeSelector />
                <ThemeToggle />
            </div>
            <Link href={`/${tenant}/admin/configuracion/perfil`} className="flex items-center gap-2 w-full p-2 rounded-xl hover:bg-primary/5 text-xs font-bold text-muted-foreground hover:text-primary transition-all group">
              <User className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              Perfil y Marca
            </Link>
           <Link href={`/${tenant}/admin/configuracion`} className="flex items-center gap-2 w-full p-2 rounded-xl hover:bg-primary/5 text-xs font-bold text-muted-foreground hover:text-primary transition-all group">
             <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
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
