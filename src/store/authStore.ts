import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@shared/types'
import { api } from '@/lib/api-client'
import { toast } from '@/components/ui/sonner'
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'
interface AuthCredentials {
  username: string
  password: string
}
interface AuthState {
  user: User | null
  status: AuthStatus
  token: string | null // Simulate a session token
  register: (credentials: AuthCredentials) => Promise<User>
  login: (credentials: AuthCredentials) => Promise<User>
  logout: () => void
  setStatus: (status: AuthStatus) => void
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      status: 'unauthenticated',
      token: null,
      register: async (credentials) => {
        try {
          const user = await api<User>('/api/register', {
            method: 'POST',
            body: JSON.stringify(credentials),
          })
          set({ user, status: 'authenticated', token: user.id }) // Use user.id as a mock token
          return user
        } catch (error) {
          toast.error((error as Error).message)
          throw error
        }
      },
      login: async (credentials) => {
        try {
          const user = await api<User>('/api/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
          })
          set({ user, status: 'authenticated', token: user.id }) // Use user.id as a mock token
          return user
        } catch (error) {
          toast.error((error as Error).message)
          throw error
        }
      },
      logout: () => {
        // In a real app, you might call an API to invalidate the session
        set({ user: null, status: 'unauthenticated', token: null })
      },
      setStatus: (status) => set({ status }),
    }),
    {
      name: 'echocrypt-auth',
    }
  )
)