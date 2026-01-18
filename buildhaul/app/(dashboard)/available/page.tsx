import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Package, Clock, DollarSign, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default async function AvailableLoadsPage() {
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

  if (profile?.role !== 'driver') redirect('/loads')

  // Get driver profile
  const { data: driver } = await supabase
    .from('drivers')
    .select('*')
    .eq('profile_id', user.id)
    .single()

  // Get available loads (posted status)
  const { data: loads } = await supabase
    .from('loads')
    .select('*, companies(name)')
    .eq('status', 'posted')
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div id="available-loads-page" className="space-y-6">
      <div id="available-loads-header">
        <h1 className="text-3xl font-bold text-blue-900">Available Loads</h1>
        <p className="text-gray-600 mt-1">Browse and bid on loads in your area</p>
      </div>

      {/* Quick Stats */}
      <div id="available-stats-grid" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card id="available-stat-total">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Loads</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loads?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Ready to accept</p>
          </CardContent>
        </Card>

        <Card id="available-stat-urgent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Urgent Loads</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loads?.filter(l => l.urgent).length || 0}</div>
            <p className="text-xs text-muted-foreground">Need immediate attention</p>
          </CardContent>
        </Card>

        <Card id="available-stat-potential">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${loads?.slice(0, 10).reduce((sum, l) => sum + Number(l.estimated_total), 0).toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Top 10 loads</p>
          </CardContent>
        </Card>
      </div>

      {/* Loads Grid */}
      <div id="available-loads-grid">
        {!loads || loads.length === 0 ? (
          <Card id="available-empty-state">
            <CardContent className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No available loads</h3>
              <p className="text-gray-600">Check back soon for new load postings</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loads.map((load: any) => (
              <Card key={load.id} id={`load-card-${load.id}`} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{load.material_type}</CardTitle>
                    {load.urgent && <Badge variant="destructive">Urgent</Badge>}
                  </div>
                  <CardDescription>
                    {/* @ts-ignore */}
                    {load.companies?.name || 'Company'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{load.pickup_city}, {load.pickup_state}</div>
                      <div className="text-gray-600">↓</div>
                      <div className="font-medium">{load.delivery_city}, {load.delivery_state}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    {new Date(load.scheduled_date).toLocaleDateString()}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="text-sm text-gray-600">
                      {load.weight_tons}T • {load.distance_miles}mi
                    </div>
                    <div className="text-xl font-bold text-blue-900">
                      ${load.estimated_total}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/loads/${load.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">View Details</Button>
                    </Link>
                    {load.pricing_type === 'bid' ? (
                      <Link href={`/loads/${load.id}/bid`} className="flex-1">
                        <Button className="w-full bg-orange-500 hover:bg-orange-600">Bid</Button>
                      </Link>
                    ) : (
                      <Button className="flex-1 bg-orange-500 hover:bg-orange-600">Accept</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
