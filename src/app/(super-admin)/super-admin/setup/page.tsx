import { createClient } from '@/lib/supabase/server'
import { SetupForm } from '@/components/super-admin/setup-form'
import { redirect } from 'next/navigation'

export default async function SuperAdminSetupPage() {
  const supabase = await createClient()

  // Verify if a super admin already exists
  const { data: superAdmins, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'super_admin')
    .limit(1)

  if (superAdmins && superAdmins.length > 0) {
    // Already setup, redirect to super-admin dashboard or login
    redirect('/super-admin')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-heading font-bold text-foreground">Instalación Global</h1>
          <p className="text-muted-foreground mt-2">Crea tu cuenta maestra ("Super Administrador") para administrar todas las franquicias / empresas.</p>
        </div>
        
        <SetupForm />
      </div>
    </div>
  )
}
