'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Paperclip } from 'lucide-react'

interface Message {
  id: string
  sender_role: string
  message: string
  created_at: string
}

interface ChatInterfaceProps {
  conversationId?: string
  loadId?: string
}

export function ChatInterface({ conversationId, loadId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (conversationId) {
      loadMessages()
      const cleanup = subscribeToMessages()
      return cleanup
    }
  }, [conversationId])

  async function loadMessages() {
    if (!conversationId) return

    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (data) setMessages(data as Message[])
  }

  function subscribeToMessages() {
    if (!conversationId) return () => {}

    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as Message])
        scrollToBottom()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }

  async function sendMessage() {
    if (!newMessage.trim()) return

    setSending(true)
    try {
      await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId,
          load_id: loadId,
          message: newMessage
        })
      })

      setNewMessage('')
    } catch (error) {
      console.error('Send error:', error)
    } finally {
      setSending(false)
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div id="chat-interface-container" className="flex flex-col h-[600px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
      {/* Messages */}
      <div id="chat-messages-container" className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            id={`message-${msg.id}`}
            className={`flex ${msg.sender_role === 'driver' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[70%] rounded-lg p-3 ${
              msg.sender_role === 'driver'
                ? 'bg-buildhaul-orange text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
            }`}>
              <p className="text-sm">{msg.message}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {new Date(msg.created_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div id="chat-input-container" className="border-t border-slate-200 dark:border-slate-800 p-4">
        <div className="flex gap-2">
          <button id="chat-attach-button" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
            <Paperclip className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <input
            id="chat-message-input"
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg focus:ring-2 focus:ring-buildhaul-orange outline-none"
          />
          <button
            id="chat-send-button"
            onClick={sendMessage}
            disabled={sending}
            className="px-4 py-2 bg-buildhaul-orange text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
