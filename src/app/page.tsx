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
  Smartphone
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
            <a href="#solutions" className="text-sm font-medium hover:text-primary transition-colors">Soluciones</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/super-admin">
              <Button variant="ghost" className="hidden sm:inline-flex">Super Admin</Button>
            </Link>
            <Button size="sm">Contáctanos</Button>
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
               <span className="text-[10px] font-black uppercase tracking-widest text-primary">v2.0 Beta</span>
               <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
               <span className="text-[10px] font-medium text-muted-foreground">Sistema Multi-Tenant Disponible</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] text-foreground">
              Logística Global <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">Simplificada</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
              La plataforma definitiva para administrar casilleros internacionales, tracking de paquetes y gestión financiera para operadores logísticos.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/super-admin/setup">
                <Button size="lg" className="rounded-full px-8 h-12 text-base font-bold shadow-lg shadow-primary/20">
                  Comienza Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="rounded-full px-8 h-12 text-base font-bold bg-background/50 backdrop-blur-sm border-white/20">
                Ver Demo
              </Button>
            </div>

            <div className="flex items-center gap-6 justify-center lg:justify-start pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground">50+ Operadores</span> ya confían en nosotros
              </p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-muted rounded-3xl overflow-hidden shadow-2xl border border-white/10 aspect-[4/3] flex items-center justify-center">
               <Image 
                src="/hero-logistics.png"
                alt="Logistics Concept"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
               />
               <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-primary">Poderosa Infraestructura</h2>
            <h3 className="text-4xl font-bold tracking-tight">Todo lo que necesitas para escalar tu franquicia</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Building2,
                title: "Multi-Tenant",
                desc: "Crea y administra múltiples instancias de empresas bajo un solo panel central."
              },
              {
                icon: PackageSearch,
                title: "Tracking Avanzado",
                desc: "Seguimiento en tiempo real de paquetes desde Miami hasta destino final."
              },
              {
                icon: ShieldCheck,
                title: "Finanzas Seguras",
                desc: "Cálculo automático de flete, impuestos y saldos pendientes por cliente."
              },
              {
                icon: Smartphone,
                title: "Panel de Cliente",
                desc: "Interfaz premium para que tus usuarios registren pre-alertas y vean su historial."
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

      {/* --- STATS / SOCIAL PROOF --- */}
      <section className="py-20 border-y bg-background">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { label: "Paquetes Procesados", value: "+250K", icon: PackageSearch },
            { label: "Eficiencia Logística", value: "99.9%", icon: TrendingUp },
            { label: "Paises Soportados", value: "12+", icon: Globe2 },
            { label: "Tiempo de Respuesta", value: "< 2ms", icon: ShieldCheck },
          ].map((stat, i) => (
            <div key={i} className="space-y-2">
              <div className="text-3xl md:text-5xl font-black tracking-tighter text-foreground">{stat.value}</div>
              <p className="text-xs uppercase font-bold tracking-widest text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 bg-background border-t">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <span className="font-bold text-lg">LogiStream</span>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2026 LogiStream. Todos los derechos reservados.
          </p>

          <div className="flex items-center gap-6">
             <a href="#" className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">Privacidad</a>
             <a href="#" className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors">Soporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
