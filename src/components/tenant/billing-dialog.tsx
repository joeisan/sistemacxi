'use client'

import { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { DollarSign, Calculator, Receipt, CreditCard } from 'lucide-react'
import { updatePackageBilling, registerPayment } from '@/app/actions/admin/update-package-billing'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

interface PackageData {
  id: string
  tenant_id: string
  client_id: string
  tracking_number: string
  weight_lb: number | null
  shipping_cost: number
  extra_cost: number
  total_amount: number
  payment_status: string
}

interface ClientPlan {
  cost_per_lb: number
  delivery_fee: number
}

export function BillingDialog({ packageData, clientPlan }: { packageData: PackageData, clientPlan?: ClientPlan }) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPaying, setIsPaying] = useState(false)
  
  const [formData, setFormData] = useState({
    weightLb: packageData.weight_lb || 0,
    shippingCost: packageData.shipping_cost || 0,
    extraCost: packageData.extra_cost || 0,
    totalAmount: packageData.total_amount || 0,
    paymentStatus: packageData.payment_status || 'pending'
  })

  const [paymentMethod, setPaymentMethod] = useState('efectivo')

  // Auto-calculate on weight/plan change
  useEffect(() => {
    if (clientPlan && formData.weightLb > 0) {
      const shipCost = formData.weightLb * clientPlan.cost_per_lb
      const delivFee = clientPlan.delivery_fee
      setFormData(prev => ({
        ...prev,
        shippingCost: Number(shipCost.toFixed(2)),
        extraCost: Number(delivFee.toFixed(2)),
        totalAmount: Number((shipCost + delivFee).toFixed(2))
      }))
    }
  }, [formData.weightLb, clientPlan])

  const handleSaveBilling = async () => {
    setIsLoading(true)
    try {
      const result = await updatePackageBilling({
        packageId: packageData.id,
        weightLb: Number(formData.weightLb),
        shippingCost: Number(formData.shippingCost),
        extraCost: Number(formData.extraCost),
        totalAmount: Number(formData.totalAmount),
        paymentStatus: formData.paymentStatus
      })

      if (result.success) {
        toast.success('Información de cobro guardada')
        setOpen(false)
      } else {
        toast.error('Error al guardar', { description: result.error })
      }
    } catch (error) {
      toast.error('Error de red')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegisterPayment = async () => {
    setIsLoading(true)
    try {
        const result = await registerPayment({
            tenantId: packageData.tenant_id,
            clientId: packageData.client_id,
            packageId: packageData.id,
            amount: formData.totalAmount,
            method: paymentMethod,
            notes: 'Pago completo de paquete'
        })

        if (result.success) {
            toast.success('Pago registrado correctamente')
            setOpen(false)
            setIsPaying(false)
        } else {
            toast.error('Error al registrar pago', { description: result.error })
        }
    } catch (error) {
        toast.error('Error de red')
    } finally {
        setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="h-8 gap-1 border-primary/20 hover:bg-primary/5">
            <Receipt className="h-4 w-4" />
            <span>Cobro</span>
            {packageData.payment_status === 'paid' && (
                <Badge variant="default" className="ml-1 scale-75 bg-green-500 hover:bg-green-600">PAGADO</Badge>
            )}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Gestión de Cobro
          </DialogTitle>
          <DialogDescription>
            Configura el precio del paquete {packageData.tracking_number} y registra el pago.
          </DialogDescription>
        </DialogHeader>

        {!isPaying ? (
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Peso (libras)</Label>
                <div className="relative">
                    <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        value={formData.weightLb}
                        onChange={(e) => setFormData({ ...formData, weightLb: Number(e.target.value) })}
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-mono">LB</span>
                </div>
                <p className="text-[10px] text-muted-foreground">Costo: ${clientPlan?.cost_per_lb || 0}/lb</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="delivery">Delivery / Extras</Label>
                <div className="relative">
                    <Input
                        id="delivery"
                        type="number"
                        step="0.01"
                        value={formData.extraCost}
                        onChange={(e) => setFormData({ ...formData, extraCost: Number(e.target.value) })}
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">$</span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-3">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                        <Calculator className="h-3.5 w-3.5" />
                        Envío por Peso
                    </span>
                    <span className="font-mono">${formData.shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-primary/10 pb-2">
                    <span className="text-muted-foreground">Gastos Extras</span>
                    <span className="font-mono">${formData.extraCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                    <span className="font-bold">Total a Cobrar</span>
                    <span className="text-xl font-bold text-primary font-mono">${formData.totalAmount.toFixed(2)}</span>
                </div>
            </div>

            <div className="space-y-2">
                <Label>Total Manual (opcional)</Label>
                <Input 
                    type="number" 
                    placeholder="Sobrescribir total..." 
                    onChange={(e) => setFormData({...formData, totalAmount: Number(e.target.value)})}
                />
            </div>
          </div>
        ) : (
          <div className="grid gap-6 py-4">
            <div className="bg-green-500/5 border border-green-500/20 p-6 rounded-2xl text-center space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Pago por el Paquete</h3>
                <div className="text-4xl font-black text-green-600 font-mono">${formData.totalAmount.toFixed(2)}</div>
            </div>

            <div className="space-y-3">
                <Label>Método de Pago</Label>
                <Select value={paymentMethod} onValueChange={(val) => val && setPaymentMethod(val)}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="efectivo">Efectivo 💵</SelectItem>
                        <SelectItem value="transferencia">Transferencia 🏦</SelectItem>
                        <SelectItem value="tarjeta">Tarjeta 💳</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-row justify-between items-center sm:justify-between border-t pt-4">
          {!isPaying ? (
            <>
                <Button variant="ghost" type="button" onClick={() => setOpen(false)} disabled={isLoading}>
                    Cerrar
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" type="button" onClick={handleSaveBilling} disabled={isLoading}>
                        Guardar Cálculos
                    </Button>
                    <Button 
                        type="button" 
                        className="bg-green-600 hover:bg-green-700" 
                        onClick={() => setIsPaying(true)}
                        disabled={isLoading || formData.totalAmount <= 0}
                    >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Cobrar Ahora
                    </Button>
                </div>
            </>
          ) : (
            <>
                <Button variant="ghost" type="button" onClick={() => setIsPaying(false)} disabled={isLoading}>
                    Atrás
                </Button>
                <Button 
                    type="button" 
                    className="bg-green-600 hover:bg-green-700 w-full ml-4" 
                    onClick={handleRegisterPayment}
                    disabled={isLoading}
                >
                    Confirmar Pago de ${formData.totalAmount.toFixed(2)}
                </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
