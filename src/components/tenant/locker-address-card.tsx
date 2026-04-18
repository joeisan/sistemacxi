'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyButton } from '@/components/ui/copy-button'
import { MapPin, Phone, Hash, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface AddressHub {
  label: string
  address_line_1: string
  city_state_zip: string
  country: string
  phone: string
}

interface LockerAddressCardProps {
  hubs: AddressHub[]
  clientCode: string
  enterpriseName: string
}

export function LockerAddressCard({ hubs, clientCode, enterpriseName }: LockerAddressCardProps) {
  
  const copyFullAddress = (hub: AddressHub) => {
    const full = `${clientCode}\n${hub.address_line_1}\n${hub.city_state_zip}\n${hub.country}\nTel: ${hub.phone}`
    navigator.clipboard.writeText(full)
    toast.success('Dirección completa copiada')
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {hubs.map((hub, index) => (
        <Card key={index} className="overflow-hidden border-primary/20 bg-primary/5 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-primary/10 px-4 py-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <MapPin className="h-3 w-3 text-primary" />
              {hub.label}
            </CardTitle>
            <Button 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-xs font-semibold gap-1 text-primary"
                onClick={() => copyFullAddress(hub)}
            >
              <Copy className="h-3 w-3" />
              Copia Todo
            </Button>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-2 rounded-md bg-background/50 p-2 border border-primary/10">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Tu Identificador</span>
                <span className="text-sm font-mono font-bold text-primary">{clientCode}</span>
              </div>
              <CopyButton value={clientCode} />
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-start group">
                <span className="text-muted-foreground">Dirección:</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-right max-w-[150px]">{hub.address_line_1}</span>
                  <CopyButton value={hub.address_line_1} />
                </div>
              </div>
              <div className="flex justify-between items-start group">
                <span className="text-muted-foreground">Ciudad/Zip:</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-right">{hub.city_state_zip}</span>
                  <CopyButton value={hub.city_state_zip} />
                </div>
              </div>
              <div className="flex justify-between items-start group">
                <span className="text-muted-foreground">Teléfono:</span>
                <div className="flex items-center gap-1">
                  <span className="font-medium text-right">{hub.phone}</span>
                  <CopyButton value={hub.phone} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
