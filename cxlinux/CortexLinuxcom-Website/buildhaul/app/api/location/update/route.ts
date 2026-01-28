import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      assignment_id,
      latitude,
      longitude,
      speed,
      heading,
      accuracy,
      battery_level,
      is_moving,
    } = body

    // Validate required fields
    if (!assignment_id || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get driver ID from user
    const { data: driver } = await supabase
      .from('drivers')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!driver) {
      return NextResponse.json(
        { error: 'Driver not found' },
        { status: 404 }
      )
    }

    // Insert location update
    const { data: location, error: locationError } = await supabase
      .from('location_tracking')
      .insert({
        assignment_id,
        driver_id: driver.id,
        location: `POINT(${longitude} ${latitude})`,
        speed,
        heading,
        accuracy,
        battery_level,
        is_moving,
      })
      .select()
      .single()

    if (locationError) {
      throw locationError
    }

    // Update driver's current location
    await supabase
      .from('drivers')
      .update({
        current_location: `POINT(${longitude} ${latitude})`,
      })
      .eq('id', driver.id)

    // Check geofences and auto-update status
    await checkGeofences(supabase, assignment_id, latitude, longitude)

    return NextResponse.json({ success: true, location })
  } catch (error) {
    console.error('Location update error:', error)
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    )
  }
}

async function checkGeofences(
  supabase: any,
  assignmentId: string,
  lat: number,
  lon: number
) {
  try {
    // Get load details
    const { data: assignment } = await supabase
      .from('load_assignments')
      .select(
        `
        *,
        loads (
          pickup_coordinates,
          delivery_coordinates
        )
      `
      )
      .eq('id', assignmentId)
      .single()

    if (!assignment) return

    const GEOFENCE_RADIUS_METERS = 100 // 100 meters

    // Check if driver is at pickup location
    const distanceToPickup = await calculateDistance(
      supabase,
      lat,
      lon,
      assignment.loads.pickup_coordinates
    )

    if (distanceToPickup <= GEOFENCE_RADIUS_METERS) {
      if (
        assignment.status === 'en_route_pickup' ||
        assignment.status === 'accepted'
      ) {
        // Arrived at pickup
        await supabase
          .from('load_assignments')
          .update({
            status: 'at_pickup',
            pickup_arrived_at: new Date().toISOString(),
          })
          .eq('id', assignmentId)

        // Log geofence event
        await supabase.from('geofence_events').insert({
          assignment_id: assignmentId,
          event_type: 'entered_pickup',
          location: `POINT(${lon} ${lat})`,
        })
      }
    }

    // Check if driver is at delivery location
    const distanceToDelivery = await calculateDistance(
      supabase,
      lat,
      lon,
      assignment.loads.delivery_coordinates
    )

    if (distanceToDelivery <= GEOFENCE_RADIUS_METERS) {
      if (
        assignment.status === 'en_route_delivery' ||
        assignment.status === 'loaded'
      ) {
        // Arrived at delivery
        await supabase
          .from('load_assignments')
          .update({
            status: 'at_delivery',
            delivery_arrived_at: new Date().toISOString(),
          })
          .eq('id', assignmentId)

        // Log geofence event
        await supabase.from('geofence_events').insert({
          assignment_id: assignmentId,
          event_type: 'entered_delivery',
          location: `POINT(${lon} ${lat})`,
        })
      }
    }
  } catch (error) {
    console.error('Geofence check error:', error)
  }
}

async function calculateDistance(
  supabase: any,
  lat: number,
  lon: number,
  targetPoint: any
): Promise<number> {
  try {
    // Use PostGIS to calculate distance
    const { data } = await supabase.rpc('calculate_distance_meters', {
      lat1: lat,
      lon1: lon,
      point2: targetPoint,
    })

    return data || Infinity
  } catch (error) {
    console.error('Distance calculation error:', error)
    return Infinity
  }
}
