'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { ArrowLeft, DollarSign } from 'lucide-react'
import Link from 'next/link'

const bidSchema = z.object({
  amount: z.number().min(1, 'Bid amount must be greater than 0'),
  message: z.string().max(500).optional(),
})

type BidInput = z.infer<typeof bidSchema>

export default function BidPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false)
  const [load, setLoad] = useState<any>(null)
  const [driverId, setDriverId] = useState<string>('')
  const router = useRouter()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BidInput>({
    resolver: zodResolver(bidSchema),
  })

  useEffect(() => {
    const fetchData = async () => {
      const id = (await params).id

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (!driver) {
        toast.error('Driver profile not found')
        router.push('/dashboard')
        return
      }

      setDriverId(driver.id)

      const { data: loadData } = await supabase
        .from('loads')
        .select('*, companies(name)')
        .eq('id', id)
        .single()

      if (!loadData) {
        toast.error('Load not found')
        router.push('/available')
        return
      }

      if (loadData.pricing_type !== 'bid') {
        toast.error('This load does not accept bids')
        router.push(`/loads/${id}`)
        return
      }

      if (loadData.status !== 'posted') {
        toast.error('This load is no longer available for bidding')
        router.push(`/loads/${id}`)
        return
      }

      setLoad(loadData)
    }

    fetchData()
  }, [params])

  const onSubmit = async (data: BidInput) => {
    setLoading(true)
    try {
      const id = (await params).id

      const { error: existingBidCheck } = await supabase
        .from('bids')
        .select('id')
        .eq('load_id', id)
        .eq('driver_id', driverId)
        .eq('status', 'pending')
        .single()

      if (!existingBidCheck) {
        toast.error('You already have a pending bid on this load')
        return
      }

      const { error } = await supabase.from('bids').insert({
        load_id: id,
        driver_id: driverId,
        amount: data.amount,
        message: data.message,
        status: 'pending',
      })

      if (error) throw error

      toast.success('Bid submitted successfully!')
      router.push(`/loads/${id}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit bid')
    } finally {
      setLoading(false)
    }
  }

  if (!load) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div id="bid-page" className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href={`/loads/${(async () => (await params).id)()}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Load
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Place Your Bid
          </CardTitle>
          <CardDescription>
            Submit your bid for this load. The company will review all bids and select a driver.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Load Summary */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <h3 className="font-semibold">Load Summary</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Company:</span>{' '}
                {/* @ts-ignore */}
                <span className="font-medium">{load.companies?.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Material:</span>{' '}
                <span className="font-medium capitalize">{load.material_type}</span>
              </div>
              <div>
                <span className="text-gray-600">Distance:</span>{' '}
                <span className="font-medium">{load.distance_miles} miles</span>
              </div>
              <div>
                <span className="text-gray-600">Weight:</span>{' '}
                <span className="font-medium">{load.weight_tons} tons</span>
              </div>
              <div>
                <span className="text-gray-600">Route:</span>{' '}
                <span className="font-medium">
                  {load.pickup_city} → {load.delivery_city}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Starting Bid:</span>{' '}
                <span className="font-medium">${load.rate_amount}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Your Bid Amount ($) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min={load.rate_amount}
                placeholder={load.rate_amount}
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount.message}</p>
              )}
              <p className="text-xs text-gray-600">
                Minimum bid: ${load.rate_amount}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message to Company (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Tell them why you're the best choice for this load..."
                rows={4}
                {...register('message')}
              />
              {errors.message && (
                <p className="text-sm text-red-600">{errors.message.message}</p>
              )}
              <p className="text-xs text-gray-600">Max 500 characters</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Bidding Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Be competitive but realistic with your pricing</li>
                <li>• Highlight your experience and reliability in the message</li>
                <li>• Companies value on-time performance and professionalism</li>
                <li>• You'll be notified if your bid is accepted or if the company has questions</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600"
              disabled={loading}
            >
              {loading ? 'Submitting Bid...' : 'Submit Bid'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
