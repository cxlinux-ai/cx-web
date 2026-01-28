'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Load = Database['public']['Tables']['loads']['Row']

export function useLoads(filters?: {
  status?: Load['status'][]
  companyId?: string
  urgent?: boolean
}) {
  const [loads, setLoads] = useState<Load[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchLoads()
  }, [filters])

  async function fetchLoads() {
    try {
      setLoading(true)
      let query = supabase.from('loads').select('*')

      if (filters?.status) {
        query = query.in('status', filters.status)
      }

      if (filters?.companyId) {
        query = query.eq('company_id', filters.companyId)
      }

      if (filters?.urgent !== undefined) {
        query = query.eq('urgent', filters.urgent)
      }

      query = query.order('created_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error
      setLoads(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch loads')
    } finally {
      setLoading(false)
    }
  }

  return { loads, loading, error, refetch: fetchLoads }
}

export function useLoad(id: string) {
  const [load, setLoad] = useState<Load | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchLoad()
  }, [id])

  async function fetchLoad() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('loads')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setLoad(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch load')
    } finally {
      setLoading(false)
    }
  }

  return { load, loading, error, refetch: fetchLoad }
}
