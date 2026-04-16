import { CreateTenantForm } from '@/components/super-admin/create-tenant-form'

export default function VentaNuevoTenantPage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Nueva Empresa (Tenant)</h1>
        <p className="text-muted-foreground">Da de alta a un operador logístico, su configuración y la cuenta principal de su administrador.</p>
      </div>

      <div className="border rounded-xl p-6 bg-card shadow-sm">
        <CreateTenantForm />
      </div>
    </div>
  )
}
