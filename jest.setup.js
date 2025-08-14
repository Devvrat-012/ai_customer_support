import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => require('next-router-mock'));

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.BCRYPT_ROUNDS = '10';

// Polyfill TextEncoder / TextDecoder for Node test environment if needed
import { TextEncoder, TextDecoder } from 'util';
// @ts-ignore
if (!global.TextEncoder) global.TextEncoder = TextEncoder;
// @ts-ignore
if (!global.TextDecoder) global.TextDecoder = TextDecoder;
