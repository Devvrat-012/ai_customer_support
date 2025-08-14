// Fallback minimal type declarations for 'jose' (only what we use). Remove if full types resolve.
declare module 'jose' {
  export interface JWTPayload {
    [prop: string]: any;
  }
  export class SignJWT {
    constructor(payload: object);
    setProtectedHeader(header: { alg: string }): this;
    setExpirationTime(exp: string): this;
    sign(secret: Uint8Array): Promise<string>;
  }
  export function jwtVerify(token: string, secret: Uint8Array, options?: { algorithms?: string[] }): Promise<{ payload: JWTPayload }>;
}
