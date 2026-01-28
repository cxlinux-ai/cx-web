import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Plus, TrendingUp, Clock, CheckCircle } from 'lucide-react'

export default async function LoadsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'poster') redirect('/available')

  // Get company
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  // Get loads
  const { data: loads } = await supabase
    .from('loads')
    .select('*')
    .eq('company_id', company?.id || '')
    .order('created_at', { ascending: false })

  // Calculate stats
  const activeLoads = loads?.filter(l => ['posted', 'assigned', 'in_progress'].includes(l.status)).length || 0
  const completedThisMonth = loads?.filter(l => {
    if (l.status !== 'completed') return false
    const completedDate = new Date(l.updated_at)
    const now = new Date()
    return completedDate.getMonth() === now.getMonth() && completedDate.getFullYear() === now.getFullYear()
  }).length || 0
  const totalSpent = loads
    ?.filter(l => l.status === 'completed')
    .reduce((sum, l) => sum + Number(l.estimated_total), 0) || 0

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      draft: { variant: 'secondary', label: 'Draft' },
      posted: { variant: 'default', label: 'Posted' },
      assigned: { variant: 'outline', label: 'Assigned' },
      in_progress: { variant: 'default', label: 'In Progress' },
      completed: { variant: 'outline', label: 'Completed' },
      cancelled: { variant: 'destructive', label: 'Cancelled' },
    }
    const config = variants[status] || variants.draft
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div id="loads-page" className="space-y-6">
      <div id="loads-header" className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-900">My Loads</h1>
          <p className="text-gray-600 mt-1">Manage your load postings and track deliveries</p>
        </div>
        <Link href="/loads/new">
          <Button id="loads-new-button" className="bg-orange-500 hover:bg-orange-600">
            <Plus className="mr-2 h-4 w-4" />
            Post New Load
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div id="loads-stats-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card id="loads-stat-active">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loads</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoads}</div>
            <p className="text-xs text-muted-foreground">Currently posted or in progress</p>
          </CardContent>
        </Card>

        <Card id="loads-stat-completed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedThisMonth}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card id="loads-stat-spent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Loads List */}
      <Card id="loads-list-card">
        <CardHeader>
          <CardTitle>Recent Loads</CardTitle>
          <CardDescription>View and manage your load postings</CardDescription>
        </CardHeader>
        <CardContent>
          {!loads || loads.length === 0 ? (
            <div id="loads-empty-state" className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No loads yet</h3>
              <p className="text-gray-600 mb-6">Get started by posting your first load</p>
              <Link href="/loads/new">
                <Button id="loads-empty-post-button" className="bg-orange-500 hover:bg-orange-600">
                  <Plus className="mr-2 h-4 w-4" />
                  Post Your First Load
                </Button>
              </Link>
            </div>
          ) : (
            <div id="loads-table" className="space-y-4">
              {loads.map((load) => (
                <Link key={load.id} href={`/loads/${load.id}`}>
                  <div className="border rounded-lg p-4 hover:bg-slate-50 cursor-pointer transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{load.material_type}</h3>
                        <p className="text-sm text-gray-600">
                          {load.pickup_city}, {load.pickup_state} → {load.delivery_city}, {load.delivery_state}
                        </p>
                      </div>
                      {getStatusBadge(load.status)}
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {new Date(load.scheduled_date).toLocaleDateString()}
                      </div>
                      <div>{load.weight_tons} tons</div>
                      <div>{load.distance_miles} miles</div>
                      <div className="font-semibold text-blue-900">${load.estimated_total}</div>
                      {load.urgent && (
                        <Badge variant="destructive" className="ml-auto">Urgent</Badge>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
