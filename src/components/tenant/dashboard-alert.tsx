'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Bell, Info, TriangleAlert, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardAlertProps {
  id: string
  message: string
  type: string
  planExpiryDate?: string | null
}

import { createClient } from '@/lib/supabase/client'

interface DashboardAlertProps {
  id: string
  message: string
  type: string
  planExpiryDate?: string | null
  tenantId?: string
}

export function DashboardAlert({ id, message: initialMessage, type, planExpiryDate, tenantId }: DashboardAlertProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [message, setMessage] = useState(initialMessage)
  const supabase = createClient()

  useEffect(() => {
    setIsMounted(true)
    const storageKey = `alert-dismissed-${id}`
    const lastDismissed = localStorage.getItem(storageKey)
    
    if (lastDismissed) {
      const lastDate = new Date(lastDismissed)
      const now = new Date()
      if (lastDate.toDateString() === now.toDateString()) {
        setIsVisible(false)
        return
      }
    }
    setIsVisible(true)

    // Real-time subscription for new alerts if tenantId is provided
    if (tenantId) {
      const channel = supabase
        .channel('realtime_alerts')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'tenant_alerts',
            filter: `tenant_id=eq.${tenantId}`
          },
          (payload) => {
            console.log('Realtime alert received:', payload)
            setMessage(payload.new.message)
            setIsVisible(true)
            // Optional: reset dismissal for new messages
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [id, tenantId])

  const handleDismiss = () => {
    const storageKey = `alert-dismissed-${id}`
    localStorage.setItem(storageKey, new Date().toISOString())
    setIsVisible(false)
  }

  if (!isMounted || !isVisible) return null

  const Icon = type === 'error' ? AlertCircle : type === 'warning' ? TriangleAlert : Info

  // Calcular días restantes si hay fecha de vencimiento
  let expiryInfo = ''
  if (planExpiryDate) {
    const expiry = new Date(planExpiryDate)
    const now = new Date()
    const diff = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    expiryInfo = `Vence el: ${expiry.toLocaleDateString()} (Faltan ${diff} días)`
  }

  const getAlertStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-destructive/85 backdrop-blur-md text-white border-none'
      case 'warning':
        return 'bg-amber-600/85 backdrop-blur-md text-white border-none'
      default:
        return 'bg-primary/85 backdrop-blur-md text-white border-none'
    }
  }

  return (
    <Alert 
      className={`relative shadow-lg border-none animate-in fade-in slide-in-from-top-4 duration-500 scale-100 ring-1 ring-white/20 ${getAlertStyles()}`}
    >
      <Icon className="h-4 w-4 text-white" />
      <AlertTitle className="font-black flex items-center justify-between pr-8 uppercase tracking-wider text-[10px]">
        Comunicado de Administración
      </AlertTitle>
      <AlertDescription className="mt-1 leading-relaxed font-bold">
        {message}
        {expiryInfo && (
          <div className="mt-2 pt-2 border-t border-white/20 text-[10px] opacity-90 font-medium">
            {expiryInfo}
          </div>
        )}
      </AlertDescription>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 hover:bg-white/20 text-white transition-opacity"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Cerrar</span>
      </Button>
    </Alert>
  )
}
