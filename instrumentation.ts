// This file runs before any other code in Next.js
// Set up Node.js polyfills for browser globals

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Polyfill browser globals for Node.js
    if (typeof globalThis.self === 'undefined') {
      (globalThis as any).self = globalThis;
    }
    if (typeof global !== 'undefined' && typeof (global as any).self === 'undefined') {
      (global as any).self = global;
    }
  }
}