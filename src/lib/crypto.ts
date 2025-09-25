// src/lib/crypto.ts
const IV_LENGTH = 12; // For AES-GCM
const SALT_LENGTH = 16; // For PBKDF2
const KEY_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const HASH_ALGORITHM = 'SHA-256';
const PBKDF2_ITERATIONS = 100000;
// Helper to convert ArrayBuffer to Base64
function bufferToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}
// Helper to convert Base64 to ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
// 1. Generate a new random room key
export async function generateRoomKey(): Promise<string> {
  const key = await crypto.subtle.generateKey(
    { name: KEY_ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );
  const exportedKey = await crypto.subtle.exportKey('raw', key);
  return bufferToBase64(exportedKey);
}
// 2. Import a raw key from a Base64 string
async function importKey(keyB64: string): Promise<CryptoKey> {
  const keyBuffer = base64ToBuffer(keyB64);
  return crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: KEY_ALGORITHM },
    true,
    ['encrypt', 'decrypt']
  );
}
// 3. Encrypt a message
export async function encryptMessage(keyB64: string, plaintext: string): Promise<string> {
  const key = await importKey(keyB64);
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const encodedText = new TextEncoder().encode(plaintext);
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: KEY_ALGORITHM, iv },
    key,
    encodedText
  );
  // Prepend IV to the ciphertext for use in decryption
  const ciphertextWithIv = new Uint8Array(IV_LENGTH + ciphertextBuffer.byteLength);
  ciphertextWithIv.set(iv);
  ciphertextWithIv.set(new Uint8Array(ciphertextBuffer), IV_LENGTH);
  return bufferToBase64(ciphertextWithIv.buffer);
}
// 4. Decrypt a message
export async function decryptMessage(keyB64: string, ciphertextB64: string): Promise<string> {
  const key = await importKey(keyB64);
  const ciphertextWithIvBuffer = base64ToBuffer(ciphertextB64);
  const iv = ciphertextWithIvBuffer.slice(0, IV_LENGTH);
  const ciphertextBuffer = ciphertextWithIvBuffer.slice(IV_LENGTH);
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: KEY_ALGORITHM, iv },
    key,
    ciphertextBuffer
  );
  return new TextDecoder().decode(decryptedBuffer);
}