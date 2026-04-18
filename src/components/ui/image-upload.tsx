"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, X } from "lucide-react"
import { toast } from "sonner"

interface ImageUploadProps {
  bucket: string
  path: string
  onUpload: (url: string) => void
  currentUrl?: string
  label?: string
}

export function ImageUpload({ bucket, path, onUpload, currentUrl, label }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState(currentUrl)
  const supabase = createClient()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validaciones básicas
    if (!file.type.startsWith('image/')) {
      toast.error('Formato inválido', { description: 'Por favor sube una imagen.' })
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Archivo muy grande', { description: 'Máximo 2MB.' })
      return
    }

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${path}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError, data } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      setPreview(publicUrl)
      onUpload(publicUrl)
      toast.success('Imagen subida correctamente.')
    } catch (error: any) {
      toast.error('Error al subir', { description: error.message })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {label && <label className="text-sm font-bold block">{label}</label>}
      
      <div className="flex items-center gap-6 p-4 border-2 border-dashed rounded-xl bg-muted/30">
        <div className="relative w-24 h-24 rounded-lg overflow-hidden border bg-background shrink-0 flex items-center justify-center">
          {preview ? (
            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
          ) : (
            <Upload className="w-8 h-8 text-muted-foreground/40" />
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Recomendado: Cuadrado, máximo 2MB.<br />
            Formatos: JPG, PNG o WEBP.
          </p>
          <div className="flex items-center gap-2">
            <Button 
                variant="outline" 
                size="sm" 
                className="relative cursor-pointer" 
                disabled={isUploading}
                asChild
            >
              <label className="cursor-pointer">
                 {preview ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                 <input 
                   type="file" 
                   className="hidden" 
                   accept="image/*" 
                   onChange={handleUpload}
                   disabled={isUploading}
                 />
              </label>
            </Button>
            {preview && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-destructive h-8" 
                onClick={() => { setPreview(''); onUpload(''); }}
                disabled={isUploading}
              >
                <X className="w-4 h-4 mr-1" /> Quitar
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
