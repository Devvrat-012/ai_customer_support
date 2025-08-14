export class SignJWT {
  private payload: any;
  private exp: string | undefined;
  constructor(payload: any) { this.payload = payload; }
  setProtectedHeader() { return this; }
  setExpirationTime(exp: string) { this.exp = exp; return this; }
  async sign(_secret: Uint8Array): Promise<string> {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(this.payload)).toString('base64url');
    // Derive a pseudo-signature from body length to allow tamper detection
    const sig = Buffer.from(`sig:${body.length}`).toString('base64url');
    return `${header}.${body}.${sig}`;
  }
}

export async function jwtVerify(token: string, _secret: Uint8Array) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token');
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    const expectedSig = Buffer.from(`sig:${parts[1].length}`).toString('base64url');
    if (parts[2] !== expectedSig) throw new Error('Signature mismatch');
    return { payload };
  } catch {
    throw new Error('Invalid token payload');
  }
}
