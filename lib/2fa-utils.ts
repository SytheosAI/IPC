/**
 * Two-Factor Authentication Utilities
 * Supports TOTP (Time-based One-Time Password) and SMS authentication
 */

import { createClient } from '@supabase/supabase-js';

export interface TOTPSetupResult {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
  manualEntryKey: string;
}

export interface SMSSetupResult {
  phoneNumber: string;
  verificationCode: string;
  expiresAt: string;
}

export interface TwoFactorSettings {
  totp_enabled: boolean;
  sms_enabled: boolean;
  phone_number?: string;
  backup_codes?: string[];
  totp_secret?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Generate TOTP secret and QR code for authenticator apps
 */
export function generateTOTPSecret(userEmail: string, serviceName: string = 'IPC System'): TOTPSetupResult {
  // Generate a random 32-character base32 secret
  const secret = generateBase32Secret();
  
  // Create the TOTP URL for QR code
  const totpUrl = `otpauth://totp/${encodeURIComponent(serviceName)}:${encodeURIComponent(userEmail)}?secret=${secret}&issuer=${encodeURIComponent(serviceName)}`;
  
  // Generate QR code URL (using a QR code service)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(totpUrl)}`;
  
  // Generate backup codes
  const backupCodes = generateBackupCodes();
  
  return {
    secret,
    qrCodeUrl,
    backupCodes,
    manualEntryKey: formatSecretForManualEntry(secret)
  };
}

/**
 * Generate a random base32 secret for TOTP
 */
function generateBase32Secret(): string {
  const base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let secret = '';
  
  for (let i = 0; i < 32; i++) {
    secret += base32Chars[Math.floor(Math.random() * base32Chars.length)];
  }
  
  return secret;
}

/**
 * Format secret for manual entry in authenticator apps
 */
function formatSecretForManualEntry(secret: string): string {
  return secret.match(/.{1,4}/g)?.join(' ') || secret;
}

/**
 * Generate backup codes for account recovery
 */
function generateBackupCodes(count: number = 8): string[] {
  const codes = [];
  
  for (let i = 0; i < count; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  
  return codes;
}

/**
 * Verify TOTP code using simplified algorithm
 * In production, use a proper TOTP library like 'otplib'
 */
export function verifyTOTPCode(secret: string, token: string): boolean {
  // Simplified TOTP verification - in production use proper TOTP library
  const timeStep = Math.floor(Date.now() / 30000);
  
  // Check current time window and previous/next windows for clock drift
  for (let window = -1; window <= 1; window++) {
    const expectedToken = generateTOTPCode(secret, timeStep + window);
    if (expectedToken === token) {
      return true;
    }
  }
  
  return false;
}

/**
 * Generate TOTP code for given secret and time step
 * Simplified implementation - use proper TOTP library in production
 */
function generateTOTPCode(secret: string, timeStep: number): string {
  // This is a simplified implementation
  // In production, use a proper HMAC-SHA1 based TOTP algorithm
  const hash = simpleHash(secret + timeStep.toString());
  return (hash % 1000000).toString().padStart(6, '0');
}

/**
 * Simple hash function - replace with proper HMAC-SHA1 in production
 */
function simpleHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Send SMS verification code
 * In production, integrate with SMS service like Twilio
 */
export async function sendSMSCode(phoneNumber: string): Promise<SMSSetupResult> {
  // Generate 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // In production, send SMS via Twilio or similar service
  console.log(`SMS Code for ${phoneNumber}: ${verificationCode}`);
  
  // Store in database for verification
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
  
  return {
    phoneNumber,
    verificationCode,
    expiresAt
  };
}

/**
 * Verify SMS code
 */
export function verifySMSCode(providedCode: string, storedCode: string, expiresAt: string): boolean {
  const now = new Date();
  const expiry = new Date(expiresAt);
  
  return providedCode === storedCode && now < expiry;
}

/**
 * Verify backup code
 */
export function verifyBackupCode(providedCode: string, backupCodes: string[]): boolean {
  return backupCodes.includes(providedCode.toUpperCase());
}

/**
 * Store 2FA settings in Supabase
 */
export async function store2FASettings(
  userId: string, 
  settings: Partial<TwoFactorSettings>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create or update 2FA settings
    const { data, error } = await supabase
      .from('user_2fa_settings')
      .upsert({
        user_id: userId,
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to store 2FA settings:', error);
      return { success: false, error: error.message };
    }

    // Log the 2FA setup activity
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action: '2fa_settings_updated',
      entity_type: 'security',
      metadata: {
        totp_enabled: settings.totp_enabled,
        sms_enabled: settings.sms_enabled,
        phone_number_set: !!settings.phone_number,
        backup_codes_generated: !!settings.backup_codes
      }
    });

    return { success: true };
  } catch (error) {
    console.error('2FA settings storage error:', error);
    return { success: false, error: 'Failed to store 2FA settings' };
  }
}

/**
 * Get 2FA settings from Supabase
 */
export async function get2FASettings(userId: string): Promise<TwoFactorSettings | null> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data, error } = await supabase
      .from('user_2fa_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as TwoFactorSettings;
  } catch (error) {
    console.error('Failed to get 2FA settings:', error);
    return null;
  }
}

/**
 * Disable 2FA for user
 */
export async function disable2FA(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from('user_2fa_settings')
      .update({
        totp_enabled: false,
        sms_enabled: false,
        totp_secret: null,
        phone_number: null,
        backup_codes: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    // Log the 2FA disable activity
    await supabase.from('activity_logs').insert({
      user_id: userId,
      action: '2fa_disabled',
      entity_type: 'security',
      metadata: {
        disabled_at: new Date().toISOString(),
        method: 'manual'
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to disable 2FA:', error);
    return { success: false, error: 'Failed to disable 2FA' };
  }
}

/**
 * Validate 2FA during login
 */
export async function validate2FALogin(
  userId: string,
  method: 'totp' | 'sms' | 'backup',
  code: string,
  storedSMSCode?: string,
  smsExpiresAt?: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const settings = await get2FASettings(userId);
    
    if (!settings) {
      return { valid: false, error: '2FA not configured' };
    }

    let isValid = false;

    switch (method) {
      case 'totp':
        if (settings.totp_enabled && settings.totp_secret) {
          isValid = verifyTOTPCode(settings.totp_secret, code);
        }
        break;
        
      case 'sms':
        if (settings.sms_enabled && storedSMSCode && smsExpiresAt) {
          isValid = verifySMSCode(code, storedSMSCode, smsExpiresAt);
        }
        break;
        
      case 'backup':
        if (settings.backup_codes) {
          isValid = verifyBackupCode(code, settings.backup_codes);
          
          // Remove used backup code
          if (isValid) {
            const updatedCodes = settings.backup_codes.filter(c => c !== code.toUpperCase());
            await store2FASettings(userId, { backup_codes: updatedCodes });
          }
        }
        break;
    }

    // Log authentication attempt
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    await supabase.from('activity_logs').insert({
      user_id: userId,
      action: '2fa_login_attempt',
      entity_type: 'security',
      metadata: {
        method,
        success: isValid,
        timestamp: new Date().toISOString()
      }
    });

    return { valid: isValid, error: isValid ? undefined : 'Invalid 2FA code' };
  } catch (error) {
    console.error('2FA validation error:', error);
    return { valid: false, error: 'Failed to validate 2FA code' };
  }
}