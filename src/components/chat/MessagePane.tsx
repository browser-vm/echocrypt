import { useEffect, useRef } from 'react'
import { UserPlus, Hash } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { useRoomStore } from '@/store/roomStore'
import { toast } from '@/components/ui/sonner'

const EMPTY_MESSAGES: any[] = []

export function MessagePane() {
  const currentUser = useAuthStore((state) => state.user)
  const activeRoomId = useRoomStore((state) => state.activeRoomId)
  const getRoomById = useRoomStore((state) => state.getRoomById)
  const messages = useRoomStore((state) => (activeRoomId ? state.messagesByRoom[activeRoomId] : EMPTY_MESSAGES)) || EMPTY_MESSAGES
  const roomKeys = useRoomStore((state) => state.roomKeys)
  const activeRoom = getRoomById(activeRoomId)
  const viewportRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight
    }
  }, [messages, activeRoomId])
  const handleInvite = () => {
    if (!activeRoom || !activeRoomId) return
    const roomKey = roomKeys[activeRoomId]
    if (!roomKey) {
      toast.error('Cannot generate invite: room key is missing.')
      return
    }
    const inviteLink = `${window.location.origin}/invite/${activeRoom.id}#${roomKey}`
    navigator.clipboard.writeText(inviteLink).then(() => {
      toast.success('Invite link copied to clipboard!')
    }).catch(err => {
      console.error('Failed to copy invite link: ', err)
      toast.error('Could not copy link. Please try again.')
    })
  }
  if (!activeRoom) {
    return (
      <div className="flex flex-col h-full flex-1 bg-background items-center justify-center">
        <div className="text-center">
          <Hash className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium text-foreground">No Room Selected</h3>
          <p className="mt-1 text-sm text-muted-foreground">Select a room from the sidebar or create a new one.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col h-full flex-1 bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <Hash className="h-6 w-6 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{activeRoom.name}</h2>
        </div>
        <Button variant="outline" onClick={handleInvite}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite
        </Button>
      </div>
      <ScrollArea className="flex-1" viewportRef={viewportRef}>
        <div className="p-4 space-y-6">
          {messages.map((message, index) => {
            const prevMessage = messages[index - 1]
            const showAvatarAndName = !prevMessage || prevMessage.sender.id !== message.sender.id
            const isOwnMessage = message.sender.id === currentUser?.id
            return (
              <div
                key={message.id}
                className={cn(
                  'flex items-start gap-3',
                  isOwnMessage ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                <Avatar className={cn('h-10 w-10', !showAvatarAndName && 'opacity-0')}>
                  <AvatarImage src={message.sender.avatar} />
                  <AvatarFallback>{message.sender.username?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className={cn('flex flex-col gap-1', isOwnMessage ? 'items-end' : 'items-start')}>
                  {showAvatarAndName && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{message.sender.username}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  <div
                    className={cn(
                      'p-3 rounded-lg max-w-md md:max-w-lg',
                      isOwnMessage
                        ? 'bg-indigo-500 text-white rounded-br-none'
                        : 'bg-muted rounded-bl-none'
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <ScrollBar />
      </ScrollArea>
    </div>
  )
}