/**
 * Advanced Rate Limiting System
 * Implements multiple rate limiting strategies with Redis-like in-memory storage
 */

export interface RateLimitConfig {
  windowMs: number;        // Time window in milliseconds
  maxRequests: number;     // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (identifier: string) => string;
  onLimitReached?: (identifier: string, limit: RateLimitConfig) => void;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalRequests: number;
}

export interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

/**
 * In-memory rate limiter with sliding window algorithm
 */
export class MemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Cleanup expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const key = this.config.keyGenerator ? this.config.keyGenerator(identifier) : identifier;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get or create entry
    let entry = this.store.get(key);
    
    if (!entry || entry.resetTime <= now) {
      entry = {
        count: 0,
        resetTime: now + this.config.windowMs,
        firstRequest: now
      };
      this.store.set(key, entry);
    }

    // Check if request is allowed
    const allowed = entry.count < this.config.maxRequests;
    
    if (allowed) {
      entry.count++;
    } else {
      this.config.onLimitReached?.(identifier, this.config);
    }

    return {
      allowed,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      totalRequests: entry.count
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime <= now) {
        this.store.delete(key);
      }
    }
  }

  reset(identifier?: string): void {
    if (identifier) {
      const key = this.config.keyGenerator ? this.config.keyGenerator(identifier) : identifier;
      this.store.delete(key);
    } else {
      this.store.clear();
    }
  }

  getStats(): { totalKeys: number; memoryUsage: number } {
    return {
      totalKeys: this.store.size,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  private estimateMemoryUsage(): number {
    // Rough estimate of memory usage in bytes
    return this.store.size * 100; // ~100 bytes per entry
  }
}

/**
 * Distributed rate limiter using Supabase for persistence
 */
export class DistributedRateLimiter {
  private config: RateLimitConfig;
  private supabaseUrl: string;
  private serviceKey: string;

  constructor(config: RateLimitConfig, supabaseUrl: string, serviceKey: string) {
    this.config = config;
    this.supabaseUrl = supabaseUrl;
    this.serviceKey = serviceKey;
  }

  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const key = this.config.keyGenerator ? this.config.keyGenerator(identifier) : identifier;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    try {
      // Use activity_logs table to track rate limits
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(this.supabaseUrl, this.serviceKey);

      // Count requests in current window
      const { data: requests, error } = await supabase
        .from('activity_logs')
        .select('count')
        .eq('user_id', key)
        .eq('action', 'rate_limit_request')
        .gte('created_at', new Date(windowStart).toISOString());

      const currentCount = requests?.length || 0;
      const allowed = currentCount < this.config.maxRequests;

      if (allowed) {
        // Record this request
        await supabase.from('activity_logs').insert({
          user_id: key,
          action: 'rate_limit_request',
          entity_type: 'rate_limit',
          metadata: {
            identifier,
            window_ms: this.config.windowMs,
            max_requests: this.config.maxRequests,
            current_count: currentCount + 1
          }
        });
      } else {
        // Record rate limit hit
        await supabase.from('activity_logs').insert({
          user_id: key,
          action: 'rate_limit_exceeded',
          entity_type: 'security',
          metadata: {
            identifier,
            window_ms: this.config.windowMs,
            max_requests: this.config.maxRequests,
            exceeded_count: currentCount
          }
        });

        this.config.onLimitReached?.(identifier, this.config);
      }

      return {
        allowed,
        remaining: Math.max(0, this.config.maxRequests - currentCount - (allowed ? 1 : 0)),
        resetTime: now + this.config.windowMs,
        totalRequests: currentCount + (allowed ? 1 : 0)
      };

    } catch (error) {
      console.error('Distributed rate limiter error:', error);
      // Fallback to allowing request if database is unavailable
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs,
        totalRequests: 1
      };
    }
  }
}

/**
 * Rate limiting middleware for Next.js API routes
 */
export function createRateLimitMiddleware(configs: Record<string, RateLimitConfig>) {
  const limiters = new Map<string, MemoryRateLimiter>();

  // Initialize limiters for each config
  for (const [name, config] of Object.entries(configs)) {
    limiters.set(name, new MemoryRateLimiter(config));
  }

  return {
    async checkLimit(
      identifier: string, 
      limitType: string = 'default'
    ): Promise<RateLimitResult> {
      const limiter = limiters.get(limitType);
      
      if (!limiter) {
        throw new Error(`Rate limiter '${limitType}' not found`);
      }

      return await limiter.checkLimit(identifier);
    },

    getLimiter(limitType: string): MemoryRateLimiter | undefined {
      return limiters.get(limitType);
    },

    getStats(): Record<string, any> {
      const stats: Record<string, any> = {};
      for (const [name, limiter] of limiters.entries()) {
        stats[name] = limiter.getStats();
      }
      return stats;
    }
  };
}

/**
 * Predefined rate limiting configurations
 */
export const RateLimitConfigs = {
  // API endpoints
  API_GENERAL: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
    keyGenerator: (ip: string) => `api_general:${ip}`
  },

  API_AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyGenerator: (ip: string) => `api_auth:${ip}`
  },

  API_2FA: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 3,
    keyGenerator: (ip: string) => `api_2fa:${ip}`
  },

  // File uploads
  FILE_UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 50,
    keyGenerator: (userId: string) => `file_upload:${userId}`
  },

  // Search and queries
  SEARCH_QUERY: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    keyGenerator: (userId: string) => `search:${userId}`
  },

  // Report generation
  REPORT_GENERATION: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 5,
    keyGenerator: (userId: string) => `reports:${userId}`
  },

  // Database operations
  DATABASE_WRITES: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    keyGenerator: (userId: string) => `db_writes:${userId}`
  },

  // Email sending
  EMAIL_SENDING: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10,
    keyGenerator: (userId: string) => `email:${userId}`
  },

  // SMS sending
  SMS_SENDING: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5,
    keyGenerator: (userId: string) => `sms:${userId}`
  }
};

/**
 * Express-style middleware for rate limiting
 */
export function rateLimitMiddleware(
  config: RateLimitConfig,
  getIdentifier: (req: any) => string = (req) => req.ip
) {
  const limiter = new MemoryRateLimiter(config);

  return async (req: any, res: any, next: any) => {
    try {
      const identifier = getIdentifier(req);
      const result = await limiter.checkLimit(identifier);

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));

      if (!result.allowed) {
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        });
      }

      next();
    } catch (error) {
      console.error('Rate limiting error:', error);
      next(); // Continue on error
    }
  };
}

/**
 * Utility function to get client IP address
 */
export function getClientIP(req: any): string {
  return (
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * Utility function to get user identifier
 */
export function getUserIdentifier(req: any): string {
  // Try to get user ID from auth token, fallback to IP
  const userId = req.user?.id || req.userId;
  if (userId) return userId;
  
  return getClientIP(req);
}

// Global rate limiter instance
export const globalRateLimiter = createRateLimitMiddleware(RateLimitConfigs);