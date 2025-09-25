import { AppHeader } from '@/components/AppHeader'
import { MessageInput } from '@/components/chat/MessageInput'
import { MessagePane } from '@/components/chat/MessagePane'
import { RoomList } from '@/components/chat/RoomList'
export function ChatPage() {
  return (
    <div className="dark:bg-[rgb(23,24,28)] bg-[rgb(250,250,250)] text-foreground h-screen w-screen flex flex-col max-w-screen-2xl mx-auto">
      <AppHeader />
      <main className="flex flex-1 overflow-hidden">
        <RoomList />
        <div className="flex flex-col flex-1">
          <MessagePane />
          <MessageInput />
        </div>
      </main>
    </div>
  )
}