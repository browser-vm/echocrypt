export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
}
export interface User {
  id: string
  username: string
  avatar?: string
  passwordHash?: string // Only for backend use
}
export interface Room {
  id: string
  name: string
  userIds: string[]
  ownerId: string
}
export interface ChatMessage {
  id: string
  roomId: string
  senderId: string
  ciphertext: string
  timestamp: number
}
// For frontend display after decryption
export interface DecryptedMessage {
  id: string
  roomId: string
  sender: User
  text: string
  timestamp: number
  isOwnMessage: boolean
}