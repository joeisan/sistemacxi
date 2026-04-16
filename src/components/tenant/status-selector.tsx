'use client'

import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronDown, Loader2 } from 'lucide-react'
import { updatePackageStatus } from '@/app/actions/admin/update-package-status'
import { toast } from 'sonner'

const statuses = [
  { value: 'recibido', label: 'Recibido en Miami', variant: 'outline' },
  { value: 'en_transito', label: 'En Tránsito', variant: 'secondary' },
  { value: 'listo_para_entrega', label: 'Listo para Entrega', variant: 'default' },
  { value: 'entregado', label: 'Entregado', variant: 'default' },
]

export function StatusSelector({ packageId, currentStatus }: { packageId: string, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [isLoading, setIsLoading] = useState(false)

  const handleUpdate = async (newStatus: string) => {
    if (newStatus === status) return
    
    setIsLoading(true)
    try {
      const result = await updatePackageStatus(packageId, newStatus)
      if (result.success) {
        setStatus(newStatus)
        toast.success('Estado actualizado')
      } else {
        toast.error('Error', { description: result.error })
      }
    } catch (err) {
      toast.error('Error de red')
    } finally {
      setIsLoading(false)
    }
  }

  const current = statuses.find(s => s.value === status) || { label: status, variant: 'outline' }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" className="h-8 gap-1 px-2" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                <Badge variant={current.variant as any}>{current.label}</Badge>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {statuses.map((s) => (
          <DropdownMenuItem 
            key={s.value} 
            onClick={() => handleUpdate(s.value)}
            disabled={s.value === status}
            className="flex items-center gap-2"
          >
            <Badge variant={s.variant as any} className="pointer-events-none">
              {s.label}
            </Badge>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
