// Global polyfills for SSR compatibility
if (typeof globalThis !== 'undefined') {
  if (typeof globalThis.self === 'undefined') {
    (globalThis as any).self = globalThis;
  }
  if (typeof (global as any).self === 'undefined') {
    (global as any).self = global;
  }
}

// Polyfill self on global object as well
if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
  (global as any).self = global;
}

export {};