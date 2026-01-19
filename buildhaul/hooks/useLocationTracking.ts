'use client'

import { useEffect, useRef } from 'react'

export function useLocationTracking(enabled: boolean = true, intervalMs: number = 30000) {
  const watchIdRef = useRef<number | null>(null)

  useEffect(() => {
    if (!enabled || !navigator.geolocation) return

    const sendLocation = async (position: GeolocationPosition) => {
      try {
        await fetch('/api/driver/location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            heading: position.coords.heading,
            speed: position.coords.speed ? position.coords.speed * 2.237 : null, // m/s to mph
            accuracy: position.coords.accuracy,
          }),
        })
      } catch (error) {
        console.error('Failed to send location:', error)
      }
    }

    // Get initial position
    navigator.geolocation.getCurrentPosition(sendLocation, console.error, {
      enableHighAccuracy: true,
    })

    // Watch position continuously
    watchIdRef.current = navigator.geolocation.watchPosition(
      sendLocation,
      console.error,
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      }
    )

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [enabled, intervalMs])
}
