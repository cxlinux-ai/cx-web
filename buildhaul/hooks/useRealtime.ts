'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

export function useRealtimeLoads(filters?: { status?: string[] }) {
  const [loads, setLoads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    let channel: RealtimeChannel

    const fetchLoads = async () => {
      let query = supabase.from('loads').select('*, companies(name)')

      if (filters?.status) {
        query = query.in('status', filters.status)
      }

      const { data } = await query.order('created_at', { ascending: false })
      setLoads(data || [])
      setLoading(false)
    }

    fetchLoads()

    // Subscribe to realtime changes
    channel = supabase
      .channel('loads_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loads',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLoads((current) => [payload.new as any, ...current])
          } else if (payload.eventType === 'UPDATE') {
            setLoads((current) =>
              current.map((load) => (load.id === payload.new.id ? { ...load, ...payload.new } : load))
            )
          } else if (payload.eventType === 'DELETE') {
            setLoads((current) => current.filter((load) => load.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [filters?.status])

  return { loads, loading }
}

export function useRealtimeBids(loadId: string) {
  const [bids, setBids] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    let channel: RealtimeChannel

    const fetchBids = async () => {
      const { data } = await supabase
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
        .eq('load_id', loadId)
        .order('created_at', { ascending: false })

      setBids(data || [])
      setLoading(false)
    }

    fetchBids()

    // Subscribe to new bids
    channel = supabase
      .channel(`bids_${loadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bids',
          filter: `load_id=eq.${loadId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            fetchBids() // Refetch to get driver info
          } else if (payload.eventType === 'UPDATE') {
            setBids((current) =>
              current.map((bid) => (bid.id === payload.new.id ? { ...bid, ...payload.new } : bid))
            )
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [loadId])

  return { bids, loading }
}

export function useRealtimeAssignment(assignmentId: string | null) {
  const [assignment, setAssignment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!assignmentId) {
      setLoading(false)
      return
    }

    let channel: RealtimeChannel

    const fetchAssignment = async () => {
      const { data } = await supabase
        .from('load_assignments')
        .select('*')
        .eq('id', assignmentId)
        .single()

      setAssignment(data)
      setLoading(false)
    }

    fetchAssignment()

    // Subscribe to assignment updates
    channel = supabase
      .channel(`assignment_${assignmentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'load_assignments',
          filter: `id=eq.${assignmentId}`,
        },
        (payload) => {
          setAssignment((current: any) => ({ ...current, ...payload.new }))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [assignmentId])

  return { assignment, loading }
}

export function useRealtimeNotifications(userId: string) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    let channel: RealtimeChannel

    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      setNotifications(data || [])
      setUnreadCount((data || []).filter(n => !n.read).length)
    }

    fetchNotifications()

    // Subscribe to new notifications
    channel = supabase
      .channel(`notifications_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((current) => [payload.new as any, ...current])
          setUnreadCount((current) => current + 1)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((current) =>
            current.map((n) => (n.id === payload.new.id ? { ...n, ...payload.new } : n))
          )
          if ((payload.new as any).read) {
            setUnreadCount((current) => Math.max(0, current - 1))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
  }

  const markAllAsRead = async () => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)
  }

  return { notifications, unreadCount, markAsRead, markAllAsRead }
}
