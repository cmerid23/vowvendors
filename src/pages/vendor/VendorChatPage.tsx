import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { useChat } from '../../hooks/useChat'
import { useAuthStore } from '../../store/useAuthStore'
import { formatRelativeTime } from '../../utils/formatters'

export function VendorChatPage() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)
  const { messages, loading, sendMessage } = useChat(conversationId)
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    const t = text
    setText('')
    await sendMessage(t)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => navigate('/vendor/inquiries')} className="btn-ghost -ml-2"><ArrowLeft size={16} /> Back</button>
        <h1 className="font-display text-2xl text-ink font-semibold">Conversation</h1>
      </div>

      <div className="flex-1 overflow-y-auto card p-4 space-y-3 mb-4">
        {loading && <div className="text-center text-ink-300 font-body text-sm">Loading messages...</div>}
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm font-body ${isMe ? 'bg-brand text-white rounded-br-sm' : 'bg-blush-100 text-ink rounded-bl-sm'}`}>
                {!isMe && <p className="text-xs font-medium mb-1 opacity-70">{msg.sender_name}</p>}
                <p className="leading-relaxed">{msg.message}</p>
                <p className={`text-xs mt-1 opacity-60 ${isMe ? 'text-right' : ''}`}>{formatRelativeTime(msg.created_at)}</p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="input-field flex-1"
        />
        <button type="submit" disabled={!text.trim()} className="btn-gold px-4 disabled:opacity-50">
          <Send size={16} />
        </button>
      </form>
    </div>
  )
}
