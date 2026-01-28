'use client'

import { useState } from 'react'
import { UserCheck, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface DirectHireRequestProps {
  loadId: string
  driverId: string
  driverName: string
  suggestedAmount?: number
}

export function DirectHireRequest({
  loadId,
  driverId,
  driverName,
  suggestedAmount
}: DirectHireRequestProps) {
  const [amount, setAmount] = useState<number>(suggestedAmount || 0)
  const [message, setMessage] = useState<string>('')
  const [sending, setSending] = useState(false)

  async function sendDirectHire() {
    if (amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (!confirm(`Send direct hire request to ${driverName} for $${amount}?`)) {
      return
    }

    setSending(true)
    try {
      const response = await fetch('/api/direct-hire/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          load_id: loadId,
          driver_id: driverId,
          amount,
          message
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`Direct hire request sent to ${driverName}!`)
        setMessage('')
      } else {
        toast.error(data.error || 'Failed to send request')
      }
    } catch (error) {
      toast.error('Failed to send direct hire request')
    } finally {
      setSending(false)
    }
  }

  return (
    <div id={`direct-hire-${loadId}-${driverId}`} className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3 mb-4">
        <UserCheck className="w-6 h-6 text-buildhaul-orange" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          Direct Hire: {driverName}
        </h3>
      </div>

      <div className="space-y-4">
        <div id={`direct-hire-amount-${driverId}`}>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Offer Amount ($)
          </label>
          <input
            id={`direct-hire-amount-input-${driverId}`}
            type="number"
            value={amount || ''}
            onChange={(e) => setAmount(parseFloat(e.target.value))}
            placeholder="Enter amount"
            className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-buildhaul-orange outline-none"
          />
        </div>

        <div id={`direct-hire-message-${driverId}`}>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Message (Optional)
          </label>
          <textarea
            id={`direct-hire-message-input-${driverId}`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a personal message..."
            rows={3}
            className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-buildhaul-orange outline-none resize-none"
          />
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            This request will expire in 24 hours. The driver will be notified immediately.
          </p>
        </div>

        <button
          id={`direct-hire-send-button-${driverId}`}
          onClick={sendDirectHire}
          disabled={sending}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-buildhaul-orange text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-semibold"
        >
          {sending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Send Direct Hire Request
            </>
          )}
        </button>
      </div>
    </div>
  )
}
