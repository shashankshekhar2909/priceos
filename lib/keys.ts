import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";
import { encryptValue, decryptValue } from "./encryption";

const DATA_DIR = path.join(process.cwd(), "data");
const KEYS_FILE = path.join(DATA_DIR, "keys.enc.json");

function ensureStorage() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(KEYS_FILE)) writeFileSync(KEYS_FILE, "{}");
}

export interface StoredKey {
  id: string;
  provider: string;
  label: string;
  ciphertext: string;
  iv: string;
  last4: string;
  addedAt: string;
  active: boolean;
}

export function loadKeys(): Record<string, StoredKey> {
  ensureStorage();
  try {
    return JSON.parse(readFileSync(KEYS_FILE, "utf8"));
  } catch {
    return {};
  }
}

export function saveKeys(keys: Record<string, StoredKey>) {
  ensureStorage();
  writeFileSync(KEYS_FILE, JSON.stringify(keys, null, 2));
}

export function getDecryptedKey(provider: string): string {
  const store = loadKeys();
  const entry = store[provider];
  if (!entry || !entry.active) return "";
  try {
    return decryptValue(entry.ciphertext, entry.iv);
  } catch {
    return "";
  }
}

export function resolveKey(provider: string, envVar: string): string {
  const fromFile = getDecryptedKey(provider);
  if (fromFile) return fromFile;
  return process.env[envVar] || "";
}

export function storeKey(provider: string, value: string, label?: string): StoredKey {
  const store = loadKeys();
  const { ciphertext, iv } = encryptValue(value.trim());
  const entry: StoredKey = {
    id: `${provider}-${Date.now()}`,
    provider,
    label: label || `${provider} API Key`,
    ciphertext,
    iv,
    last4: value.trim().slice(-4),
    addedAt: new Date().toISOString(),
    active: true,
  };
  store[provider] = entry;
  saveKeys(store);
  return entry;
}
