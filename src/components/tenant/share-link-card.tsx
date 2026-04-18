'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Check, Copy, Globe, Link2, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { getRootDomain, getTenantSubdomainUrl, getTenantPathUrl } from '@/lib/utils/host'

interface ShareLinkCardProps {
  subdomain: string
}

export function ShareLinkCard({ subdomain }: ShareLinkCardProps) {
  const [host, setHost] = useState('')
  const [copiedSubdomain, setCopiedSubdomain] = useState(false)
  const [copiedPath, setCopiedPath] = useState(false)

  useEffect(() => {
    setHost(window.location.host)
  }, [])

  const rootDomain = getRootDomain(host)
  const subdomainUrl = `${getTenantSubdomainUrl(subdomain, rootDomain, host)}/registro`
  const pathUrl = `${getTenantPathUrl(subdomain, rootDomain, host)}/registro`

  const copyToClipboard = async (text: string, type: 'subdomain' | 'path') => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Enlace copiado al portapapeles')
      if (type === 'subdomain') {
        setCopiedSubdomain(true)
        setTimeout(() => setCopiedSubdomain(false), 2000)
      } else {
        setCopiedPath(true)
        setTimeout(() => setCopiedPath(false), 2000)
      }
    } catch (err) {
      toast.error('No se pudo copiar el enlace')
    }
  }

  return (
    <Card className="border-none shadow-xl bg-gradient-to-br from-primary/10 via-background to-secondary/5 overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Share2 className="h-32 w-32" />
      </div>
      <CardHeader className="relative z-10">
        <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Link2 className="h-6 w-6" />
            </div>
            <div>
                <CardTitle className="text-xl font-bold italic tracking-tight">Tu Portal de Clientes</CardTitle>
                <CardDescription>Comparte este enlace con tus clientes para que se registren en tu casillero.</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="relative z-10 space-y-6">
          {/* Opción 1: Ruta Directa (Preferida) */}
          <div className="space-y-3 p-4 rounded-2xl bg-background/60 backdrop-blur-sm border border-primary/10 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                <Link2 className="h-3 w-3" />
                Enlace Directo (Recomendado)
              </span>
              <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded italic">Mejor Compatibilidad</span>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                value={pathUrl} 
                readOnly 
                className="font-mono text-xs bg-muted/30 border-none h-9 focus-visible:ring-1"
              />
              <Button 
                size="icon" 
                variant="outline" 
                className="h-9 w-9 shrink-0 border-primary/20 hover:bg-primary/5 hover:text-primary"
                onClick={() => copyToClipboard(pathUrl, 'path')}
              >
                {copiedPath ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Opción 2: Subdominio */}
          <div className="space-y-3 p-4 rounded-2xl bg-background/60 backdrop-blur-sm border border-muted/20 shadow-sm transition-all hover:shadow-md">
             <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
                <Globe className="h-3 w-3" />
                Vía Subdominio
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                value={subdomainUrl} 
                readOnly 
                className="font-mono text-xs bg-muted/30 border-none h-9 focus-visible:ring-1 opacity-70"
              />
              <Button 
                size="icon" 
                variant="outline" 
                className="h-9 w-9 shrink-0 border-muted/20 hover:bg-muted/5 hover:text-muted-foreground"
                onClick={() => copyToClipboard(subdomainUrl, 'subdomain')}
              >
                {copiedSubdomain ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
        
        <p className="text-[10px] text-muted-foreground mt-4 text-center italic opacity-70">
            * El enlace de subdominio requiere configuración de DNS para dominios personalizados.
        </p>
      </CardContent>
    </Card>
  )
}
