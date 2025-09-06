// Node.js polyfills for browser globals
// This must be imported before any other code

// Polyfill self for Node.js
if (typeof globalThis.self === 'undefined') {
  globalThis.self = globalThis;
}

// Also set it on global for older Node versions
if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
  global.self = global;
}

// Import cross-fetch to polyfill fetch-related globals
require('cross-fetch/polyfill');