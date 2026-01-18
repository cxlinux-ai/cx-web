'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { CheckCircle, XCircle, Clock, Truck, MapPin, Package } from 'lucide-react'

interface LoadActionsProps {
  load: any
  isPoster: boolean
  isDriver: boolean
  assignment: any
  driverProfileId: string | undefined
}

export function LoadActions({ load, isPoster, isDriver, assignment, driverProfileId }: LoadActionsProps) {
  const [loading, setLoading] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showStatusDialog, setShowStatusDialog] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleAcceptLoad = async () => {
    setLoading(true)
    try {
      const { data: trucks } = await supabase
        .from('trucks')
        .select('id')
        .eq('driver_id', driverProfileId)
        .eq('active', true)
        .limit(1)
        .single()

      if (!trucks) {
        toast.error('You need to add a truck before accepting loads')
        router.push('/trucks')
        return
      }

      const { error: assignmentError } = await supabase.from('load_assignments').insert({
        load_id: load.id,
        driver_id: driverProfileId,
        truck_id: trucks.id,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })

      if (assignmentError) throw assignmentError

      const { error: loadError } = await supabase
        .from('loads')
        .update({ status: 'assigned' })
        .eq('id', load.id)

      if (loadError) throw loadError

      toast.success('Load accepted successfully!')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to accept load')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelLoad = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('loads')
        .update({ status: 'cancelled' })
        .eq('id', load.id)

      if (error) throw error

      toast.success('Load cancelled')
      setShowCancelDialog(false)
      router.push('/loads')
      router.refresh()
    } catch (error) {
      toast.error('Failed to cancel load')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async () => {
    setLoading(true)
    try {
      const updates: any = { status: newStatus }

      if (newStatus === 'en_route_pickup' && !assignment.accepted_at) {
        updates.accepted_at = new Date().toISOString()
      } else if (newStatus === 'at_pickup') {
        updates.pickup_arrived_at = new Date().toISOString()
      } else if (newStatus === 'loaded') {
        updates.loaded_at = new Date().toISOString()
      } else if (newStatus === 'en_route_delivery' && !assignment.loaded_at) {
        updates.loaded_at = new Date().toISOString()
      } else if (newStatus === 'at_delivery') {
        updates.delivery_arrived_at = new Date().toISOString()
      } else if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString()
      }

      const { error: assignmentError } = await supabase
        .from('load_assignments')
        .update(updates)
        .eq('id', assignment.id)

      if (assignmentError) throw assignmentError

      if (newStatus === 'completed') {
        const { error: loadError } = await supabase
          .from('loads')
          .update({ status: 'completed' })
          .eq('id', load.id)

        if (loadError) throw loadError
      } else if (newStatus === 'accepted' || newStatus === 'en_route_pickup' || newStatus === 'loaded' || newStatus === 'en_route_delivery') {
        const { error: loadError } = await supabase
          .from('loads')
          .update({ status: 'in_progress' })
          .eq('id', load.id)

        if (loadError) throw loadError
      }

      toast.success('Status updated')
      setShowStatusDialog(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setLoading(false)
    }
  }

  const getNextStatus = (currentStatus: string) => {
    const statusFlow: Record<string, { next: string; label: string; icon: any }> = {
      accepted: { next: 'en_route_pickup', label: 'Start Trip to Pickup', icon: Truck },
      en_route_pickup: { next: 'at_pickup', label: 'Arrived at Pickup', icon: MapPin },
      at_pickup: { next: 'loaded', label: 'Material Loaded', icon: Package },
      loaded: { next: 'en_route_delivery', label: 'Start Trip to Delivery', icon: Truck },
      en_route_delivery: { next: 'at_delivery', label: 'Arrived at Delivery', icon: MapPin },
      at_delivery: { next: 'completed', label: 'Mark Delivered', icon: CheckCircle },
    }
    return statusFlow[currentStatus]
  }

  const isMyAssignment = assignment && assignment.driver_id === driverProfileId

  return (
    <>
      <Card>
        <CardContent className="pt-6 space-y-3">
          {/* Driver Actions - Not yet assigned */}
          {isDriver && load.status === 'posted' && !assignment && (
            <>
              {load.pricing_type === 'bid' ? (
                <Button className="w-full bg-orange-500 hover:bg-orange-600" asChild>
                  <a href={`/loads/${load.id}/bid`}>Place Bid</a>
                </Button>
              ) : (
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  onClick={handleAcceptLoad}
                  disabled={loading}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {loading ? 'Accepting...' : 'Accept Load'}
                </Button>
              )}
            </>
          )}

          {/* Driver Actions - Assigned to me */}
          {isDriver && isMyAssignment && assignment.status !== 'completed' && (
            <>
              {getNextStatus(assignment.status) && (
                <Button
                  className="w-full bg-blue-900 hover:bg-blue-800"
                  onClick={() => {
                    setNewStatus(getNextStatus(assignment.status).next)
                    setShowStatusDialog(true)
                  }}
                >
                  {(() => {
                    const next = getNextStatus(assignment.status)
                    const Icon = next.icon
                    return (
                      <>
                        <Icon className="mr-2 h-4 w-4" />
                        {next.label}
                      </>
                    )
                  })()}
                </Button>
              )}
            </>
          )}

          {/* Poster Actions */}
          {isPoster && (
            <>
              {load.status === 'posted' && (
                <Button variant="outline" className="w-full" asChild>
                  <a href={`/loads/${load.id}/edit`}>Edit Load</a>
                </Button>
              )}
              {['posted', 'assigned'].includes(load.status) && (
                <Button
                  variant="outline"
                  className="w-full text-red-600 hover:text-red-700"
                  onClick={() => setShowCancelDialog(true)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Load
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Load</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this load? This action cannot be undone.
              {assignment && ' The assigned driver will be notified.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Load
            </Button>
            <Button variant="destructive" onClick={handleCancelLoad} disabled={loading}>
              {loading ? 'Cancelling...' : 'Cancel Load'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Confirmation Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status</DialogTitle>
            <DialogDescription>
              Confirm status update to: <strong className="capitalize">{newStatus?.replace('_', ' ')}</strong>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus} disabled={loading} className="bg-blue-900">
              {loading ? 'Updating...' : 'Confirm Update'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
