'use client'

import { useState } from 'react'
import { Zap, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface InstantPayoutButtonProps {
  paymentId: string
  amount: number
}

export function InstantPayoutButton({ paymentId, amount }: InstantPayoutButtonProps) {
  const [processing, setProcessing] = useState(false)

  async function requestInstantPayout() {
    if (!confirm(`Request instant payout of $${amount}? (1.5% fee will be deducted)`)) {
      return
    }

    setProcessing(true)
    try {
      const response = await fetch('/api/payouts/instant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Instant payout of $${data.net_amount.toFixed(2)} initiated!`)
      } else {
        toast.error(data.error || 'Payout failed')
      }
    } catch (error) {
      toast.error('Failed to process payout')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <button
      id={`instant-payout-button-${paymentId}`}
      onClick={requestInstantPayout}
      disabled={processing}
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-buildhaul-orange to-orange-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
    >
      {processing ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Zap className="w-4 h-4" />
          Instant Payout
        </>
      )}
    </button>
  )
}
