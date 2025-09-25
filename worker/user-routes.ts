import { Hono, type Context, type Next } from "hono";
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { Env } from './core-utils';
import { UserEntity, RoomEntity, RoomState } from "./entities";
import { ok, bad, notFound } from './core-utils';
import type { User } from "@shared/types";
// Simple password hashing - in a real app, use a library like bcrypt
const hashPassword = async (password: string, salt: string) => {
  const data = new TextEncoder().encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
};
// Middleware to simulate getting an authenticated user from a token (header)
const getAuthUser = () => {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header('Authorization');
    if (authHeader) {
      const userId = authHeader.split('Bearer ')[1];
      if (userId) {
        c.set('userId', userId);
      }
    }
    await next();
  };
};
export function userRoutes(app: Hono<{ Bindings: Env, Variables: { userId: string } }>) {
  app.use('/api/*', getAuthUser());
  // === AUTH ROUTES ===
  const authSchema = z.object({
    username: z.string().min(3).max(20),
    password: z.string().min(6),
  });
  app.post('/api/register', zValidator('json', authSchema), async (c) => {
    const { username, password } = c.req.valid('json');
    // We use username as the entity ID for simplicity, assuming it's unique.
    const existingUser = new UserEntity(c.env, username);
    if (await existingUser.exists()) {
      return bad(c, 'Username already taken');
    }
    const passwordHash = await hashPassword(password, username);
    const userState: User = {
      id: username, // Using username as ID
      username,
      passwordHash,
      avatar: `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${username}`,
    };
    await UserEntity.create(c.env, userState);
    const { passwordHash: _, ...userClientData } = userState;
    return ok(c, userClientData);
  });
  app.post('/api/login', zValidator('json', authSchema), async (c) => {
    const { username, password } = c.req.valid('json');
    const userEntity = new UserEntity(c.env, username);
    if (!await userEntity.exists()) {
      return notFound(c, 'Invalid username or password');
    }
    const user = await userEntity.getState();
    const passwordHash = await hashPassword(password, username);
    if (user.passwordHash !== passwordHash) {
      return bad(c, 'Invalid username or password');
    }
    const { passwordHash: _, ...userClientData } = user;
    return ok(c, userClientData);
  });
  // === USER ROUTES ===
  app.get('/api/users', async (c) => {
    const idsQuery = c.req.query('ids');
    if (!idsQuery) return bad(c, 'User IDs are required');
    const ids = idsQuery.split(',');
    const userPromises = ids.map(id => new UserEntity(c.env, id).getState().catch(() => null));
    const users = (await Promise.all(userPromises)).filter(Boolean) as User[];
    const clientUsers = users.map(({ passwordHash, ...rest }) => rest);
    return ok(c, clientUsers);
  });
  // === ROOM ROUTES ===
  const createRoomSchema = z.object({ name: z.string().min(3).max(30) });
  app.post('/api/rooms', zValidator('json', createRoomSchema), async (c) => {
    const userId = c.get('userId');
    if (!userId) return bad(c, 'Authentication required');
    const { name } = c.req.valid('json');
    const roomState: RoomState = {
      id: crypto.randomUUID(),
      name,
      ownerId: userId,
      userIds: [userId],
      messages: [],
    };
    await RoomEntity.create(c.env, roomState);
    const { messages, ...roomClientData } = roomState;
    return ok(c, roomClientData);
  });
  app.get('/api/rooms', async (c) => {
    const userId = c.get('userId');
    if (!userId) return ok(c, []); // Return empty if not authenticated
    const { items } = await RoomEntity.list(c.env);
    const userRooms = items.filter(room => room.userIds.includes(userId));
    const clientRooms = userRooms.map(({ messages, ...rest }) => rest);
    return ok(c, clientRooms);
  });
  app.post('/api/rooms/:roomId/join', async (c) => {
    const userId = c.get('userId');
    if (!userId) return bad(c, 'Authentication required');
    const { roomId } = c.req.param();
    const room = new RoomEntity(c.env, roomId);
    if (!await room.exists()) {
      return notFound(c, 'Room not found');
    }
    await room.addUser(userId);
    return ok(c, { message: 'Joined room successfully' });
  });
  // === MESSAGE ROUTES ===
  const sendMessageSchema = z.object({ ciphertext: z.string().min(1) });
  app.get('/api/rooms/:roomId/messages', async (c) => {
    const userId = c.get('userId');
    if (!userId) return bad(c, 'Authentication required');
    const { roomId } = c.req.param();
    const room = new RoomEntity(c.env, roomId);
    if (!await room.exists()) return notFound(c, 'Room not found');
    const state = await room.getState();
    if (!state.userIds.includes(userId)) return bad(c, 'Not a member of this room');
    return ok(c, state.messages);
  });
  app.post('/api/rooms/:roomId/messages', zValidator('json', sendMessageSchema), async (c) => {
    const userId = c.get('userId');
    if (!userId) return bad(c, 'Authentication required');
    const { roomId } = c.req.param();
    const { ciphertext } = c.req.valid('json');
    const room = new RoomEntity(c.env, roomId);
    if (!await room.exists()) return notFound(c, 'Room not found');
    const state = await room.getState();
    if (!state.userIds.includes(userId)) return bad(c, 'Not a member of this room');
    const message = await room.addMessage(userId, ciphertext);
    return ok(c, message);
  });
}