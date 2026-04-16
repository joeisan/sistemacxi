'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Bell, Globe, Send, MessageSquareText } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { sendTenantAlert } from '@/app/actions/super-admin/manage-tenant'
import { toast } from 'sonner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Info, TriangleAlert } from 'lucide-react'

interface SendAlertButtonProps {
  tenantId: string
  tenantName: string
}

const PREDEFINED_MESSAGES = [
  "Mantenimiento programado hoy a las 11:00 PM. El servicio estará fuera de línea durante 30 minutos.",
  "Tu plan de suscripción está por vencer. Por favor regulariza tu pago para evitar la suspensión del servicio.",
  "Nueva funcionalidad de reportes disponible en tu tablero. ¡Pruébala ahora!",
  "Se ha detectado una interrupción técnica en el sistema de rastreo. Estamos trabajando en ello.",
  "Recordatorio: Por favor revisa y actualiza la información de tu casillero en Configuración."
]

export function SendAlertButton({ tenantId, tenantName }: SendAlertButtonProps) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [type, setType] = useState('info')
  const [isGlobal, setIsGlobal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) return
    setIsLoading(true)
    try {
      const targetId = isGlobal ? 'all' : tenantId
      const result = await sendTenantAlert(targetId, message, type)
      if (result.success) {
        toast.success(isGlobal ? 'Alertas enviadas a todos los tenants' : 'Alerta enviada correctamente')
        setMessage('')
        setOpen(false)
      } else {
        toast.error('Error al enviar alerta')
      }
    } catch (error) {
      toast.error('Error de servidor')
    } finally {
      setIsLoading(false)
    }
  }

  const PreviewIcon = type === 'error' ? AlertCircle : type === 'warning' ? TriangleAlert : Info

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline" size="sm" className="h-8">
            <Bell className="h-3.5 w-3.5 mr-1" />
            Alerta
          </Button>
        }
      />
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" />
            Enviar Comunicación
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
                <MessageSquareText className="h-3.5 w-3.5" />
                Mensaje
              </Label>
              <Input 
                placeholder="Escribe el mensaje..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="h-11"
              />
              
              <div className="pt-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground mb-1 block">Sugeridos</Label>
                <div className="flex flex-wrap gap-1.5">
                  {PREDEFINED_MESSAGES.map((msg, i) => (
                    <button 
                      key={i}
                      type="button"
                      onClick={() => setMessage(msg)}
                      className="text-[10px] text-left px-2 py-1 rounded bg-muted hover:bg-primary/10 hover:text-primary transition-colors max-w-full truncate border border-transparent hover:border-primary/20"
                    >
                      {msg.substring(0, 30)}...
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-muted-foreground">Importancia</Label>
              <div className="flex gap-2">
                {['info', 'warning', 'error'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`flex-1 py-2 px-3 text-xs rounded-lg border transition-all ${
                      type === t 
                        ? (t === 'error' ? 'bg-destructive/10 border-destructive text-destructive font-bold' : 
                           t === 'warning' ? 'bg-amber-500/10 border-amber-500 text-amber-600 font-bold' : 
                           'bg-primary/10 border-primary text-primary font-bold')
                        : 'bg-background border-input text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {t === 'info' ? 'Informativo' : t === 'warning' ? 'Advertencia' : 'Crítico'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2 p-3 rounded-lg border bg-muted/30">
              <Checkbox 
                id="global" 
                checked={isGlobal} 
                onCheckedChange={(checked) => setIsGlobal(checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <label htmlFor="global" className="text-sm font-bold cursor-pointer flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-blue-500" />
                  Enviar a TODAS las empresas
                </label>
                <p className="text-[10px] text-muted-foreground">
                  Esta alerta aparecerá en el dashboard de cada administrador registrado.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-sm font-bold text-muted-foreground">Vista Previa (En el Dashboard)</Label>
            <div className="p-4 rounded-xl border border-dashed border-muted-foreground/30 bg-muted/10 h-full flex flex-col justify-start">
              {message ? (
                <Alert 
                  variant={type === 'error' ? 'destructive' : 'default'} 
                  className={`border-l-4 shadow-sm ${type === 'warning' ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20' : ''}`}
                >
                  <PreviewIcon className="h-4 w-4" />
                  <AlertTitle className="font-bold text-xs">Comunicado de Administración</AlertTitle>
                  <AlertDescription className="text-xs mt-1 leading-relaxed">
                    {message}
                  </AlertDescription>
                  <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5 text-[9px] opacity-60">
                    Vence el: 12/12/2026 (Faltan 4 días)
                  </div>
                </Alert>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40">
                  <MessageSquareText className="h-8 w-8 mb-2" />
                  <p className="text-xs">Escribe algo para ver la vista previa</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSend} disabled={isLoading || !message.trim()} className="min-w-[120px]">
            {isLoading ? 'Enviando...' : (isGlobal ? 'Enviar a Todos' : 'Enviar a Empresa')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Section({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-bold text-muted-foreground">{children}</div>
}
