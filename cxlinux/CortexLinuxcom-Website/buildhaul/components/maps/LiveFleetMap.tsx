'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { createClient } from '@/lib/supabase/client'
import { Truck, MapPin, ChevronRight, Clock, Package } from 'lucide-react'

interface Load {
  id: string
  status: string
  material_type: string
  pickup_location_name: string
  pickup_lat: number
  pickup_lng: number
  delivery_location_name: string
  delivery_lat: number
  delivery_lng: number
  scheduled_date: string
  rate_amount: number
  trucks_needed: number
  weight_tons: number
}

interface DriverLocation {
  driver_id: string
  latitude: number
  longitude: number
  heading: number
  speed: number
  driver_name?: string
  truck_type?: string
  current_load?: string
  status?: string
}

interface LiveFleetMapProps {
  userRole: 'poster' | 'driver'
  companyId?: string
  driverId?: string
  onLoadSelect?: (load: Load) => void
  onDriverSelect?: (driver: DriverLocation) => void
  showAvailableLoads?: boolean
  showActiveLoads?: boolean
  showDrivers?: boolean
}

export function LiveFleetMap({
  userRole,
  companyId,
  driverId,
  onLoadSelect,
  onDriverSelect,
  showAvailableLoads = true,
  showActiveLoads = true,
  showDrivers = true,
}: LiveFleetMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({})

  const [loads, setLoads] = useState<Load[]>([])
  const [driverLocations, setDriverLocations] = useState<DriverLocation[]>([])
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [stats, setStats] = useState({
    enRoute: 0,
    atPickup: 0,
    loading: 0,
    delivered: 0,
    available: 0
  })

  const supabase = createClient()

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) {
      console.error('Mapbox token not configured')
      return
    }

    mapboxgl.accessToken = token

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-111.8910, 40.7608], // Salt Lake City
      zoom: 10,
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.current.on('load', () => {
      setMapLoaded(true)
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Fetch loads
  const fetchLoads = useCallback(async () => {
    let query = supabase
      .from('loads')
      .select('*')
      .not('pickup_lat', 'is', null)
      .not('pickup_lng', 'is', null)

    if (userRole === 'poster' && companyId) {
      query = query.eq('company_id', companyId)
    } else if (showAvailableLoads) {
      query = query.in('status', ['posted', 'assigned', 'in_progress'])
    }

    const { data, error } = await query.limit(100)

    if (!error && data) {
      setLoads(data as Load[])

      // Calculate stats
      const newStats = {
        enRoute: data.filter(l => l.status === 'in_progress').length,
        atPickup: data.filter(l => l.status === 'at_pickup').length,
        loading: data.filter(l => l.status === 'loading').length,
        delivered: data.filter(l => l.status === 'completed').length,
        available: data.filter(l => l.status === 'posted').length,
      }
      setStats(newStats)
    }
  }, [supabase, userRole, companyId, showAvailableLoads])

  // Fetch driver locations
  const fetchDriverLocations = useCallback(async () => {
    if (!showDrivers || userRole !== 'poster') return

    // Get recent driver locations
    const { data, error } = await supabase
      .from('drivers')
      .select('id, current_lat, current_lng, last_location_update, profile:profiles(full_name)')
      .not('current_lat', 'is', null)
      .not('current_lng', 'is', null)
      .gte('last_location_update', new Date(Date.now() - 30 * 60 * 1000).toISOString())

    if (!error && data) {
      const locations = data.map((driver: any) => ({
        driver_id: driver.id,
        latitude: driver.current_lat,
        longitude: driver.current_lng,
        heading: 0,
        speed: 0,
        driver_name: driver.profile?.full_name,
      }))
      setDriverLocations(locations)
    }
  }, [supabase, showDrivers, userRole])

  // Initial fetch and realtime subscription
  useEffect(() => {
    fetchLoads()
    fetchDriverLocations()

    // Subscribe to realtime updates
    const loadsChannel = supabase
      .channel('loads-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'loads' }, () => {
        fetchLoads()
      })
      .subscribe()

    const driversChannel = supabase
      .channel('driver-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'drivers' }, () => {
        fetchDriverLocations()
      })
      .subscribe()

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchLoads()
      fetchDriverLocations()
    }, 30000)

    return () => {
      supabase.removeChannel(loadsChannel)
      supabase.removeChannel(driversChannel)
      clearInterval(interval)
    }
  }, [fetchLoads, fetchDriverLocations, supabase])

  // Update markers when data changes
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    // Clear old markers
    Object.values(markersRef.current).forEach(marker => marker.remove())
    markersRef.current = {}

    // Add load markers
    loads.forEach(load => {
      if (!load.pickup_lat || !load.pickup_lng) return

      // Pickup marker
      const pickupEl = document.createElement('div')
      pickupEl.className = 'load-marker pickup cursor-pointer'
      pickupEl.innerHTML = `
        <div class="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
          load.status === 'posted' ? 'bg-orange-500' :
          load.status === 'assigned' ? 'bg-yellow-500' :
          load.status === 'in_progress' ? 'bg-blue-500' :
          'bg-green-500'
        } shadow-lg">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
      `

      pickupEl.addEventListener('click', () => {
        setSelectedLoad(load)
        onLoadSelect?.(load)
      })

      const pickupMarker = new mapboxgl.Marker({ element: pickupEl })
        .setLngLat([load.pickup_lng, load.pickup_lat])
        .addTo(map.current!)

      markersRef.current[`pickup-${load.id}`] = pickupMarker

      // Delivery marker
      if (load.delivery_lat && load.delivery_lng) {
        const deliveryEl = document.createElement('div')
        deliveryEl.className = 'load-marker delivery'
        deliveryEl.innerHTML = `
          <div class="w-6 h-6 rounded-full flex items-center justify-center bg-slate-700 border-2 border-white shadow-lg">
            <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
          </div>
        `

        const deliveryMarker = new mapboxgl.Marker({ element: deliveryEl })
          .setLngLat([load.delivery_lng, load.delivery_lat])
          .addTo(map.current!)

        markersRef.current[`delivery-${load.id}`] = deliveryMarker
      }
    })

    // Add driver markers
    driverLocations.forEach(driver => {
      const driverEl = document.createElement('div')
      driverEl.className = 'driver-marker cursor-pointer'
      driverEl.innerHTML = `
        <div class="relative">
          <div class="w-10 h-10 rounded-full bg-blue-600 border-3 border-white shadow-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18 18.5a1.5 1.5 0 01-1.5-1.5 1.5 1.5 0 011.5-1.5 1.5 1.5 0 011.5 1.5 1.5 1.5 0 01-1.5 1.5m1.5-9A2.5 2.5 0 0017 7h-1l-1-2h-3l-1 2h-1a2.5 2.5 0 00-2.5 2.5V17a2.5 2.5 0 002.5 2.5h10a2.5 2.5 0 002.5-2.5V9.5M6 18.5A1.5 1.5 0 014.5 17 1.5 1.5 0 016 15.5 1.5 1.5 0 017.5 17 1.5 1.5 0 016 18.5z"/>
            </svg>
          </div>
        </div>
      `

      driverEl.addEventListener('click', () => {
        onDriverSelect?.(driver)
      })

      const driverMarker = new mapboxgl.Marker({ element: driverEl })
        .setLngLat([driver.longitude, driver.latitude])
        .addTo(map.current!)

      markersRef.current[`driver-${driver.driver_id}`] = driverMarker
    })
  }, [loads, driverLocations, mapLoaded, onLoadSelect, onDriverSelect])

  return (
    <div id="live-fleet-map-container" className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden">
      {/* Map Container */}
      <div ref={mapContainer} className="absolute inset-0" />

      {/* Stats Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Live Fleet Status</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-white">{stats.enRoute} En Route</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm text-white">{stats.atPickup} At Pickup</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-sm text-white">{stats.available} Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-white">{stats.delivered} Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Load Panel */}
      {selectedLoad && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-slate-900/95 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    selectedLoad.status === 'posted' ? 'bg-orange-500/20 text-orange-400' :
                    selectedLoad.status === 'assigned' ? 'bg-yellow-500/20 text-yellow-400' :
                    selectedLoad.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {selectedLoad.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-slate-400 text-sm">{selectedLoad.material_type}</span>
                </div>
                <div className="flex items-center gap-2 text-white mb-1">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span>{selectedLoad.pickup_location_name}</span>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                  <span>{selectedLoad.delivery_location_name}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(selectedLoad.scheduled_date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    {selectedLoad.trucks_needed} trucks
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">
                  ${selectedLoad.rate_amount}
                </div>
                <div className="text-xs text-slate-400">per ton</div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setSelectedLoad(null)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
              <button className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors">
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50">
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-orange-500" />
              <span className="text-slate-300">Available Load</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500" />
              <span className="text-slate-300">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-600 border-2 border-white" />
              <span className="text-slate-300">Driver</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
