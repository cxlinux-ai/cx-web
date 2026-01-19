'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import { format, subDays } from 'date-fns'
import { DollarSign, TrendingUp, Clock, Zap } from 'lucide-react'

interface EarningsData {
  date: string
  gross_earnings: number
  platform_fees: number
  instant_payout_fees: number
  net_earnings: number
  loads_completed: number
}

interface EarningsStats {
  total_earnings: number
  total_loads: number
  avg_per_load: number
  instant_payout_fees: number
}

export function EarningsDashboard({ driverId }: { driverId: string }) {
  const [earningsData, setEarningsData] = useState<EarningsData[]>([])
  const [stats, setStats] = useState<EarningsStats>({
    total_earnings: 0,
    total_loads: 0,
    avg_per_load: 0,
    instant_payout_fees: 0
  })
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadEarnings()
  }, [driverId, timeRange])

  async function loadEarnings() {
    setLoading(true)
    try {
      const days = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365
      const startDate = format(subDays(new Date(), days), 'yyyy-MM-dd')

      const { data, error } = await supabase
        .from('driver_earnings')
        .select('*')
        .eq('driver_id', driverId)
        .gte('date', startDate)
        .order('date', { ascending: true })

      if (error) throw error

      if (data) {
        setEarningsData(data as EarningsData[])

        // Calculate stats
        const totalEarnings = data.reduce((sum, day) => sum + Number(day.net_earnings), 0)
        const totalLoads = data.reduce((sum, day) => sum + day.loads_completed, 0)
        const totalInstantFees = data.reduce((sum, day) => sum + Number(day.instant_payout_fees || 0), 0)

        setStats({
          total_earnings: totalEarnings,
          total_loads: totalLoads,
          avg_per_load: totalLoads > 0 ? totalEarnings / totalLoads : 0,
          instant_payout_fees: totalInstantFees
        })
      }
    } catch (error) {
      console.error('Error loading earnings:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div id="earnings-loading" className="flex items-center justify-center h-96">
        <div className="text-slate-600 dark:text-slate-400">Loading earnings...</div>
      </div>
    )
  }

  return (
    <div id="earnings-dashboard-container" className="space-y-6">
      {/* Time Range Selector */}
      <div id="earnings-timerange-selector" className="flex gap-2">
        {(['week', 'month', 'year'] as const).map((range) => (
          <button
            key={range}
            id={`earnings-timerange-${range}`}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeRange === range
                ? 'bg-buildhaul-orange text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div id="earnings-stats-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div id="earnings-stat-total" className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Earnings</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ${stats.total_earnings.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div id="earnings-stat-loads" className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Loads Completed</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stats.total_loads}
              </p>
            </div>
          </div>
        </div>

        <div id="earnings-stat-average" className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Avg per Load</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ${stats.avg_per_load.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        <div id="earnings-stat-fees" className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Zap className="w-6 h-6 text-buildhaul-orange" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Instant Fees</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                ${stats.instant_payout_fees.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Chart */}
      <div id="earnings-chart-container" className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Earnings Over Time
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={earningsData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(new Date(date), 'MMM d')}
              className="text-slate-600 dark:text-slate-400"
            />
            <YAxis className="text-slate-600 dark:text-slate-400" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="gross_earnings"
              stroke="#10B981"
              name="Gross"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="net_earnings"
              stroke="#F97316"
              name="Net"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Loads Completed Chart */}
      <div id="earnings-loads-chart-container" className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Loads Completed
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={earningsData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
            <XAxis
              dataKey="date"
              tickFormatter={(date) => format(new Date(date), 'MMM d')}
              className="text-slate-600 dark:text-slate-400"
            />
            <YAxis className="text-slate-600 dark:text-slate-400" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="loads_completed" fill="#3B82F6" name="Loads" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
