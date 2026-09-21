/* Client-side password hashing. This is a LOCAL simulation — no backend exists.
 * We hash so passwords are never stored in plain text in LocalStorage. */

/** SHA-256 hex digest, with a tiny non-cryptographic fallback for insecure contexts. */
export async function hashText(input: string): Promise<string> {
  try {
    if (globalThis.crypto?.subtle) {
      const buf = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
    }
  } catch {
    /* fall through to weak hash */
  }
  // Weak fallback (djb2 ×2) — only used when WebCrypto is unavailable.
  let h1 = 5381
  let h2 = 52711
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i)
    h1 = ((h1 << 5) + h1 + c) | 0
    h2 = ((h2 << 5) + h2 + c) | 0
  }
  return `${(h1 >>> 0).toString(16)}${(h2 >>> 0).toString(16)}`
}

/** Deterministic password hash — salted with the normalized email. */
export function hashPassword(email: string, password: string): Promise<string> {
  return hashText(`sas:${email.trim().toLowerCase()}:${password}`)
}
