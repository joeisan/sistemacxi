import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bell, Info, Package, AlertCircle } from 'lucide-react'

export default function AdminNotificationsPage() {
  const notifications: any[] = [] // Empty for now

  return (
    <div className="flex flex-col gap-6 ">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Notificaciones de Empresa</h1>
        <p className="text-muted-foreground">Alertas de registro de clientes y estados de paquetes.</p>
      </div>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif: any) => (
            <Card key={notif.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex gap-4 items-start">
                 <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-primary" />
                 </div>
                 <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">Nuevo Cliente Registrado</p>
                    <p className="text-xs text-muted-foreground">Juan Perez se ha unido a tu casillero.</p>
                    <p className="text-[10px] text-muted-foreground pt-1 italic">Hace 5 minutos</p>
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
                <CardTitle className="text-lg">No hay avisos hoy</CardTitle>
                <CardDescription>Aquí aparecerán los eventos importantes de tu operación.</CardDescription>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
