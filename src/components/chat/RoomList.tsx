import { useEffect, useState } from 'react'
import { PlusCircle, Hash, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useRoomStore } from '@/store/roomStore'
import { toast } from '@/components/ui/sonner'
export function RoomList() {
  const rooms = useRoomStore((state) => state.rooms)
  const activeRoomId = useRoomStore((state) => state.activeRoomId)
  const setActiveRoomId = useRoomStore((state) => state.setActiveRoomId)
  const fetchRooms = useRoomStore((state) => state.fetchRooms)
  const createRoom = useRoomStore((state) => state.createRoom)
  const [isCreating, setIsCreating] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  useEffect(() => {
    fetchRooms()
  }, [fetchRooms])
  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      toast.error('Room name cannot be empty.')
      return
    }
    setIsCreating(true)
    try {
      const newRoom = await createRoom(newRoomName.trim())
      toast.success(`Room "${newRoom.name}" created!`)
      setActiveRoomId(newRoom.id)
      setNewRoomName('')
      setIsDialogOpen(false)
    } catch (error) {
      toast.error('Failed to create room.')
      console.error(error)
    } finally {
      setIsCreating(false)
    }
  }
  return (
    <div className="w-full max-w-xs flex-shrink-0 bg-muted/30 flex flex-col h-full border-r">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold tracking-tight">Rooms</h2>
      </div>
      <ScrollArea className="flex-1">
        <nav className="p-2 space-y-1">
          {rooms.map((room) => (
            <Button
              key={room.id}
              variant="ghost"
              onClick={() => setActiveRoomId(room.id)}
              className={cn(
                'w-full justify-start text-left h-10 px-3',
                activeRoomId === room.id && 'bg-primary/10 text-primary font-semibold'
              )}
            >
              <Hash className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">{room.name}</span>
            </Button>
          ))}
        </nav>
      </ScrollArea>
      <div className="p-4 border-t mt-auto">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-indigo-500 hover:bg-indigo-600 text-white">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Room
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create a new room</DialogTitle>
              <DialogDescription>
                Give your new room a name. You can invite others later.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., project-discussions"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreateRoom} disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Room
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}