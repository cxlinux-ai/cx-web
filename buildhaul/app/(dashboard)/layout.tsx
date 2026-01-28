import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div id="dashboard-layout" className="min-h-screen bg-slate-50">
      <Header user={user} profile={profile} />
      <div id="dashboard-layout-content" className="flex">
        <Sidebar profile={profile} />
        <main id="dashboard-main" className="flex-1 p-6 md:ml-64">
          {children}
        </main>
      </div>
    </div>
  )
}
