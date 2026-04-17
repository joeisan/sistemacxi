"use client"

import { useState } from "react"
import { extendTrial, activateFullPortal } from "@/app/actions/super-admin/manage-trial"
import { Button } from "@/components/ui/button"
import { Clock, Zap, Loader2 } from "lucide-react"
import { toast } from "sonner"

export function TrialActions({ tenantId, isTrial }: { tenantId: string, isTrial: boolean }) {
  const [loading, setLoading] = useState(false)

  const handleExtend = async () => {
    setLoading(true)
    const res = await extendTrial(tenantId)
    if (res.success) {
      toast.success("Prueba extendida 24h")
    } else {
      toast.error("Error: " + res.error)
    }
    setLoading(false)
  }

  const handleActivate = async () => {
    if (!confirm("¿Seguro que deseas activar este portal de forma definitiva?")) return
    setLoading(true)
    const res = await activateFullPortal(tenantId)
    if (res.success) {
      toast.success("Portalactivado definitivamente")
    } else {
      toast.error("Error: " + res.error)
    }
    setLoading(false)
  }

  if (!isTrial) return null

  return (
    <div className="flex items-center gap-1">
      <Button 
        variant="outline" 
        size="icon" 
        className="h-8 w-8 text-primary border-primary/20 hover:bg-primary/5"
        onClick={handleExtend}
        disabled={loading}
        title="Extender 24h"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Clock className="h-3.5 w-3.5" />}
      </Button>
      <Button 
        variant="outline" 
        size="icon" 
        className="h-8 w-8 text-amber-600 border-amber-200 hover:bg-amber-50"
        onClick={handleActivate}
        disabled={loading}
        title="Activar Portal Real"
      >
        <Zap className="h-3.5 w-3.5 fill-current" />
      </Button>
    </div>
  )
}
