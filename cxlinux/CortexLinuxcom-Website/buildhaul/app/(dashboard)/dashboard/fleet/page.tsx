import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LiveFleetMap } from '@/components/maps/LiveFleetMap'

export default async function FleetPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*, company:companies(*)')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'poster') {
    redirect('/dashboard/available')
  }

  return (
    <div id="fleet-page-container" className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Fleet Overview</h1>
        <p className="text-slate-400">Real-time view of all your active loads and drivers</p>
      </div>

      <div className="h-[calc(100vh-200px)]">
        <LiveFleetMap
          userRole="poster"
          companyId={profile?.company?.id}
          showAvailableLoads={true}
          showActiveLoads={true}
          showDrivers={true}
        />
      </div>
    </div>
  )
}
