'use client'

import { useEffect, useRef } from 'react'
import { MapPin } from 'lucide-react'

interface LoadMapProps {
  pickupCoordinates: string
  deliveryCoordinates: string
  showRoute?: boolean
}

export function LoadMap({ pickupCoordinates, deliveryCoordinates, showRoute = true }: LoadMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)

  // Parse geography points
  const parseCoords = (geog: string) => {
    const match = geog.match(/POINT\(([^ ]+) ([^ ]+)\)/)
    if (!match) return null
    return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) }
  }

  const pickup = parseCoords(pickupCoordinates)
  const delivery = parseCoords(deliveryCoordinates)

  useEffect(() => {
    if (!pickup || !delivery || !mapContainer.current) return

    // Check if Mapbox GL JS is available
    if (typeof window !== 'undefined' && (window as any).mapboxgl) {
      const mapboxgl = (window as any).mapboxgl
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [(pickup.lng + delivery.lng) / 2, (pickup.lat + delivery.lat) / 2],
        zoom: 10,
      })

      // Add pickup marker
      new mapboxgl.Marker({ color: '#22c55e' })
        .setLngLat([pickup.lng, pickup.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<h3>Pickup Location</h3>'))
        .addTo(map)

      // Add delivery marker
      new mapboxgl.Marker({ color: '#ef4444' })
        .setLngLat([delivery.lng, delivery.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<h3>Delivery Location</h3>'))
        .addTo(map)

      // Fit bounds to show both markers
      const bounds = new mapboxgl.LngLatBounds()
      bounds.extend([pickup.lng, pickup.lat])
      bounds.extend([delivery.lng, delivery.lat])
      map.fitBounds(bounds, { padding: 50 })

      if (showRoute) {
        // Fetch and display route
        fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${pickup.lng},${pickup.lat};${delivery.lng},${delivery.lat}?geometries=geojson&access_token=${mapboxgl.accessToken}`
        )
          .then(res => res.json())
          .then(data => {
            if (data.routes && data.routes[0]) {
              map.on('load', () => {
                map.addLayer({
                  id: 'route',
                  type: 'line',
                  source: {
                    type: 'geojson',
                    data: {
                      type: 'Feature',
                      properties: {},
                      geometry: data.routes[0].geometry,
                    },
                  },
                  layout: {
                    'line-join': 'round',
                    'line-cap': 'round',
                  },
                  paint: {
                    'line-color': '#1e3a5f',
                    'line-width': 4,
                  },
                })
              })
            }
          })
      }

      return () => map.remove()
    }
  }, [pickup, delivery, showRoute])

  if (!pickup || !delivery) {
    return (
      <div className="bg-slate-100 rounded-lg h-96 flex items-center justify-center border">
        <p className="text-gray-500">Invalid coordinates</p>
      </div>
    )
  }

  return (
    <>
      <script src="https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.js"></script>
      <link href="https://api.mapbox.com/mapbox-gl-js/v3.0.0/mapbox-gl.css" rel="stylesheet" />
      <div ref={mapContainer} className="rounded-lg h-96 border" />
    </>
  )
}

// Fallback static map component
export function LoadMapStatic({ pickupCoordinates, deliveryCoordinates }: LoadMapProps) {
  const parseCoords = (geog: string) => {
    const match = geog.match(/POINT\(([^ ]+) ([^ ]+)\)/)
    if (!match) return null
    return { lng: parseFloat(match[1]), lat: parseFloat(match[2]) }
  }

  const pickup = parseCoords(pickupCoordinates)
  const delivery = parseCoords(deliveryCoordinates)

  if (!pickup || !delivery) return null

  return (
    <div className="bg-slate-100 rounded-lg h-96 flex flex-col items-center justify-center border p-6">
      <div className="text-center space-y-4">
        <MapPin className="h-12 w-12 mx-auto text-gray-400" />
        <div className="space-y-2">
          <div className="flex items-center gap-2 justify-center">
            <div className="bg-green-500 rounded-full w-3 h-3" />
            <span className="text-sm">
              Pickup: {pickup.lat.toFixed(4)}, {pickup.lng.toFixed(4)}
            </span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <div className="bg-red-500 rounded-full w-3 h-3" />
            <span className="text-sm">
              Delivery: {delivery.lat.toFixed(4)}, {delivery.lng.toFixed(4)}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-500">Interactive map available when Mapbox token is configured</p>
      </div>
    </div>
  )
}
