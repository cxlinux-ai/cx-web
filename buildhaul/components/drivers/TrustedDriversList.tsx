'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, TrendingUp, DollarSign, Truck, Ban, Check } from 'lucide-react'
import { toast } from 'sonner'

interface DriverRelationship {
  id: string
  driver_id: string
  status: 'preferred' | 'approved' | 'neutral' | 'blocked'
  loads_completed: number
  total_paid: number
  on_time_rate: number
  avg_rating: number
  last_load_date: string
  driver: {
    id: string
    first_name: string
    last_name: string
    phone: string
    rating: number
  }
}

export function TrustedDriversList({ companyId }: { companyId: string }) {
  const [drivers, setDrivers] = useState<DriverRelationship[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'preferred' | 'approved' | 'blocked'>('all')
  const supabase = createClient()

  useEffect(() => {
    loadDrivers()
  }, [companyId, filter])

  async function loadDrivers() {
    setLoading(true)
    try {
      let query = supabase
        .from('company_driver_relationships')
        .select(`
          *,
          driver:drivers(id, first_name, last_name, phone, rating)
        `)
        .eq('company_id', companyId)
        .order('loads_completed', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('status', filter)
      }

      const { data, error } = await query

      if (error) throw error

      if (data) {
        setDrivers(data as any)
      }
    } catch (error) {
      console.error('Error loading drivers:', error)
      toast.error('Failed to load drivers')
    } finally {
      setLoading(false)
    }
  }

  async function updateDriverStatus(driverId: string, newStatus: string) {
    try {
      const { error } = await supabase
        .from('company_driver_relationships')
        .update({ status: newStatus })
        .eq('company_id', companyId)
        .eq('driver_id', driverId)

      if (error) throw error

      toast.success(`Driver status updated to ${newStatus}`)
      loadDrivers()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update driver status')
    }
  }

  if (loading) {
    return (
      <div id="drivers-loading" className="flex items-center justify-center h-64">
        <div className="text-slate-600 dark:text-slate-400">Loading drivers...</div>
      </div>
    )
  }

  return (
    <div id="trusted-drivers-list-container" className="space-y-6">
      {/* Filter Tabs */}
      <div id="drivers-filter-tabs" className="flex gap-2">
        {(['all', 'preferred', 'approved', 'blocked'] as const).map((filterOption) => (
          <button
            key={filterOption}
            id={`drivers-filter-${filterOption}`}
            onClick={() => setFilter(filterOption)}
            className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
              filter === filterOption
                ? 'bg-buildhaul-orange text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {filterOption}
          </button>
        ))}
      </div>

      {/* Drivers List */}
      <div id="drivers-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map((relationship) => (
          <div
            key={relationship.id}
            id={`driver-card-${relationship.driver_id}`}
            className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800"
          >
            {/* Driver Info */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {relationship.driver.first_name} {relationship.driver.last_name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {relationship.driver.phone}
                </p>
              </div>
              {relationship.status === 'preferred' && (
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Truck className="w-4 h-4 text-buildhaul-orange" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">Loads</span>
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {relationship.loads_completed}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">Paid</span>
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  ${relationship.total_paid.toLocaleString()}
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">On Time</span>
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {relationship.on_time_rate}%
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">Rating</span>
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {relationship.avg_rating.toFixed(1)}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                relationship.status === 'preferred'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                  : relationship.status === 'approved'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : relationship.status === 'blocked'
                  ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
              }`}>
                {relationship.status.charAt(0).toUpperCase() + relationship.status.slice(1)}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {relationship.status !== 'preferred' && (
                <button
                  id={`driver-prefer-${relationship.driver_id}`}
                  onClick={() => updateDriverStatus(relationship.driver_id, 'preferred')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm font-medium"
                >
                  <Star className="w-4 h-4" />
                  Prefer
                </button>
              )}
              {relationship.status !== 'approved' && relationship.status !== 'preferred' && (
                <button
                  id={`driver-approve-${relationship.driver_id}`}
                  onClick={() => updateDriverStatus(relationship.driver_id, 'approved')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm font-medium"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
              )}
              {relationship.status !== 'blocked' && (
                <button
                  id={`driver-block-${relationship.driver_id}`}
                  onClick={() => updateDriverStatus(relationship.driver_id, 'blocked')}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium"
                >
                  <Ban className="w-4 h-4" />
                  Block
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {drivers.length === 0 && (
        <div id="drivers-empty-state" className="text-center py-12">
          <Truck className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            No drivers found with {filter} status
          </p>
        </div>
      )}
    </div>
  )
}
