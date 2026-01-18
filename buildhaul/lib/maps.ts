// Map utility functions

export interface Coordinates {
  lat: number
  lng: number
}

export function coordinatesToGeography(coords: Coordinates): string {
  return `POINT(${coords.lng} ${coords.lat})`
}

export function geographyToCoordinates(geography: string): Coordinates | null {
  const match = geography.match(/POINT\(([^ ]+) ([^ ]+)\)/)
  if (!match) return null
  return {
    lng: parseFloat(match[1]),
    lat: parseFloat(match[2]),
  }
}

export function calculateDistance(
  from: Coordinates,
  to: Coordinates
): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRad(to.lat - from.lat)
  const dLon = toRad(to.lng - from.lng)
  const lat1 = toRad(from.lat)
  const lat2 = toRad(to.lat)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180)
}

export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  try {
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        address
      )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
    )
    const data = await response.json()
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center
      return { lat, lng }
    }
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}
