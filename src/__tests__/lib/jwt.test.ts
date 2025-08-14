import { signToken, verifyToken, type JWTPayload } from '@/lib/auth/jwt';

// Mock environment variables
process.env.JWT_SECRET = 'test-secret-key';

describe('JWT utilities', () => {
  const testPayload: JWTPayload = {
    userId: 'test-user-id',
    email: 'test@example.com',
  };

  describe('signToken', () => {
    it('should create a JWT token', async () => {
      const token = await signToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const token = await signToken(testPayload);
      const decoded = await verifyToken(token);
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
    });

    it('should throw an error for an invalid token', async () => {
      await expect(verifyToken('invalid-token')).rejects.toThrow();
    });

    it('should throw an error for a tampered token', async () => {
      const token = await signToken(testPayload);
      const tamperedToken = token.slice(0, -5) + 'XXXXX';
      await expect(verifyToken(tamperedToken)).rejects.toThrow();
    });
  });
});
