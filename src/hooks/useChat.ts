import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { ChatMessage } from '../types/database'
import { useAuthStore } from '../store/useAuthStore'

export function useChat(contactRequestId: string | undefined) {
  const user = useAuthStore((s) => s.user)
  const profile = useAuthStore((s) => s.profile)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!contactRequestId) return
    supabase
      .from('chat_messages')
      .select('*')
      .eq('contact_request_id', contactRequestId)
      .order('created_at')
      .then(({ data }) => {
        setMessages(data || [])
        setLoading(false)
      })

    const channel = supabase
      .channel(`chat:${contactRequestId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `contact_request_id=eq.${contactRequestId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as ChatMessage])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [contactRequestId])

  const sendMessage = useCallback(async (text: string) => {
    if (!contactRequestId || !user || !profile) return
    await supabase.from('chat_messages').insert({
      contact_request_id: contactRequestId,
      sender_id: user.id,
      sender_name: profile.full_name || profile.email,
      message: text,
    })
  }, [contactRequestId, user, profile])

  return { messages, loading, sendMessage }
}
