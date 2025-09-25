import { IndexedEntity } from "./core-utils";
import type { User, Room, ChatMessage } from "@shared/types";
import type { Env as CoreEnv } from './core-utils';
export class UserEntity extends IndexedEntity<User> {
  static readonly entityName = "user";
  static readonly indexName = "users";
  static readonly initialState: User = { id: "", username: "", passwordHash: "" };
  static async getByUsername(env: CoreEnv, username: string): Promise<UserEntity | null> {
    // This is a secondary lookup. The primary key is `id`.
    // For this simple app, we assume username is unique and can be used for lookup.
    // A real app would need a secondary index (username -> id).
    // Here, we'll just instantiate by username, assuming it's the ID.
    const user = new UserEntity(env, username);
    if (await user.exists()) {
      return user;
    }
    return null;
  }
}
export type RoomState = Room & {
  messages: ChatMessage[];
};
export class RoomEntity extends IndexedEntity<RoomState> {
  static readonly entityName = "room";
  static readonly indexName = "rooms";
  static readonly initialState: RoomState = {
    id: "",
    name: "",
    ownerId: "",
    userIds: [],
    messages: []
  };
  async addUser(userId: string): Promise<void> {
    await this.mutate((s) => {
      if (!s.userIds.includes(userId)) {
        return { ...s, userIds: [...s.userIds, userId] };
      }
      return s;
    });
  }
  async addMessage(senderId: string, ciphertext: string): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: crypto.randomUUID(),
      roomId: this.id,
      senderId,
      ciphertext,
      timestamp: Date.now()
    };
    await this.mutate((s) => ({ ...s, messages: [...s.messages, message] }));
    return message;
  }
  async getMessages(): Promise<ChatMessage[]> {
    const state = await this.getState();
    return state.messages;
  }
}