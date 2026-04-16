"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Loader2, AlertCircle } from "lucide-react"

export default function SuperAdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      // Verify if user is super_admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profileError || profile?.role !== 'super_admin') {
        await supabase.auth.signOut()
        throw new Error("No tienes permisos de Super Administrador.")
      }

      router.push("/super-admin")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Building2 className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Portal Global</h1>
        </div>

        <Card className="border shadow-xl bg-background/80 backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl font-bold">Bienvenido, Admin</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para administrar la plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="admin@ejemplo.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button type="submit" className="w-full font-bold" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Autenticando...
                  </>
                ) : "Entrar al Sistema"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
