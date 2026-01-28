'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { TrendingUp, MessageSquare, CheckCircle, XCircle } from 'lucide-react'

interface BidsListProps {
  loadId: string
  bids: any[]
}

export function BidsList({ loadId, bids }: BidsListProps) {
  const [loading, setLoading] = useState(false)
  const [selectedBid, setSelectedBid] = useState<any>(null)
  const [showAcceptDialog, setShowAcceptDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAcceptBid = async () => {
    setLoading(true)
    try {
      const { data: trucks } = await supabase
        .from('trucks')
        .select('id')
        .eq('driver_id', selectedBid.driver_id)
        .eq('active', true)
        .limit(1)
        .single()

      if (!trucks) {
        toast.error('Driver needs to have an active truck')
        return
      }

      const { error: assignmentError } = await supabase.from('load_assignments').insert({
        load_id: loadId,
        driver_id: selectedBid.driver_id,
        truck_id: trucks.id,
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      })

      if (assignmentError) throw assignmentError

      const { error: bidError } = await supabase
        .from('bids')
        .update({ status: 'accepted', responded_at: new Date().toISOString() })
        .eq('id', selectedBid.id)

      if (bidError) throw bidError

      const { error: loadError } = await supabase
        .from('loads')
        .update({ status: 'assigned', estimated_total: selectedBid.amount })
        .eq('id', loadId)

      if (loadError) throw loadError

      toast.success('Bid accepted! Driver has been assigned.')
      setShowAcceptDialog(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to accept bid')
    } finally {
      setLoading(false)
    }
  }

  const handleRejectBid = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('bids')
        .update({ status: 'rejected', responded_at: new Date().toISOString() })
        .eq('id', selectedBid.id)

      if (error) throw error

      toast.success('Bid rejected')
      setShowRejectDialog(false)
      router.refresh()
    } catch (error) {
      toast.error('Failed to reject bid')
    } finally {
      setLoading(false)
    }
  }

  const pendingBids = bids.filter(b => b.status === 'pending')
  const hasBids = bids.length > 0

  return (
    <>
      <Card id="bids-list-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Bids Received</span>
            <Badge variant="outline">{pendingBids.length} pending</Badge>
          </CardTitle>
          <CardDescription>
            {hasBids ? 'Review bids and select a driver' : 'No bids received yet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!hasBids ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Waiting for drivers to submit bids...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bids.map((bid) => (
                <div
                  key={bid.id}
                  className={`border rounded-lg p-4 ${
                    bid.status === 'accepted'
                      ? 'bg-green-50 border-green-200'
                      : bid.status === 'rejected'
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-blue-900 text-white">
                          {bid.drivers?.profiles?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'D'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{bid.drivers?.profiles?.full_name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-yellow-500" />
                            <span>{bid.drivers?.rating}</span>
                          </div>
                          <span>•</span>
                          <span>{bid.drivers?.completed_loads} loads</span>
                          <span>•</span>
                          <span>{bid.drivers?.on_time_percentage}% on-time</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-900">${bid.amount}</p>
                      {bid.status === 'accepted' && (
                        <Badge variant="outline" className="text-green-600 border-green-600 mt-1">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Accepted
                        </Badge>
                      )}
                      {bid.status === 'rejected' && (
                        <Badge variant="outline" className="text-gray-600 border-gray-400 mt-1">
                          Rejected
                        </Badge>
                      )}
                    </div>
                  </div>

                  {bid.message && (
                    <>
                      <Separator className="my-3" />
                      <div className="bg-gray-50 rounded p-3">
                        <p className="text-sm text-gray-700 italic">"{bid.message}"</p>
                      </div>
                    </>
                  )}

                  {bid.status === 'pending' && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        className="flex-1 bg-blue-900 hover:bg-blue-800"
                        onClick={() => {
                          setSelectedBid(bid)
                          setShowAcceptDialog(true)
                        }}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => {
                          setSelectedBid(bid)
                          setShowRejectDialog(true)
                        }}
                      >
                        <XCircle className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    Submitted {new Date(bid.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accept Bid Dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Bid</DialogTitle>
            <DialogDescription>
              Accept bid from <strong>{selectedBid?.drivers?.profiles?.full_name}</strong> for{' '}
              <strong>${selectedBid?.amount}</strong>? This will assign the load to them and reject all other bids.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAcceptDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAcceptBid} disabled={loading} className="bg-blue-900">
              {loading ? 'Accepting...' : 'Accept Bid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Bid Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Bid</DialogTitle>
            <DialogDescription>
              Reject bid from <strong>{selectedBid?.drivers?.profiles?.full_name}</strong>? They will be notified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectBid} disabled={loading}>
              {loading ? 'Rejecting...' : 'Reject Bid'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
