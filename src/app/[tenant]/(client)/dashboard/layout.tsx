import { getTenantBySubdomain } from '@/lib/tenant/get-tenant'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Home, MapPin, Package, Bell, User, LogOut, ShieldAlert, CreditCard, ChevronRight, Zap } from 'lucide-react'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { MobileNav } from '@/components/layout/mobile-nav'
import { FontSizeSelector } from '@/components/layout/font-size-selector'
import { createClient } from '@/lib/supabase/server'

export default async function ClientDashboardLayout({
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

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/')
  }

  // 1. Fetch client info
  const { data: clientInfo } = await supabase
    .from('clients')
    .select('plan_id')
    .eq('profile_id', user.id)
    .single()

  let planInfo = null

  // 2. Definitive Plan Fetch (Independent query for maximum reliability)
  if (clientInfo?.plan_id) {
    const { data: directPlan } = await supabase
      .from('pricing_plans')
      .select('name, cost_per_lb, delivery_fee')
      .eq('id', clientInfo.plan_id)
      .single()
    
    if (directPlan) {
      planInfo = directPlan
    }
  }

  // Debug (Viewable in server logs)
  if (user.email === 'joel@mail.com') {
    console.log(`[DEBUG] Client: ${user.email}, PlanID: ${clientInfo?.plan_id}, PlanData:`, planInfo)
  }

  // Bloqueo de acceso si el tenant no está activo
  if (!tenantData.is_active) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-background">
        <div className="rounded-full bg-destructive/10 p-4 mb-4">
          <ShieldAlert className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Servicio Temporalmente No Disponible</h1>
        <p className="mt-2 text-muted-foreground max-w-md">
          Este portal se encuentra en mantenimiento o ha sido suspendido temporalmente. 
          Por favor, intenta más tarde o contacta a tu proveedor de casillero.
        </p>
      </div>
    )
  }

  const navItems = [
    { href: `/dashboard`, label: 'Inicio', iconName: 'Home' },
    { href: `/dashboard/rastrear`, label: 'Rastrear paquete', iconName: 'MapPin' },
    { href: `/dashboard/paquetes`, label: 'Mis Paquetes', iconName: 'Package' },
    { href: `/dashboard/finanzas`, label: 'Estado de Cuenta', iconName: 'CreditCard' },
    { href: `/dashboard/notificaciones`, label: 'Notificaciones', iconName: 'Bell' },
  ]

  const footerItems = [
    { href: `/dashboard/perfil`, label: 'Mi Perfil', iconName: 'User' },
    { href: '#', label: 'Cerrar sesión', iconName: 'LogOut' },
  ]

  const planCard = (
    <div className="px-4 py-6">
        <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                    <Zap className="h-4 w-4 fill-current" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mi Plan</span>
            </div>
            <div className="font-bold text-base mb-2 text-foreground">{planInfo?.name || 'Plan Estándar'}</div>
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Costo x Lb:</span>
                    <span className="font-mono font-bold text-foreground text-base">${planInfo?.cost_per_lb?.toFixed(2) || '3.00'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Delivery:</span>
                    <span className="font-mono font-bold text-foreground text-base">${planInfo?.delivery_fee?.toFixed(2) || '0.50'}</span>
                </div>
            </div>
            <Link 
                href="/dashboard/finanzas" 
                className="mt-3 flex items-center justify-center gap-1 w-full py-2 rounded-md text-[10px] font-black uppercase tracking-tighter bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
            >
                Ver detalles <ChevronRight className="h-3 w-3" />
            </Link>
        </div>
    </div>
  )

  // 3. Fetch client full name for display (Refined with tenant filter)
  const { data: profileInfo, error: profileError } = await supabase
    .from('clients')
    .select('full_name')
    .eq('profile_id', user.id)
    .eq('tenant_id', tenantData.id)
    .single()

  const displayName = profileInfo?.full_name || user.email

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden w-64 flex-col border-r bg-card/30 backdrop-blur-xl md:flex sticky top-0 h-screen overflow-y-auto">
        <div className="flex flex-col h-20 justify-center border-b px-6 bg-primary/5">
            {tenantData.logo_url ? (
              <img src={tenantData.logo_url} alt={tenantData.name} className="h-8 w-auto object-contain mb-1 transition-transform hover:scale-105" />
            ) : (
              <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">{tenantData.name}</div>
            )}
            <div className="font-bold text-base text-foreground truncate tracking-tight">{displayName}</div>
        </div>
        
        <div className="flex-1 flex flex-col justify-between overflow-y-auto py-6">
          <nav className="space-y-1 px-3">
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Servicios</div>
            {navItems.map((item) => {
               const Icon = item.iconName === 'Home' ? Home :                           
                            item.iconName === 'MapPin' ? MapPin : 
                             item.iconName === 'Package' ? Package : 
                             item.iconName === 'CreditCard' ? CreditCard : Bell
               return (
                <Link 
                  key={item.href}
                  href={item.href} 
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted-foreground transition-all duration-300 hover:text-primary hover:bg-primary/5 group"
                >
                  <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  {item.label}
                </Link>
               )
            })}
          </nav>

          <div className="px-3">
            {planCard}
          </div>
        </div>

        <div className="border-t p-4 flex flex-col gap-3 bg-primary/5">
            <div className="flex items-center justify-between px-2">
                <FontSizeSelector />
                <ThemeToggle />
            </div>
           <Link href={`/${tenant}/dashboard/perfil`} className="flex items-center gap-2 w-full p-2 rounded-xl hover:bg-primary/5 text-xs font-bold text-muted-foreground hover:text-primary transition-all group">
              <User className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              Mi Perfil
           </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <MobileNav 
          title={displayName} 
          items={navItems} 
          footerItems={footerItems}
          logo={tenantData.logo_url}
          extraContent={planCard}
        />


        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 md:pt-4 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  )
}
