import { useEffect } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useRoomStore } from '@/store/roomStore'
import { api } from '@/lib/api-client'
import { toast } from '@/components/ui/sonner'
export function InvitePage() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const status = useAuthStore((state) => state.status)
  const setActiveRoomId = useRoomStore((state) => state.setActiveRoomId)
  const fetchRooms = useRoomStore((state) => state.fetchRooms)
  const addRoomKey = useRoomStore((state) => state.addRoomKey)
  useEffect(() => {
    const handleInvite = async () => {
      const roomKey = location.hash.substring(1) // Get key from URL fragment (#)
      if (status === 'authenticated' && user && roomId && roomKey) {
        try {
          toast.info('Joining room...')
          addRoomKey(roomId, roomKey)
          await api(`/api/rooms/${roomId}/join`, { method: 'POST' })
          await fetchRooms() // Refresh room list
          setActiveRoomId(roomId)
          toast.success('Successfully joined room!')
          navigate('/')
        } catch (error) {
          console.error('Failed to join room:', error)
          toast.error('Failed to join room. You may already be a member.')
          navigate('/')
        }
      } else if (status === 'unauthenticated') {
        // Redirect to login, but store the invite to be handled after login
        navigate('/auth', { state: { from: location.pathname + location.hash } })
      } else if (status === 'authenticated' && !roomKey) {
        toast.error('Invalid invite link: missing encryption key.')
        navigate('/')
      }
    }
    if (status !== 'loading') {
      handleInvite()
    }
  }, [status, user, roomId, navigate, setActiveRoomId, fetchRooms, addRoomKey, location])
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center dark:bg-[rgb(23,24,28)] bg-[rgb(250,250,250)]">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
      <h1 className="text-2xl font-bold">Processing Invite...</h1>
      <p className="text-muted-foreground">Please wait while we add you to the room.</p>
    </div>
  )
}