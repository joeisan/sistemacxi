'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Package, Eye } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ClientPackagesList } from './client-packages-list'

interface ClientPackagesColumnProps {
  total: number
  active: number
  clientId: string
}

export function ClientPackagesColumn({ total, active, clientId }: ClientPackagesColumnProps) {
  const [open, setOpen] = useState(false)
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button 
            className="flex items-center justify-center gap-1.5 mx-auto cursor-pointer hover:opacity-80 transition-opacity group"
            title="Ver detalles de paquetes"
          >
            <span className="font-mono text-xs font-bold">{total}</span>
            {active > 0 && (
              <Badge className="rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] px-1.5 py-0 h-5 font-bold animate-pulse">
                +{active}
              </Badge>
            )}
            <Eye className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        }
      />
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Paquetes del Cliente
          </DialogTitle>
          <DialogDescription>
            {total} paquetes totales · {active} activos
          </DialogDescription>
        </DialogHeader>
        <ClientPackagesList clientId={clientId} onClose={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}
