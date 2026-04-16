'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { updatePackageStatus } from '@/app/actions/admin/update-package-status'
import { getClientPackages } from '@/app/actions/admin/get-client-packages'

interface PackageItem {
  id: string
  tracking_number: string
  courier_name: string
  status: string
  description: string
  created_at: string
}

export function ClientPackagesList({ clientId, onClose }: { clientId: string, onClose: () => void }) {
  const [packages, setPackages] = useState<PackageItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const result = await getClientPackages(clientId)
      if (result.success) {
        setPackages(result.data || [])
      }
      setIsLoading(false)
    }
    fetchData()
  }, [clientId])

  const handleMarkPickedUp = async (packageId: string) => {
    setProcessingId(packageId)
    try {
      const result = await updatePackageStatus(packageId, 'entregado')
      if (result.success) {
        toast.success('Paquete marcado como entregado/recogido')
        // Move to the end (history)
        setPackages(prev => prev.map(p => 
          p.id === packageId ? { ...p, status: 'entregado' } : p
        ))
      } else {
        toast.error('Error al actualizar')
      }
    } catch {
      toast.error('Error de red')
    } finally {
      setProcessingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="py-8 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  const activePackages = packages.filter(p => p.status !== 'entregado')
  const deliveredPackages = packages.filter(p => p.status === 'entregado')

  const statusLabels: Record<string, string> = {
    'pre-alertado': 'Pre-alertado',
    'recibido': 'En Miami',
    'en_transito': 'En Tránsito',
    'listo_para_entrega': 'Listo p/ Entrega',
    'entregado': 'Entregado',
  }

  const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    'pre-alertado': 'secondary',
    'recibido': 'outline',
    'en_transito': 'secondary',
    'listo_para_entrega': 'default',
    'entregado': 'default',
  }

  return (
    <div className="space-y-6">
      {/* Active Packages */}
      {activePackages.length > 0 ? (
        <div className="space-y-3">
          <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
            Activos ({activePackages.length})
          </h3>
          {activePackages.map((pkg) => (
            <div key={pkg.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold">{pkg.tracking_number || 'Sin tracking'}</span>
                  <Badge variant={statusVariants[pkg.status] || 'outline'} className="text-[10px] h-5">
                    {statusLabels[pkg.status] || pkg.status}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {pkg.courier_name} · {new Date(pkg.created_at).toLocaleDateString()}
                </span>
                {pkg.description && (
                  <span className="text-xs text-muted-foreground italic">{pkg.description}</span>
                )}
              </div>
              <Button 
                size="sm" 
                variant="outline"
                className="h-8 gap-1 text-xs border-green-500/30 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                onClick={() => handleMarkPickedUp(pkg.id)}
                disabled={processingId === pkg.id}
              >
                {processingId === pkg.id ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3 w-3" />
                )}
                Recogido
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-4 text-center border rounded-lg bg-muted/20">
          <Package className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Sin paquetes activos</p>
        </div>
      )}

      {/* Delivered History */}
      {deliveredPackages.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
            Historial ({deliveredPackages.length})
          </h3>
          {deliveredPackages.slice(0, 5).map((pkg) => (
            <div key={pkg.id} className="flex items-center justify-between p-2 rounded-lg border border-muted/50 bg-muted/10 opacity-70">
              <div className="flex flex-col gap-0.5">
                <span className="font-mono text-xs">{pkg.tracking_number || 'Sin tracking'}</span>
                <span className="text-[10px] text-muted-foreground">
                  {pkg.courier_name} · {new Date(pkg.created_at).toLocaleDateString()}
                </span>
              </div>
              <Badge variant="default" className="text-[10px] h-5 bg-green-600">
                Entregado
              </Badge>
            </div>
          ))}
          {deliveredPackages.length > 5 && (
            <p className="text-xs text-muted-foreground text-center">
              ... y {deliveredPackages.length - 5} más en historial
            </p>
          )}
        </div>
      )}
    </div>
  )
}
