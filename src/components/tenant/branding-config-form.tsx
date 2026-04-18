"use client"

import { useState } from "react"
import { ImageUpload } from "@/components/ui/image-upload"
import { Button } from "@/components/ui/button"
import { updateBranding } from "@/app/actions/tenant/update-branding"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

interface BrandingConfigFormProps {
  tenantId: string
  tenantSubdomain: string
  adminId: string
  currentLogoUrl?: string
  currentAvatarUrl?: string
}

export function BrandingConfigForm({
  tenantId,
  tenantSubdomain,
  adminId,
  currentLogoUrl,
  currentAvatarUrl
}: BrandingConfigFormProps) {
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl || "")
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl || "")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const result = await updateBranding({
        tenantId,
        adminId,
        logoUrl,
        avatarUrl,
        tenantSubdomain
      })

      if (result.success) {
        toast.success("Marca actualizada exitosamente.")
      } else {
        toast.error("Error al guardar", { description: result.error })
      }
    } catch (error) {
      toast.error("Error de conexión.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-2 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Logo de la Empresa
          </CardTitle>
          <CardDescription>
            Este imagen aparecerá en la barra de navegación y en la página de login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload 
            bucket="branding"
            path={`logo-${tenantId}`}
            onUpload={setLogoUrl}
            currentUrl={logoUrl}
          />
        </CardContent>
      </Card>

      <Card className="border-2 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Foto de Perfil del Administrador
          </CardTitle>
          <CardDescription>
            Tus clientes verán esta foto al iniciar sesión, humanizando tu servicio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload 
            bucket="branding"
            path={`avatar-${adminId}`}
            onUpload={setAvatarUrl}
            currentUrl={avatarUrl}
          />
        </CardContent>
      </Card>

      <div className="md:col-span-2 flex justify-end">
        <Button 
          size="lg" 
          onClick={handleSave} 
          disabled={isSaving}
          className="h-14 px-8 font-black text-lg gap-2 shadow-primary/20 shadow-xl"
        >
          {isSaving ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5" />
              Guardar Configuración de Marca
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
