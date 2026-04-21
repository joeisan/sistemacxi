'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Package, ExternalLink, History, Plus, Trash2, Info } from 'lucide-react'
import { AddPackageDialog } from './add-package-dialog'
import Script from 'next/script'
import Link from 'next/link'

interface TrackingSearchClientProps {
  tenantId: string
  clientId?: string
  tenantSlug: string
}

interface HistoricalSearch {
  tracking: string
  timestamp: number
}

declare global {
  interface Window {
    YQ399?: {
      ExternalTrack: (payload: { L: string; Num: string }) => void
    }
  }
}

export function TrackingSearchClient({ tenantId, clientId, tenantSlug }: TrackingSearchClientProps) {
  const [trackingNumber, setTrackingNumber] = useState('')
  const [history, setHistory] = useState<HistoricalSearch[]>(() => {
    if (typeof window === 'undefined') {
      return []
    }

    const saved = localStorage.getItem('tracking_history')
    if (!saved) {
      return []
    }

    try {
      return JSON.parse(saved) as HistoricalSearch[]
    } catch (e) {
      console.error('Error parsing history', e)
      return []
    }
  })

  const saveToHistory = (num: string) => {
    const newHistory = [
      { tracking: num, timestamp: Date.now() },
      ...history.filter(h => h.tracking !== num) // Evitar duplicados
    ].slice(0, 5) // Mantener solo los últimos 5

    setHistory(newHistory)
    localStorage.setItem('tracking_history', JSON.stringify(newHistory))
  }

  const handleTrack = (num: string) => {
    if (!num) return
    saveToHistory(num)
    
    if (window.YQ399) {
      window.YQ399.ExternalTrack({
        L: "es",
        Num: num
      })
    } else {
      // Fallback if script is not loaded
      window.open(`https://www.17track.net/en/track-details?nums=${num}`, '_blank')
    }
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem('tracking_history')
  }

  const removeHistoryItem = (num: string) => {
    const newHistory = history.filter(h => h.tracking !== num)
    setHistory(newHistory)
    localStorage.setItem('tracking_history', JSON.stringify(newHistory))
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <Script src="//www.17track.net/externalcall.js" strategy="lazyOnload" />

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Rastrear Envíos</h1>
        <p className="text-muted-foreground text-sm">Ingresa el tracking de tu compra para ver su estado actual.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5 shadow-sm overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-primary">
                <Search className="h-5 w-5" />
                Buscador 17TRACK
              </CardTitle>
              <CardDescription>
                Compatible con más de 900 transportadoras (Amazon, USPS, UPS, FedEx, etc.)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form 
                onSubmit={(e) => { e.preventDefault(); handleTrack(trackingNumber); }} 
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                    <Input 
                        id="YQNum"
                        placeholder="Ingresa tu número de tracking..." 
                        className="h-12 bg-background font-mono text-base pl-4 border-primary/20 focus-visible:ring-primary shadow-inner"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                </div>
                <Button type="submit" size="lg" className="h-12 px-8 font-bold animate-in fade-in zoom-in duration-300">
                  RASTREAR <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </form>
              <div className="flex items-start gap-2 mt-4 text-[11px] text-muted-foreground bg-background/50 p-2 rounded-lg border border-primary/5">
                <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                <p>
                  Utilizamos la API oficial de 17TRACK para brindarte información precisa. 
                  Una vez rastreado, el número se guardará en tu historial personal para pre-alertarlo rápidamente.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Historial de Rastreo */}
          {history.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <History className="h-5 w-5 text-muted-foreground" />
                  Búsquedas Recientes
                </h2>
                <Button variant="ghost" size="xs" onClick={clearHistory} className="text-muted-foreground hover:text-destructive">
                  Limpiar historial
                </Button>
              </div>
              
              <div className="grid gap-3">
                {history.map((item) => (
                  <Card key={item.tracking} className="hover:border-primary/50 transition-all hover:bg-muted/30 group">
                    <CardContent className="p-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            <Package className="h-4 w-4 shrink-0" />
                        </div>
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="font-mono text-sm truncate font-bold">{item.tracking}</span>
                            <span className="text-[10px] text-muted-foreground">Último rastreo: {new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {clientId && (
                          <AddPackageDialog 
                              tenantId={tenantId} 
                              clientId={clientId} 
                              initialTracking={item.tracking}
                              trigger={
                                  <Button variant="outline" size="sm" className="gap-1.5 h-8 font-bold text-xs bg-background hover:bg-primary hover:text-primary-foreground transition-all">
                                      <Plus className="h-3 w-3" />
                                      PRE-ALERTAR
                                  </Button>
                              }
                          />
                        )}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeHistoryItem(item.tracking)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground">
                <Package className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm font-medium">No tienes búsquedas recientes</p>
                <p className="text-xs">Tus últimos 5 rastreos aparecerán aquí para facilitarte la pre-alerta.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
            <Card className="shadow-sm border-primary/10">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Info className="h-4 w-4 text-primary" />
                        Guía Rápida
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-4">
                    <div className="space-y-2">
                        <p className="font-bold text-foreground">1. Localiza tu ID</p>
                        <p>Busca en tu correo el número de tracking enviado por la tienda.</p>
                    </div>
                    <div className="space-y-2">
                        <p className="font-bold text-foreground">2. Verifica Entrega</p>
                        <p>Usa nuestro buscador para confirmar si ya llegó a Miami.</p>
                    </div>
                    <div className="space-y-2">
                        <p className="font-bold text-foreground">3. Pre-alerta</p>
                        <p>Usa el botón &quot;Pre-alertar&quot; para informarnos de tu paquete antes de que llegue.</p>
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-sm border-primary/10 dark:bg-zinc-900/50">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold">Mis Paquetes</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-4">
                   <p>Revisa el estado de tus paquetes que ya han sido procesados en bodega.</p>
                   <Button variant="secondary" className="w-full text-xs font-bold" asChild>
                      <Link href={`/${tenantSlug}/dashboard/paquetes`}>Ver Listado Completo</Link>
                   </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
