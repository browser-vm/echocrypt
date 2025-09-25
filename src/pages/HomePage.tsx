import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { ChatPage } from './ChatPage'
import { Loader2 } from 'lucide-react'
export function HomePage() {
  const status = useAuthStore((state) => state.status)
  const navigate = useNavigate()
  const location = useLocation()
  useEffect(() => {
    if (status === 'unauthenticated') {
      // Preserve the intended destination after login
      const from = location.state?.from || '/';
      navigate('/auth', { replace: true, state: { from } })
    }
  }, [status, navigate, location])
  if (status === 'authenticated') {
    return <ChatPage />
  }
  return (
    <div className="h-screen w-screen flex items-center justify-center dark:bg-[rgb(23,24,28)] bg-[rgb(250,250,250)]">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
    </div>
  )
}