import "server-only";
import { createHmac, randomBytes } from "crypto";
import { safeEqual } from "@/lib/session";

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const PERIOD_SECONDS = 30;
const DIGITS = 6;
export const TOTP_ISSUER = "Funky Kids ERP";

function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = "";
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += BASE32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += BASE32[(value << (5 - bits)) & 31];
  return output;
}

function base32Decode(input: string): Buffer {
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];
  for (const char of input.replace(/=+$/, "").toUpperCase()) {
    const index = BASE32.indexOf(char);
    if (index === -1) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

function hotp(secret: string, counter: number): string {
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", base32Decode(secret)).update(message).digest();
  const offset = digest[digest.length - 1] & 0xf;
  const code = (digest.readUInt32BE(offset) & 0x7fffffff) % 10 ** DIGITS;
  return code.toString().padStart(DIGITS, "0");
}

export function generateTotpSecret(): string {
  return base32Encode(randomBytes(20));
}

export function totpUri(secret: string, accountName: string): string {
  const label = encodeURIComponent(`${TOTP_ISSUER}:${accountName}`);
  const params = new URLSearchParams({
    secret,
    issuer: TOTP_ISSUER,
    algorithm: "SHA1",
    digits: String(DIGITS),
    period: String(PERIOD_SECONDS),
  });
  return `otpauth://totp/${label}?${params}`;
}

export function verifyTotp(secret: string, code: string, lastUsedStep = 0): number | null {
  if (!/^\d{6}$/.test(code)) return null;
  const currentStep = Math.floor(Date.now() / 1000 / PERIOD_SECONDS);
  for (const step of [currentStep - 1, currentStep, currentStep + 1]) {
    if (step > lastUsedStep && safeEqual(hotp(secret, step), code)) return step;
  }
  return null;
}
