'use client'

import { useState } from 'react'
import { Calendar, Clock, Repeat, Save } from 'lucide-react'
import { toast } from 'sonner'

interface RecurringLoadFormData {
  origin_address: string
  origin_city: string
  origin_state: string
  origin_zip: string
  destination_address: string
  destination_city: string
  destination_state: string
  destination_zip: string
  material_type: string
  weight: number
  price_per_load: number
  recurrence_pattern: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  recurrence_days: number[]
  preferred_driver_id?: string
  auto_post: boolean
}

export function RecurringLoadsManager() {
  const [formData, setFormData] = useState<RecurringLoadFormData>({
    origin_address: '',
    origin_city: '',
    origin_state: '',
    origin_zip: '',
    destination_address: '',
    destination_city: '',
    destination_state: '',
    destination_zip: '',
    material_type: '',
    weight: 0,
    price_per_load: 0,
    recurrence_pattern: 'weekly',
    recurrence_days: [],
    auto_post: true
  })
  const [saving, setSaving] = useState(false)

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ]

  function toggleDay(day: number) {
    setFormData(prev => ({
      ...prev,
      recurrence_days: prev.recurrence_days.includes(day)
        ? prev.recurrence_days.filter(d => d !== day)
        : [...prev.recurrence_days, day].sort()
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (formData.recurrence_days.length === 0) {
      toast.error('Please select at least one day')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/recurring/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast.success('Recurring load created successfully!')
        // Reset form
        setFormData({
          origin_address: '',
          origin_city: '',
          origin_state: '',
          origin_zip: '',
          destination_address: '',
          destination_city: '',
          destination_state: '',
          destination_zip: '',
          material_type: '',
          weight: 0,
          price_per_load: 0,
          recurrence_pattern: 'weekly',
          recurrence_days: [],
          auto_post: true
        })
      } else {
        toast.error(data.error || 'Failed to create recurring load')
      }
    } catch (error) {
      toast.error('Failed to create recurring load')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div id="recurring-loads-manager-container" className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <Repeat className="w-6 h-6 text-buildhaul-orange" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Create Recurring Load
          </h2>
        </div>

        <form id="recurring-load-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Origin */}
          <div id="recurring-origin-section">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Origin
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                id="recurring-origin-address"
                type="text"
                placeholder="Street Address"
                value={formData.origin_address}
                onChange={(e) => setFormData({ ...formData, origin_address: e.target.value })}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-buildhaul-orange outline-none"
                required
              />
              <input
                id="recurring-origin-city"
                type="text"
                placeholder="City"
                value={formData.origin_city}
                onChange={(e) => setFormData({ ...formData, origin_city: e.target.value })}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-buildhaul-orange outline-none"
                required
              />
              <input
                id="recurring-origin-state"
                type="text"
                placeholder="State"
                value={formData.origin_state}
                onChange={(e) => setFormData({ ...formData, origin_state: e.target.value })}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-buildhaul-orange outline-none"
                required
              />
              <input
                id="recurring-origin-zip"
                type="text"
                placeholder="ZIP Code"
                value={formData.origin_zip}
                onChange={(e) => setFormData({ ...formData, origin_zip: e.target.value })}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-buildhaul-orange outline-none"
                required
              />
            </div>
          </div>

          {/* Destination */}
          <div id="recurring-destination-section">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Destination
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                id="recurring-destination-address"
                type="text"
                placeholder="Street Address"
                value={formData.destination_address}
                onChange={(e) => setFormData({ ...formData, destination_address: e.target.value })}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-buildhaul-orange outline-none"
                required
              />
              <input
                id="recurring-destination-city"
                type="text"
                placeholder="City"
                value={formData.destination_city}
                onChange={(e) => setFormData({ ...formData, destination_city: e.target.value })}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-buildhaul-orange outline-none"
                required
              />
              <input
                id="recurring-destination-state"
                type="text"
                placeholder="State"
                value={formData.destination_state}
                onChange={(e) => setFormData({ ...formData, destination_state: e.target.value })}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-buildhaul-orange outline-none"
                required
              />
              <input
                id="recurring-destination-zip"
                type="text"
                placeholder="ZIP Code"
                value={formData.destination_zip}
                onChange={(e) => setFormData({ ...formData, destination_zip: e.target.value })}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-buildhaul-orange outline-none"
                required
              />
            </div>
          </div>

          {/* Load Details */}
          <div id="recurring-load-details-section" className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              id="recurring-material-type"
              type="text"
              placeholder="Material Type"
              value={formData.material_type}
              onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-buildhaul-orange outline-none"
              required
            />
            <input
              id="recurring-weight"
              type="number"
              placeholder="Weight (tons)"
              value={formData.weight || ''}
              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-buildhaul-orange outline-none"
              required
            />
            <input
              id="recurring-price"
              type="number"
              placeholder="Price per Load ($)"
              value={formData.price_per_load || ''}
              onChange={(e) => setFormData({ ...formData, price_per_load: parseFloat(e.target.value) })}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-buildhaul-orange outline-none"
              required
            />
          </div>

          {/* Recurrence Pattern */}
          <div id="recurring-pattern-section">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
              Recurrence Pattern
            </h3>
            <select
              id="recurring-pattern-select"
              value={formData.recurrence_pattern}
              onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value as any })}
              className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-buildhaul-orange outline-none mb-4"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>

            {(formData.recurrence_pattern === 'weekly' || formData.recurrence_pattern === 'biweekly') && (
              <div id="recurring-days-selector" className="grid grid-cols-7 gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day.value}
                    id={`recurring-day-${day.value}`}
                    type="button"
                    onClick={() => toggleDay(day.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      formData.recurrence_days.includes(day.value)
                        ? 'bg-buildhaul-orange text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {day.label.slice(0, 3)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auto-post Toggle */}
          <div id="recurring-autopost-section" className="flex items-center gap-3">
            <input
              id="recurring-autopost-toggle"
              type="checkbox"
              checked={formData.auto_post}
              onChange={(e) => setFormData({ ...formData, auto_post: e.target.checked })}
              className="w-5 h-5 rounded text-buildhaul-orange focus:ring-buildhaul-orange"
            />
            <label htmlFor="recurring-autopost-toggle" className="text-slate-700 dark:text-slate-300">
              Automatically post loads
            </label>
          </div>

          {/* Submit Button */}
          <button
            id="recurring-submit-button"
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-buildhaul-orange text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 font-semibold"
          >
            {saving ? (
              <>
                <Clock className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Create Recurring Load
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
