import { useState } from 'react'
import { SendHorizonal, Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRoomStore } from '@/store/roomStore'
export function MessageInput() {
  const [message, setMessage] = useState('')
  const sendMessage = useRoomStore((state) => state.sendMessage)
  const activeRoomId = useRoomStore((state) => state.activeRoomId)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !activeRoomId) return
    sendMessage(message.trim())
    setMessage('')
  }
  return (
    <div className="p-4 border-t bg-card">
      <form
        onSubmit={handleSubmit}
        className="relative"
      >
        <Input
          placeholder={activeRoomId ? "Type a message..." : "Select a room to start chatting"}
          className="pr-24 h-12 rounded-lg"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={!activeRoomId}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon" className="text-muted-foreground" disabled={!activeRoomId}>
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button type="submit" size="icon" className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-md" disabled={!activeRoomId || !message.trim()}>
            <SendHorizonal className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </div>
  )
}