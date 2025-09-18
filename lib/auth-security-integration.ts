/**
 * Authentication and Security Integration
 * Connects authentication events to security monitoring system
 */

import { SecurityMonitor, SecurityEventTypes } from './security-monitoring';
import { globalRateLimiter } from './rate-limiter';
import { validate2FALogin } from './2fa-utils';

// Initialize security monitor
const securityMonitor = new SecurityMonitor(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Log authentication attempt with security monitoring
 */
export async function logAuthenticationAttempt(
  email: string,
  success: boolean,
  ip: string,
  userAgent: string
): Promise<void> {
  const eventType = success 
    ? SecurityEventTypes.AUTHENTICATION.SUCCESSFUL_LOGIN
    : SecurityEventTypes.AUTHENTICATION.FAILED_LOGIN;

  await securityMonitor.logSecurityEvent({
    event_type: eventType,
    severity: success ? 'low' : 'medium',
    source_ip: ip,
    user_id: email,
    user_agent: userAgent,
    endpoint: '/api/auth/login',
    description: success 
      ? 'Successful login attempt'
      : 'Failed login attempt',
    metadata: {
      email,
      timestamp: new Date().toISOString(),
      login_method: 'password'
    },
    status: 'active'
  });
}

/**
 * Log 2FA verification attempt with security monitoring
 */
export async function log2FAAttempt(
  userId: string,
  method: 'totp' | 'sms' | 'backup',
  success: boolean,
  ip: string
): Promise<void> {
  const eventType = success
    ? SecurityEventTypes.TWO_FACTOR.SUCCESSFUL_2FA
    : SecurityEventTypes.TWO_FACTOR.FAILED_2FA;

  await securityMonitor.logSecurityEvent({
    event_type: eventType,
    severity: success ? 'low' : 'high',
    source_ip: ip,
    user_id: userId,
    endpoint: '/api/auth/2fa/verify',
    description: success
      ? `Successful 2FA verification via ${method}`
      : `Failed 2FA verification attempt via ${method}`,
    metadata: {
      verification_method: method,
      timestamp: new Date().toISOString()
    },
    status: success ? 'resolved' : 'active'
  });
}

/**
 * Log rate limit violation with security monitoring
 */
export async function logRateLimitViolation(
  ip: string,
  endpoint: string,
  limitType: string
): Promise<void> {
  await securityMonitor.logSecurityEvent({
    event_type: SecurityEventTypes.API_SECURITY.RATE_LIMIT_VIOLATION,
    severity: 'medium',
    source_ip: ip,
    endpoint: endpoint,
    description: `Rate limit exceeded for ${limitType}`,
    metadata: {
      limit_type: limitType,
      timestamp: new Date().toISOString(),
      blocked_until: new Date(Date.now() + 15 * 60 * 1000).toISOString()
    },
    status: 'active'
  });
}

/**
 * Log suspicious file access with security monitoring
 */
export async function logSuspiciousFileAccess(
  userId: string,
  fileName: string,
  ip: string,
  reason: string
): Promise<void> {
  await securityMonitor.logSecurityEvent({
    event_type: SecurityEventTypes.DATA_ACCESS.SENSITIVE_DATA_ACCESS,
    severity: 'high',
    source_ip: ip,
    user_id: userId,
    endpoint: '/api/files',
    description: `Suspicious file access detected: ${reason}`,
    metadata: {
      file_name: fileName,
      access_reason: reason,
      timestamp: new Date().toISOString()
    },
    status: 'investigating'
  });
}

/**
 * Log password reset request with security monitoring
 */
export async function logPasswordResetRequest(
  email: string,
  ip: string,
  success: boolean
): Promise<void> {
  await securityMonitor.logSecurityEvent({
    event_type: SecurityEventTypes.AUTHENTICATION.PASSWORD_RESET,
    severity: 'low',
    source_ip: ip,
    user_id: email,
    endpoint: '/api/auth/reset-password',
    description: success
      ? 'Password reset email sent'
      : 'Password reset request failed',
    metadata: {
      email,
      timestamp: new Date().toISOString(),
      success
    },
    status: 'resolved'
  });
}

/**
 * Enhanced login function with security monitoring
 */
export async function secureLogin(
  email: string,
  password: string,
  ip: string,
  userAgent: string
): Promise<{ 
  success: boolean; 
  requires2FA?: boolean;
  error?: string;
}> {
  try {
    // Check rate limiting
    const rateLimitResult = await globalRateLimiter.checkLimit(ip, 'auth');
    
    if (!rateLimitResult.allowed) {
      await logRateLimitViolation(ip, '/api/auth/login', 'auth');
      return { 
        success: false, 
        error: 'Too many login attempts. Please try again later.' 
      };
    }

    // Perform authentication (simplified for demonstration)
    // In production, this would use Supabase auth
    const isValidCredentials = password.length > 0; // Simplified validation
    
    if (!isValidCredentials) {
      await logAuthenticationAttempt(email, false, ip, userAgent);
      return { 
        success: false, 
        error: 'Invalid credentials' 
      };
    }

    // Log successful authentication
    await logAuthenticationAttempt(email, true, ip, userAgent);

    // Check if 2FA is required
    // In production, check user settings
    const requires2FA = email.includes('admin'); // Simplified check

    return {
      success: true,
      requires2FA
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Authentication failed'
    };
  }
}

/**
 * Enhanced 2FA verification with security monitoring
 */
export async function secure2FAVerification(
  userId: string,
  code: string,
  method: 'totp' | 'sms' | 'backup',
  ip: string
): Promise<{ 
  success: boolean; 
  error?: string;
}> {
  try {
    // Check rate limiting for 2FA
    const rateLimitResult = await globalRateLimiter.checkLimit(ip, 'twofa');
    
    if (!rateLimitResult.allowed) {
      await logRateLimitViolation(ip, '/api/auth/2fa/verify', 'twofa');
      await log2FAAttempt(userId, method, false, ip);
      return {
        success: false,
        error: 'Too many 2FA attempts. Account locked for security.'
      };
    }

    // Verify 2FA code
    const result = await validate2FALogin(
      userId,
      method,
      code
    );

    // Log 2FA attempt
    await log2FAAttempt(userId, method, result.valid, ip);

    return {
      success: result.valid,
      error: result.error
    };

  } catch (error) {
    console.error('2FA verification error:', error);
    await log2FAAttempt(userId, method, false, ip);
    return {
      success: false,
      error: '2FA verification failed'
    };
  }
}

// Export security-enhanced auth functions
export const AuthSecurity = {
  logAuthenticationAttempt,
  log2FAAttempt,
  logRateLimitViolation,
  logSuspiciousFileAccess,
  logPasswordResetRequest,
  secureLogin,
  secure2FAVerification
};