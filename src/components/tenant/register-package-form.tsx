'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { registerPackage } from '@/app/actions/admin/register-package'
import { Search, Check, ChevronDown, Truck } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Client {
  id: string
  client_code: string
  full_name: string
}

interface Courier {
  id: string
  name: string
}

export function RegisterPackageForm({ tenantId, clients, couriers = [] }: { tenantId: string, clients: Client[], couriers?: Courier[] }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  
  const [formData, setFormData] = useState({
    trackingNumber: '',
    courierName: '',
    description: '',
    weightLb: ''
  })

  const filteredClients = clients.filter(c => 
    c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.client_code.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5)

  // Default couriers if none configured
  const defaultCouriers: Courier[] = [
    { id: 'amazon', name: 'Amazon' },
    { id: 'ups', name: 'UPS' },
    { id: 'fedex', name: 'FedEx' },
    { id: 'dhl', name: 'DHL' },
    { id: 'usps', name: 'USPS' },
  ]

  const availableCouriers = couriers.length > 0 ? couriers : defaultCouriers

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient) {
      toast.error('Por favor selecciona un cliente')
      return
    }

    if (!formData.courierName) {
      toast.error('Por favor selecciona un courier')
      return
    }

    setIsLoading(true)
    try {
      const result = await registerPackage({
        tenantId,
        clientId: selectedClient.id,
        trackingNumber: formData.trackingNumber,
        courierName: formData.courierName,
        description: formData.description,
        weightLb: formData.weightLb ? parseFloat(formData.weightLb) : undefined
      })

      if (result.success) {
        toast.success('¡Paquete registrado con éxito!')
        router.push('/admin/paquetes')
      } else {
        toast.error('Error', { description: result.error })
      }
    } catch (error) {
      toast.error('Error de servidor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4 rounded-lg border p-4 bg-muted/30">
        <Label>Seleccionar Cliente</Label>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o código..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value)
                if (selectedClient) setSelectedClient(null)
            }}
          />
        </div>
        
        {searchTerm && !selectedClient && (
          <div className="mt-2 divide-y rounded-md border bg-background shadow-sm">
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  className="w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors flex justify-between items-center"
                  onClick={() => {
                    setSelectedClient(client)
                    setSearchTerm(`${client.full_name} (${client.client_code})`)
                  }}
                >
                  <div>
                    <span className="font-bold text-primary mr-2">{client.client_code}</span>
                    <span>{client.full_name}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-2 text-sm text-muted-foreground text-center">No se encontraron clientes</div>
            )}
          </div>
        )}

        {selectedClient && (
          <div className="flex items-center gap-2 p-2 rounded bg-primary/10 border border-primary/20 text-primary animate-in fade-in zoom-in duration-200">
            <Check className="h-4 w-4" />
            <span className="text-sm font-bold">Cliente Seleccionado: {selectedClient.full_name} ({selectedClient.client_code})</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tracking">Número de Tracking</Label>
          <Input
            id="tracking"
            placeholder="Ej: 1Z99..."
            required
            value={formData.trackingNumber}
            onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="courier">Courier / Transportadora</Label>
          <Select 
            value={formData.courierName} 
            onValueChange={(v) => v && setFormData({ ...formData, courierName: v })}
          >
            <SelectTrigger id="courier">
              <SelectValue placeholder="Seleccionar courier" />
            </SelectTrigger>
            <SelectContent>
              {availableCouriers.map((courier) => (
                <SelectItem key={courier.id} value={courier.name}>
                  <div className="flex items-center gap-2">
                    <Truck className="h-3 w-3 text-muted-foreground" />
                    {courier.name}
                  </div>
                </SelectItem>
              ))}
              <SelectItem value="__other__">
                Otro (escribir manualmente)
              </SelectItem>
            </SelectContent>
          </Select>
          {formData.courierName === '__other__' && (
            <Input
              placeholder="Nombre del courier..."
              className="mt-2"
              onChange={(e) => setFormData({ ...formData, courierName: e.target.value })}
            />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">Peso (Libras)</Label>
          <Input
            id="weight"
            type="number"
            step="0.1"
            placeholder="0.0"
            value={formData.weightLb}
            onChange={(e) => setFormData({ ...formData, weightLb: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descripción (Contenido)</Label>
          <Input
            id="description"
            placeholder="Ej: Ropa, Electrónica..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button 
            type="button" 
            variant="outline" 
            className="flex-1"
            onClick={() => router.back()}
        >
            Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={isLoading || !selectedClient}>
          {isLoading ? 'Registrando...' : 'Registrar Paquete'}
        </Button>
      </div>
    </form>
  )
}
