import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, Info, Package, AlertCircle } from 'lucide-react'

export default function NotificationsPage() {
  const notifications: any[] = [] // Empty for now

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>
        <p className="text-muted-foreground">Mantente al tanto de la actividad de tu casillero.</p>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif: any) => (
            <Card key={notif.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex gap-4 items-start">
                 <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                 </div>
                 <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Paquete Recibido</p>
                    <p className="text-xs text-muted-foreground">Tu paquete con tracking 1Z99... ha sido procesado exitosamente.</p>
                    <p className="text-[10px] text-muted-foreground pt-1 italic">Hace 2 horas</p>
                 </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-12 flex flex-col items-center justify-center gap-4 text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <Bell className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-lg">Sin notificaciones</CardTitle>
                <CardDescription>Te avisaremos cuando recibamos un paquete o haya cambios en tus envíos.</CardDescription>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
