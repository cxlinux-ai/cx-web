import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { latitude, longitude, heading, speed, accuracy } = await request.json()

    // Get driver ID
    const { data: driver } = await supabase
      .from('drivers')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!driver) {
      return NextResponse.json({ error: 'Driver not found' }, { status: 404 })
    }

    // Update driver's current location
    const { error: updateError } = await supabase
      .from('drivers')
      .update({
        current_lat: latitude,
        current_lng: longitude,
        last_location_update: new Date().toISOString(),
      })
      .eq('id', driver.id)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update location' }, { status: 500 })
    }

    // Get active assignment if exists
    const { data: assignment } = await supabase
      .from('load_assignments')
      .select('id')
      .eq('driver_id', driver.id)
      .in('status', ['accepted', 'in_progress', 'at_pickup', 'loading'])
      .single()

    // Insert location tracking record if driver has active assignment
    if (assignment) {
      await supabase
        .from('location_tracking')
        .insert({
          assignment_id: assignment.id,
          driver_id: driver.id,
          location: `POINT(${longitude} ${latitude})`,
          speed,
          heading: heading || 0,
          accuracy,
          is_moving: speed ? speed > 1 : false,
          timestamp: new Date().toISOString(),
        })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Location update error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
