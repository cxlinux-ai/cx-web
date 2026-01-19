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
    const { conversation_id, load_id, message, attachments } = body

    if (!message || (!conversation_id && !load_id)) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get user's role and profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    let finalConversationId = conversation_id

    // If no conversation exists, create one
    if (!conversation_id && load_id) {
      const { data: load } = await supabase
        .from('loads')
        .select('company_id')
        .eq('id', load_id)
        .single()

      if (!load) {
        return NextResponse.json({ error: 'Load not found' }, { status: 404 })
      }

      // Get driver ID if user is a driver
      let driverId = null
      if (profile.role === 'driver') {
        const { data: driver } = await supabase
          .from('drivers')
          .select('id')
          .eq('profile_id', user.id)
          .single()
        driverId = driver?.id
      }

      // Create conversation
      const { data: newConversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          load_id,
          company_id: load.company_id,
          driver_id: driverId,
        })
        .select()
        .single()

      if (convError) throw convError

      finalConversationId = newConversation.id
    }

    // Insert message
    const { data: newMessage, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: finalConversationId,
        sender_id: user.id,
        sender_role: profile.role,
        message,
        attachments: attachments || [],
      })
      .select()
      .single()

    if (messageError) throw messageError

    // Create notification for the other party
    const { data: conversation } = await supabase
      .from('conversations')
      .select('company_id, driver_id, loads(id, material_type)')
      .eq('id', finalConversationId)
      .single()

    if (conversation) {
      let recipientId = null

      if (profile.role === 'driver') {
        // Notify company
        const { data: company } = await supabase
          .from('companies')
          .select('owner_id')
          .eq('id', conversation.company_id)
          .single()
        recipientId = company?.owner_id
      } else {
        // Notify driver
        const { data: driver } = await supabase
          .from('drivers')
          .select('profile_id')
          .eq('id', conversation.driver_id)
          .single()
        recipientId = driver?.profile_id
      }

      if (recipientId) {
        await supabase.from('notifications').insert({
          user_id: recipientId,
          type: 'system',
          title: 'New Message',
          message: `You have a new message about load ${conversation.loads?.material_type}`,
          data: {
            conversation_id: finalConversationId,
            message_id: newMessage.id,
          },
        })
      }
    }

    return NextResponse.json({ success: true, message: newMessage })
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
