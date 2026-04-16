import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  PackageSearch, 
  ShieldCheck, 
  Globe2, 
  ArrowRight,
  TrendingUp,
  Smartphone,
  CheckCircle2,
  BarChart3
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background selection:bg-primary/20">
      {/* --- NAVIGATION --- */}
      <header className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl tracking-tight">LogiStream</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Características</a>
            <a href="#benefits" className="text-sm font-medium hover:text-primary transition-colors">Beneficios</a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Precios</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="#contact">
               <Button size="sm">Solicitar Demo</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 left-1/2 -track-x-1/2 w-full h-[800px] bg-gradient-to-b from-primary/5 to-transparent -z-10 blur-3xl rounded-full" />
        
        <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit mx-auto lg:mx-0">
               <span className="text-[10px] font-black uppercase tracking-widest text-primary">Edición Empresarial</span>
               <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
               <span className="text-[10px] font-medium text-muted-foreground">Tu propia plataforma en 24h</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-foreground">
              Lleva tu Empresa de <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60 text-5xl md:text-7xl">Logística al Sig. Nivel</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
              Obtén una plataforma **Marca Blanca** completa para gestionar tus casilleros internacionales, tracking de paquetes y clientes sin complicaciones técnicas.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="rounded-full px-8 h-12 text-base font-bold shadow-lg shadow-primary/20">
                Lanza tu Plataforma
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base font-bold bg-background/50 backdrop-blur-sm border-white/20">
                Ver Funciones
              </Button>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 max-w-sm mx-auto lg:mx-0">
               {[
                 "Bajo tu propio subdominio",
                 "Panel de control exclusivo",
                 "Clientes con acceso premium",
                 "Gestión de cobros integrada"
               ].map((item, i) => (
                 <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                   <CheckCircle2 className="w-4 h-4 text-primary" />
                   {item}
                 </li>
               ))}
            </ul>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-muted rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3] flex items-center justify-center">
               <Image 
                src="/hero-logistics.png"
                alt="Plataforma Logística para Administradores"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
               />
               <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
               <div className="absolute bottom-6 left-6 right-6 p-6 glass-card rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-primary">Reporte en tiempo real</p>
                      <p className="text-sm font-medium text-white">+12.5% eficiencia operativa este mes</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Solución Todo-en-Uno</h2>
            <h3 className="text-4xl font-bold tracking-tight">Diseñado para Operadores de Carga</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: ShieldCheck,
                title: "Control Total",
                desc: "Gestiona clientes, tarifas y estados de paquetes con una interfaz intuitiva y potente."
              },
              {
                icon: PackageSearch,
                title: "Tracking Profesional",
                desc: "Tus clientes podrán ver el avance de sus compras desde la bodega hasta sus manos."
              },
              {
                icon: Smartphone,
                title: "App Web Optimizada",
                desc: "Tanto tú como tus clientes pueden acceder desde cualquier móvil o computadora."
              },
              {
                icon: Globe2,
                title: "Expansión Global",
                desc: "Soporte para múltiples bodegas y destinos internacionales sin límites."
              }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl bg-background border border-white/5 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h4 className="font-bold text-xl mb-3 tracking-tight">{feature.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CALL TO ACTION --- */}
      <section id="contact" className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-primary rounded-3xl p-12 text-center text-primary-foreground relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl rounded-full -mr-32 -mt-32" />
             <div className="relative z-10 space-y-8">
                <h2 className="text-4xl md:text-5xl font-black tracking-tight italic">¿Listo para transformar tu logística?</h2>
                <p className="text-lg opacity-90 max-w-xl mx-auto">
                  Únete a los operadores que ya están ahorrando horas de trabajo manual cada día con nuestra tecnología.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                   <Button size="lg" variant="secondary" className="px-10 font-bold rounded-full">
                      Hablemos Hoy
                   </Button>
                   <Button size="lg" variant="outline" className="px-10 font-bold rounded-full border-white/20 hover:bg-white/10">
                      Planes de Precios
                   </Button>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 bg-background border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-lg">LogiStream</span>
            </div>

            <nav className="flex items-center gap-8 text-sm text-muted-foreground">
               <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
               <a href="#" className="hover:text-primary transition-colors">Soporte</a>
               <a href="#" className="hover:text-primary transition-colors">Términos</a>
               <Link href="/super-admin" className="text-[10px] uppercase tracking-widest font-black opacity-30 hover:opacity-100 transition-opacity">
                  Portal Global
               </Link>
            </nav>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t pt-8">
            <p className="text-xs text-muted-foreground text-center">
              © 2026 LogiStream SaaS Solutions. Diseñado para el crecimiento logístico.
            </p>
            <div className="flex items-center gap-4">
               {/* Social placeholders */}
               <div className="w-4 h-4 bg-muted rounded-full" />
               <div className="w-4 h-4 bg-muted rounded-full" />
               <div className="w-4 h-4 bg-muted rounded-full" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
