import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const MASTER_SECRET =
  process.env.MASTER_SECRET || "priceos-dev-master-secret-change-in-production";
const ENC_KEY = scryptSync(MASTER_SECRET, "priceos-v1-salt", 32);

export function encryptValue(plaintext: string): { ciphertext: string; iv: string } {
  const iv = randomBytes(16);
  const cipher = createCipheriv("aes-256-gcm", ENC_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: Buffer.concat([encrypted, authTag]).toString("base64"),
    iv: iv.toString("base64"),
  };
}

export function decryptValue(ciphertext: string, iv: string): string {
  const ivBuf = Buffer.from(iv, "base64");
  const buf = Buffer.from(ciphertext, "base64");
  const authTag = buf.slice(-16);
  const data = buf.slice(0, -16);
  const decipher = createDecipheriv("aes-256-gcm", ENC_KEY, ivBuf);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
