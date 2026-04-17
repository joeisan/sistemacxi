"use client"

import { useState } from "react"
import { requestUpgrade } from "@/app/actions/auth/request-upgrade"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, Loader2 } from "lucide-react"

export function TrialExpiredForm({ tenantId }: { tenantId: string }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    formData.append("tenantId", tenantId)

    try {
      const res = await requestUpgrade(formData)
      if (res.success) {
        setSuccess(true)
      } else {
        setError(res.error || "Ocurrió un error.")
      }
    } catch (err) {
      setError("Error de conexión.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl flex flex-col items-center gap-3 animate-in fade-in zoom-in-95">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
        <p className="text-sm font-bold text-green-600">¡Solicitud Enviada!</p>
        <p className="text-xs text-green-600/80">Te contactaremos lo antes posible para activar tu portal.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-xs text-destructive font-bold">{error}</p>}
      <Input 
        name="name" 
        placeholder="Tu Nombre" 
        className="h-10 px-4 rounded-lg bg-background text-sm" 
        required 
        disabled={loading}
      />
      <Input 
        name="email" 
        type="email" 
        placeholder="Tu Email de Contacto" 
        className="h-10 px-4 rounded-lg bg-background text-sm" 
        required 
        disabled={loading}
      />
      <Button 
        type="submit" 
        className="w-full h-11 bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs rounded-lg hover:opacity-90 py-2"
        disabled={loading}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        {loading ? "Enviando..." : "Solicitar Portal Real"}
      </Button>
    </form>
  )
}
