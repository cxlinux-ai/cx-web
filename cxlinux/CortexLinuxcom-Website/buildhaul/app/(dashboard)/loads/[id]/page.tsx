import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MapPin, Package, Clock, DollarSign, TrendingUp, AlertCircle, CheckCircle2, User, Truck as TruckIcon } from 'lucide-react'
import Link from 'next/link'
import { LoadStatusTimeline } from '@/components/loads/LoadStatusTimeline'
import { LoadActions } from '@/components/loads/LoadActions'
import { BidsList } from '@/components/loads/BidsList'

export default async function LoadDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()
  const { id } = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch load with company info
  const { data: load, error } = await supabase
    .from('loads')
    .select(`
      *,
      companies (
        id,
        name,
        business_type,
        rating,
        total_loads_posted,
        verified
      )
    `)
    .eq('id', id)
    .single()

  if (error || !load) {
    notFound()
  }

  // Check if user has permission to view this load
  const isPoster = profile?.role === 'poster' && load.posted_by === user.id
  const isDriver = profile?.role === 'driver'

  if (!isPoster && !isDriver && load.status !== 'posted') {
    redirect('/dashboard')
  }

  // Fetch assignment if exists
  const { data: assignment } = await supabase
    .from('load_assignments')
    .select(`
      *,
      drivers (
        id,
        profile_id,
        rating,
        completed_loads,
        on_time_percentage,
        profiles (
          full_name,
          phone
        )
      ),
      trucks (
        id,
        truck_type,
        make,
        model,
        license_plate
      )
    `)
    .eq('load_id', id)
    .maybeSingle()

  // Fetch bids if bidding is enabled
  let bids = null
  if (load.pricing_type === 'bid') {
    const { data: bidsData } = await supabase
      .from('bids')
      .select(`
        *,
        drivers (
          id,
          profile_id,
          rating,
          completed_loads,
          on_time_percentage,
          profiles (
            full_name
          )
        )
      `)
      .eq('load_id', id)
      .order('created_at', { ascending: false })

    bids = bidsData
  }

  // Get driver profile if viewing as driver
  let driverProfile = null
  if (isDriver) {
    const { data } = await supabase
      .from('drivers')
      .select('id')
      .eq('profile_id', user.id)
      .single()
    driverProfile = data
  }

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
    <div id="load-detail-page" className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div id="load-header" className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-blue-900 capitalize">{load.material_type}</h1>
            {getStatusBadge(load.status)}
            {load.urgent && <Badge variant="destructive">Urgent</Badge>}
          </div>
          <p className="text-gray-600">
            {load.pickup_city}, {load.pickup_state} → {load.delivery_city}, {load.delivery_state}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-blue-900">${load.estimated_total}</p>
          <p className="text-sm text-gray-600 capitalize">{load.pricing_type.replace('_', ' ')}</p>
        </div>
      </div>

      {/* Status Timeline (for posters and assigned drivers) */}
      {(isPoster || (assignment && isDriver)) && (
        <LoadStatusTimeline status={load.status} assignment={assignment} />
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {/* Main Content - 2 columns */}
        <div className="md:col-span-2 space-y-6">
          {/* Load Details */}
          <Card id="load-details-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Load Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Material Type</p>
                  <p className="font-medium capitalize">{load.material_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Truck Type</p>
                  <p className="font-medium capitalize">{load.truck_type_required.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Weight</p>
                  <p className="font-medium">{load.weight_tons} tons</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Trucks Needed</p>
                  <p className="font-medium">{load.trucks_needed}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="font-medium">{load.distance_miles} miles</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Round Trips</p>
                  <p className="font-medium">{load.round_trips}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Scheduled Date</p>
                  <p className="font-medium">{new Date(load.scheduled_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pickup Window</p>
                  <p className="font-medium">
                    {load.pickup_time_start} - {load.pickup_time_end}
                  </p>
                </div>
              </div>

              {load.material_description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Material Description</p>
                    <p className="text-sm">{load.material_description}</p>
                  </div>
                </>
              )}

              {load.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Additional Notes</p>
                    <p className="text-sm">{load.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pickup & Delivery Locations */}
          <Card id="locations-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Locations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-green-500 rounded-full w-3 h-3" />
                  <h4 className="font-semibold">Pickup</h4>
                </div>
                <p className="font-medium">{load.pickup_location_name}</p>
                <p className="text-sm text-gray-600">
                  {load.pickup_address}
                  <br />
                  {load.pickup_city}, {load.pickup_state} {load.pickup_zip}
                </p>
                {load.pickup_instructions && (
                  <p className="text-sm text-gray-600 mt-2 italic">{load.pickup_instructions}</p>
                )}
              </div>

              <Separator />

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-red-500 rounded-full w-3 h-3" />
                  <h4 className="font-semibold">Delivery</h4>
                </div>
                <p className="font-medium">{load.delivery_location_name}</p>
                <p className="text-sm text-gray-600">
                  {load.delivery_address}
                  <br />
                  {load.delivery_city}, {load.delivery_state} {load.delivery_zip}
                </p>
                {load.delivery_instructions && (
                  <p className="text-sm text-gray-600 mt-2 italic">{load.delivery_instructions}</p>
                )}
              </div>

              {/* Map Placeholder */}
              <div className="bg-slate-100 rounded-lg h-64 flex items-center justify-center border">
                <div className="text-center text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Map view coming soon</p>
                  <p className="text-xs">{load.distance_miles} miles between locations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bids Section (if bidding enabled and poster) */}
          {load.pricing_type === 'bid' && isPoster && bids && (
            <BidsList loadId={load.id} bids={bids} />
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Company Info (for drivers) */}
          {isDriver && load.companies && (
            <Card id="company-info-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Posted By
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-semibold">{load.companies.name}</p>
                  <p className="text-sm text-gray-600 capitalize">{load.companies.business_type.replace('_', ' ')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{load.companies.rating}</span>
                  </div>
                  <span className="text-sm text-gray-600">• {load.companies.total_loads_posted} loads posted</span>
                </div>
                {load.companies.verified && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </CardContent>
            </Card>
          )}

          {/* Assigned Driver Info (for posters) */}
          {isPoster && assignment && assignment.drivers && (
            <Card id="driver-info-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Assigned Driver
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-blue-900 text-white">
                      {assignment.drivers.profiles?.full_name?.split(' ').map(n => n[0]).join('') || 'D'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{assignment.drivers.profiles?.full_name}</p>
                    <p className="text-sm text-gray-600">{assignment.drivers.profiles?.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium">{assignment.drivers.rating}</span>
                  </div>
                  <span className="text-sm text-gray-600">• {assignment.drivers.completed_loads} loads</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">On-time: {assignment.drivers.on_time_percentage}%</p>
                </div>
                {assignment.trucks && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-1">Truck</p>
                    <p className="text-sm text-gray-600">
                      {assignment.trucks.make} {assignment.trucks.model}
                    </p>
                    <p className="text-sm text-gray-600">{assignment.trucks.license_plate}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Pricing Breakdown */}
          <Card id="pricing-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Type</span>
                <span className="font-medium capitalize">{load.pricing_type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rate</span>
                <span className="font-medium">${load.rate_amount}</span>
              </div>
              {load.pricing_type !== 'bid' && (
                <>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-blue-900">${load.estimated_total}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <LoadActions
            load={load}
            isPoster={isPoster}
            isDriver={isDriver}
            assignment={assignment}
            driverProfileId={driverProfile?.id}
          />
        </div>
      </div>
    </div>
  )
}
