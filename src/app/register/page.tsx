"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerAdmin } from "@/app/actions/auth/register-admin"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Loader2, AlertCircle, CheckCircle2, Globe2, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    businessName: "",
    subdomain: "",
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  // Get root domain dynamically
  const getRootDomain = () => {
    if (typeof window === 'undefined') return 'sistemacxi.vercel.app'
    const host = window.location.host
    if (host.includes('localhost')) return 'localhost:3000'
    const parts = host.split('.')
    if (parts.length > 2) return parts.slice(-2).join('.')
    return host
  }
  const rootDomain = getRootDomain()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await registerAdmin(formData)
      if (res.success) {
        setSuccess(true)
        // Redirigir después de 3 segundos o dejar que el usuario haga clic
      } else {
        setError(res.error || "Error al registrar")
      }
    } catch (err: any) {
      setError("Error de conexión. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-2 border-primary/20 shadow-2xl text-center p-8 space-y-6">
          <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black">¡Portal Creado!</h2>
            <p className="text-muted-foreground">
              Tu plataforma de logística está lista. Tienes **24 horas de prueba gratuita** para explorar todas las funciones.
            </p>
          </div>
          <div className="p-4 bg-muted rounded-xl text-left space-y-2 border">
             <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
               <Globe2 className="w-3 h-3" /> Tu dirección de acceso:
             </p>
             <p className="font-mono text-sm font-bold text-primary truncate">
               {formData.subdomain}.{rootDomain}
             </p>
          </div>
          <a 
            href={`${window.location.protocol}//${formData.subdomain}.${rootDomain}`}
            className="block"
          >
            <Button className="w-full h-12 font-bold text-lg rounded-full">
              Ir a mi Panel <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-muted/30">
      <div className="flex-1 hidden lg:flex flex-col justify-center p-12 bg-primary text-primary-foreground space-y-8 relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
         <div className="relative z-10 space-y-6 max-w-lg">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
               <Building2 className="w-10 h-10" />
            </div>
            <h1 className="text-6xl font-black tracking-tighter leading-none italic">LOGISTREAM <br /> BUSINESS</h1>
            <p className="text-xl opacity-80 leading-relaxed">
              Únete a la red de operadores logísticos más avanzada. Crea tu sistema de casilleros internacionales hoy mismo.
            </p>
            <ul className="space-y-4 pt-4">
               {[
                 "Setup instantáneo en 60 segundos",
                 "Multi-bodega y Tracking en tiempo real",
                 "Prueba extendible de 24 horas",
                 "Soporte Premium incluido"
               ].map((item, i) => (
                 <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary" />
                    <span className="font-medium">{item}</span>
                 </li>
               ))}
            </ul>
         </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex flex-col items-center mb-8">
             <Building2 className="w-12 h-12 text-primary mb-2" />
             <h2 className="text-2xl font-black text-primary">LogiStream</h2>
          </div>

          <Card className="border shadow-2xl bg-background/80 backdrop-blur-xl">
            <CardHeader className="space-y-1">
              <CardTitle className="text-3xl font-black tracking-tight">Comienza Ahora</CardTitle>
              <CardDescription>
                Crea tu instancia y prueba el sistema gratis por 24h.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-6">
                {error && (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive text-sm font-medium animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    {error}
                  </div>
                )}
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Nombre de tu Empresa / Marca</Label>
                    <Input 
                      id="businessName" 
                      placeholder="Ej: Envíos Worldwide" 
                      required 
                      value={formData.businessName}
                      onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                      disabled={loading}
                      className="h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subdomain">Personaliza tu URL (Subdominio)</Label>
                    <div className="flex items-center">
                      <Input 
                        id="subdomain" 
                        placeholder="miempresa" 
                        required 
                        value={formData.subdomain}
                        onChange={(e) => setFormData({...formData, subdomain: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                        disabled={loading}
                        className="h-11 rounded-r-none border-r-0"
                      />
                      <div className="h-11 px-3 border rounded-r-md bg-muted flex items-center text-xs font-bold text-muted-foreground whitespace-nowrap">
                        .{rootDomain}
                      </div>
                    </div>
                  </div>

                  <hr className="my-2" />

                  <div className="space-y-2">
                    <Label htmlFor="email">Tu Email (Admin)</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="admin@miempresa.com" 
                      required 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={loading}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                     <Label htmlFor="password">Contraseña Maestra</Label>
                     <PasswordInput 
                       id="password" 
                       required 
                       value={formData.password}
                       onChange={(e) => setFormData({...formData, password: e.target.value})}
                       disabled={loading}
                       className="h-11"
                     />
                   </div>
                </div>

                <Button type="submit" className="w-full h-12 font-black text-lg shadow-lg shadow-primary/20" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creando tu Portal...
                    </>
                  ) : "¡Lanzar mi Plataforma!"}
                </Button>

                <p className="text-center text-xs text-muted-foreground px-4 leading-relaxed">
                  Al registrarte, aceptas nuestros términos de servicio. Tu prueba gratuita de 24 horas comenzará inmediatamente después del registro.
                </p>
              </form>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link href="/" className="text-sm font-bold text-primary hover:underline flex items-center justify-center gap-2">
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
