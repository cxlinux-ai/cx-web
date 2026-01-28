import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const {
      call_id,
      call_type,
      from_number,
      transcript,
      call_analysis,
      custom_data,
      duration_ms,
    } = body

    // Log the call
    const { data: callLog, error: logError } = await supabase
      .from('voice_calls')
      .insert({
        phone_number: from_number,
        call_type: custom_data?.call_type || 'support',
        transcript,
        summary: call_analysis?.summary,
        data: custom_data,
        duration_seconds: Math.round((duration_ms || 0) / 1000),
        status: 'completed',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (logError) {
      console.error('Failed to log call:', logError)
    }

    // Process based on call type
    if (custom_data?.call_type === 'post_load' && custom_data?.load_data) {
      const loadData = custom_data.load_data

      // Create the load
      const { data: load, error: loadError } = await supabase
        .from('loads')
        .insert({
          status: 'posted',
          material_type: loadData.material_type,
          weight_tons: loadData.weight_tons,
          truck_type_required: loadData.truck_type,
          trucks_needed: loadData.trucks_needed || 1,
          pickup_location_name: loadData.pickup_location,
          pickup_address: loadData.pickup_address,
          pickup_city: loadData.pickup_city || 'Utah',
          pickup_state: 'UT',
          delivery_location_name: loadData.delivery_location,
          delivery_address: loadData.delivery_address,
          delivery_city: loadData.delivery_city || 'Utah',
          delivery_state: 'UT',
          scheduled_date: loadData.date || new Date().toISOString().split('T')[0],
          pickup_time_start: loadData.time_start || '07:00',
          pricing_type: loadData.pricing_type || 'per_ton',
          rate_amount: loadData.rate_amount,
          notes: loadData.special_instructions,
          source: 'voice_call',
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (!loadError && load) {
        // Update call log with load ID
        if (callLog) {
          await supabase
            .from('voice_calls')
            .update({ load_id: load.id })
            .eq('id', callLog.id)
        }

        return NextResponse.json({
          success: true,
          action: 'load_created',
          load_id: load.id,
          message: 'Load posted successfully via voice call',
        })
      }
    }

    if (custom_data?.call_type === 'find_load' && custom_data?.driver_data) {
      const driverData = custom_data.driver_data

      // Find matching loads
      let query = supabase
        .from('loads')
        .select('*')
        .eq('status', 'posted')
        .gte('scheduled_date', new Date().toISOString().split('T')[0])

      if (driverData.truck_type) {
        query = query.eq('truck_type_required', driverData.truck_type)
      }

      const { data: loads } = await query.limit(5)

      return NextResponse.json({
        success: true,
        action: 'loads_found',
        available_loads: loads?.length || 0,
        loads: loads?.map(l => ({
          id: l.id,
          material: l.material_type,
          pickup: l.pickup_location_name,
          delivery: l.delivery_location_name,
          rate: l.rate_amount,
          date: l.scheduled_date,
        })),
      })
    }

    if (custom_data?.call_type === 'register_driver') {
      const regData = custom_data.registration_data

      // Create voice registration record (to be followed up)
      await supabase
        .from('voice_actions')
        .insert({
          action_type: 'driver_registration',
          phone_number: from_number,
          data: regData,
          status: 'pending',
          created_at: new Date().toISOString(),
        })

      return NextResponse.json({
        success: true,
        action: 'registration_logged',
        message: 'Driver registration received - will follow up via SMS',
      })
    }

    return NextResponse.json({ success: true, action: 'call_logged' })

  } catch (error) {
    console.error('Retell webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
