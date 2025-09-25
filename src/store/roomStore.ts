import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Room, DecryptedMessage, ChatMessage, User } from '@shared/types'
import { api } from '@/lib/api-client'
import { generateRoomKey, encryptMessage, decryptMessage } from '@/lib/crypto'
import { useAuthStore } from './authStore'
interface RoomState {
  rooms: Room[]
  activeRoomId: string | null
  roomKeys: Record<string, string> // roomId -> key
  messagesByRoom: Record<string, DecryptedMessage[]>
  usersInRooms: Record<string, Record<string, User>> // roomId -> userId -> User
  fetchingStatus: Record<string, boolean> // roomId -> isFetching
  pollingInterval: number | null
  fetchRooms: () => Promise<void>
  createRoom: (name: string) => Promise<Room>
  setActiveRoomId: (roomId: string | null) => void
  getRoomById: (roomId: string | null) => Room | undefined
  addRoomKey: (roomId: string, key: string) => void
  sendMessage: (plaintext: string) => Promise<void>
  fetchMessages: (roomId: string) => Promise<void>
  startPolling: () => void
  stopPolling: () => void
}
export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      rooms: [],
      activeRoomId: null,
      roomKeys: {},
      messagesByRoom: {},
      usersInRooms: {},
      fetchingStatus: {},
      pollingInterval: null,
      fetchRooms: async () => {
        try {
          const rooms = await api<Room[]>('/api/rooms')
          set({ rooms })
          if (!get().activeRoomId && rooms.length > 0) {
            get().setActiveRoomId(rooms[0].id)
          }
        } catch (error) {
          console.error('Failed to fetch rooms:', error)
        }
      },
      createRoom: async (name: string) => {
        const newRoom = await api<Room>('/api/rooms', {
          method: 'POST',
          body: JSON.stringify({ name }),
        })
        const newKey = await generateRoomKey()
        set((state) => ({
          rooms: [...state.rooms, newRoom],
          roomKeys: { ...state.roomKeys, [newRoom.id]: newKey },
        }))
        return newRoom
      },
      setActiveRoomId: (roomId) => {
        get().stopPolling()
        set({ activeRoomId: roomId })
        if (roomId) {
          get().fetchMessages(roomId)
          get().startPolling()
        }
      },
      getRoomById: (roomId) => {
        if (!roomId) return undefined
        return get().rooms.find((room) => room.id === roomId)
      },
      addRoomKey: (roomId, key) => {
        set((state) => ({
          roomKeys: { ...state.roomKeys, [roomId]: key },
        }))
      },
      sendMessage: async (plaintext) => {
        const { activeRoomId, roomKeys } = get()
        const currentUser = useAuthStore.getState().user
        if (!activeRoomId || !roomKeys[activeRoomId] || !currentUser) return
        const key = roomKeys[activeRoomId]
        const ciphertext = await encryptMessage(key, plaintext)
        await api(`/api/rooms/${activeRoomId}/messages`, {
          method: 'POST',
          body: JSON.stringify({ ciphertext }),
        })
        // Fetch immediately for responsiveness
        get().fetchMessages(activeRoomId)
      },
      fetchMessages: async (roomId) => {
        if (get().fetchingStatus[roomId]) return // Prevent concurrent fetches
        const { roomKeys } = get()
        const key = roomKeys[roomId]
        if (!key) return // Can't decrypt without a key
        try {
          set(state => ({ fetchingStatus: { ...state.fetchingStatus, [roomId]: true } }))
          const encryptedMessages = await api<ChatMessage[]>(`/api/rooms/${roomId}/messages`)
          const currentUser = useAuthStore.getState().user
          // Fetch user details for senders if not already cached
          const senderIds = [...new Set(encryptedMessages.map(m => m.senderId))];
          const currentRoomUsers = get().usersInRooms[roomId] || {};
          const newUsersToFetch = senderIds.filter(id => !currentRoomUsers[id]);
          if (newUsersToFetch.length > 0) {
            const users = await api<User[]>(`/api/users?ids=${newUsersToFetch.join(',')}`);
            const usersMap = users.reduce((acc, user) => {
              acc[user.id] = user;
              return acc;
            }, {} as Record<string, User>);
            set(state => ({
              usersInRooms: {
                ...state.usersInRooms,
                [roomId]: { ...state.usersInRooms[roomId], ...usersMap }
              }
            }));
          }
          const decryptedMessages: DecryptedMessage[] = await Promise.all(
            encryptedMessages.map(async (msg) => {
              const text = await decryptMessage(key, msg.ciphertext)
              const sender = get().usersInRooms[roomId]?.[msg.senderId] || { id: msg.senderId, username: 'Unknown' };
              return {
                id: msg.id,
                roomId: msg.roomId,
                sender,
                text,
                timestamp: msg.timestamp,
                isOwnMessage: msg.senderId === currentUser?.id,
              }
            })
          )
          set((state) => ({
            messagesByRoom: { ...state.messagesByRoom, [roomId]: decryptedMessages },
          }))
        } catch (error) {
          console.error(`Failed to fetch/decrypt messages for room ${roomId}:`, error)
        } finally {
          set(state => ({ fetchingStatus: { ...state.fetchingStatus, [roomId]: false } }))
        }
      },
      startPolling: () => {
        get().stopPolling() // Ensure no multiple intervals running
        const intervalId = setInterval(() => {
          const { activeRoomId } = get()
          if (activeRoomId) {
            get().fetchMessages(activeRoomId)
          }
        }, 3000) // Poll every 3 seconds
        set({ pollingInterval: intervalId as unknown as number })
      },
      stopPolling: () => {
        const { pollingInterval } = get()
        if (pollingInterval) {
          clearInterval(pollingInterval)
          set({ pollingInterval: null })
        }
      },
    }),
    {
      name: 'echocrypt-room-storage',
      partialize: (state) => ({
        rooms: state.rooms,
        activeRoomId: state.activeRoomId,
        roomKeys: state.roomKeys,
      }),
    }
  )
)