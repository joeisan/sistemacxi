"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Loader2, AlertCircle } from "lucide-react"
import { createClientByAdmin } from "@/app/actions/tenant/create-client"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CreateClientDialogProps {
  tenantId: string
  availablePlans: { id: string, name: string }[]
}

export function CreateClientDialog({ tenantId, availablePlans }: CreateClientDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      password: formData.get('password') as string,
      planId: formData.get('planId') as string || undefined,
      tenantId
    }

    try {
      const result = await createClientByAdmin(data)

      if (result.success) {
        toast.success(`Cliente creado con éxito. Código: ${result.clientCode}`)
        setOpen(false)
        router.refresh()
      } else {
        setError(result.error || "Ocurrió un error inesperado")
      }
    } catch (err: any) {
      setError(err.message || "Error al crear el cliente")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger 
        render={
          <Button className="font-bold">
            <UserPlus className="mr-2 h-4 w-4" />
            Nuevo Cliente
          </Button>
        } 
      />
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
            <DialogDescription>
              Crea una cuenta para un nuevo cliente. Se le asignará un código de casillero automáticamente.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {error && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input id="firstName" name="firstName" placeholder="Ej: Juan" required disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input id="lastName" name="lastName" placeholder="Ej: Perez" required disabled={loading} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" name="email" type="email" placeholder="juan.perez@ejemplo.com" required disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono / WhatsApp</Label>
              <Input id="phone" name="phone" placeholder="+507 6000-0000" required disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña Inicial</Label>
              <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" required disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="planId">Plan de Precios</Label>
              <Select name="planId">
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un plan" />
                </SelectTrigger>
                <SelectContent>
                  {availablePlans.map((plan) => (
                    <SelectItem key={plan.id} value={plan.id}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : "Registrar Cliente"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
