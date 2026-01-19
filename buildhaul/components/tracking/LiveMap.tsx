'use client'

import { useEffect, useState, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { createClient } from '@/lib/supabase/client'

interface LiveMapProps {
  assignmentId: string
  pickupLat: number
  pickupLng: number
  deliveryLat: number
  deliveryLng: number
}

interface DriverLocation {
  lat: number
  lng: number
}

export function LiveMap({
  assignmentId,
  pickupLat,
  pickupLng,
  deliveryLat,
  deliveryLng
}: LiveMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const driverMarker = useRef<mapboxgl.Marker | null>(null)
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!mapContainer.current || !process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return

    // Initialize map
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [pickupLng, pickupLat],
      zoom: 12,
    })

    // Add pickup marker
    new mapboxgl.Marker({ color: '#16A34A' })
      .setLngLat([pickupLng, pickupLat])
      .setPopup(new mapboxgl.Popup().setHTML('<h3>Pickup Location</h3>'))
      .addTo(map.current)

    // Add delivery marker
    new mapboxgl.Marker({ color: '#F97316' })
      .setLngLat([deliveryLng, deliveryLat])
      .setPopup(new mapboxgl.Popup().setHTML('<h3>Delivery Location</h3>'))
      .addTo(map.current)

    // Add route line
    map.current.on('load', () => {
      if (!map.current) return

      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [pickupLng, pickupLat],
              [deliveryLng, deliveryLat]
            ]
          }
        }
      })

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#3B82F6',
          'line-width': 4,
          'line-opacity': 0.6
        }
      })
    })

    return () => {
      map.current?.remove()
    }
  }, [pickupLat, pickupLng, deliveryLat, deliveryLng])

  useEffect(() => {
    // Subscribe to real-time location updates
    const subscription = supabase
      .channel(`location:${assignmentId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'location_tracking',
        filter: `assignment_id=eq.${assignmentId}`
      }, (payload) => {
        const location = payload.new as any
        // Parse PostGIS POINT to lat/lng
        const coords = parsePoint(location.location)
        setDriverLocation(coords)

        // Update driver marker
        if (!driverMarker.current && map.current) {
          driverMarker.current = new mapboxgl.Marker({ color: '#0EA5E9' })
            .setLngLat([coords.lng, coords.lat])
            .addTo(map.current)
        } else {
          driverMarker.current?.setLngLat([coords.lng, coords.lat])
        }

        // Center map on driver
        map.current?.flyTo({
          center: [coords.lng, coords.lat],
          zoom: 14
        })
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [assignmentId, supabase])

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0" />

      {driverLocation && (
        <div className="absolute top-4 right-4 bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg">
          <div className="text-sm font-medium text-slate-900 dark:text-white">
            Driver Location
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {driverLocation.lat.toFixed(6)}, {driverLocation.lng.toFixed(6)}
          </div>
        </div>
      )}
    </div>
  )
}

function parsePoint(point: string): DriverLocation {
  // Parse PostGIS POINT(lng lat) format
  const match = point.match(/POINT\(([^ ]+) ([^ ]+)\)/)
  if (!match) return { lat: 0, lng: 0 }
  return {
    lng: parseFloat(match[1]),
    lat: parseFloat(match[2])
  }
}
