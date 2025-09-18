/**
 * Field-Level Encryption for Sensitive Data
 * AES-256-GCM encryption with key derivation and secure storage
 */

import { createClient } from '@supabase/supabase-js';

export interface EncryptionConfig {
  algorithm: string;
  keyDerivation: string;
  saltLength: number;
  ivLength: number;
  tagLength: number;
}

export interface EncryptedField {
  data: string;          // Base64 encoded encrypted data
  iv: string;            // Base64 encoded initialization vector
  salt: string;          // Base64 encoded salt for key derivation
  tag: string;           // Base64 encoded authentication tag
  algorithm: string;     // Encryption algorithm used
  keyId: string;         // Key identifier for rotation
}

export interface SensitiveDataField {
  fieldName: string;
  dataType: 'string' | 'object' | 'array';
  required: boolean;
  maxLength?: number;
}

/**
 * Field-level encryption service
 */
export class FieldEncryption {
  private config: EncryptionConfig;
  private masterKey: string;

  constructor(masterKey?: string) {
    this.config = {
      algorithm: 'AES-256-GCM',
      keyDerivation: 'PBKDF2',
      saltLength: 32,
      ivLength: 16,
      tagLength: 16
    };
    
    // In production, use environment variable or secure key management
    this.masterKey = masterKey || process.env.ENCRYPTION_MASTER_KEY || 'default-dev-key-change-in-production';
  }

  /**
   * Encrypt sensitive field data
   */
  async encryptField(plaintext: string, keyId: string = 'default'): Promise<EncryptedField> {
    try {
      // Generate random salt and IV
      const salt = this.generateRandomBytes(this.config.saltLength);
      const iv = this.generateRandomBytes(this.config.ivLength);
      
      // Derive encryption key from master key and salt
      const derivedKey = await this.deriveKey(this.masterKey, salt);
      
      // Encrypt the data using Web Crypto API simulation
      const { encrypted, tag } = await this.encryptData(plaintext, derivedKey, iv);
      
      return {
        data: this.bytesToBase64(encrypted),
        iv: this.bytesToBase64(iv),
        salt: this.bytesToBase64(salt),
        tag: this.bytesToBase64(tag),
        algorithm: this.config.algorithm,
        keyId
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt field data');
    }
  }

  /**
   * Decrypt sensitive field data
   */
  async decryptField(encryptedField: EncryptedField): Promise<string> {
    try {
      const encrypted = this.base64ToBytes(encryptedField.data);
      const iv = this.base64ToBytes(encryptedField.iv);
      const salt = this.base64ToBytes(encryptedField.salt);
      const tag = this.base64ToBytes(encryptedField.tag);
      
      // Derive the same key using salt
      const derivedKey = await this.deriveKey(this.masterKey, salt);
      
      // Decrypt the data
      const decrypted = await this.decryptData(encrypted, derivedKey, iv, tag);
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt field data');
    }
  }

  /**
   * Encrypt multiple fields in an object
   */
  async encryptFields(data: Record<string, any>, sensitiveFields: string[]): Promise<Record<string, any>> {
    const result = { ...data };
    
    for (const fieldName of sensitiveFields) {
      if (data[fieldName] !== undefined && data[fieldName] !== null) {
        const plaintext = typeof data[fieldName] === 'string' 
          ? data[fieldName] 
          : JSON.stringify(data[fieldName]);
        
        result[fieldName] = await this.encryptField(plaintext);
      }
    }
    
    return result;
  }

  /**
   * Decrypt multiple fields in an object
   */
  async decryptFields(data: Record<string, any>, sensitiveFields: string[]): Promise<Record<string, any>> {
    const result = { ...data };
    
    for (const fieldName of sensitiveFields) {
      if (data[fieldName] && typeof data[fieldName] === 'object' && data[fieldName].data) {
        try {
          const decrypted = await this.decryptField(data[fieldName]);
          
          // Try to parse as JSON, fallback to string
          try {
            result[fieldName] = JSON.parse(decrypted);
          } catch {
            result[fieldName] = decrypted;
          }
        } catch (error) {
          console.error(`Failed to decrypt field ${fieldName}:`, error);
          result[fieldName] = null;
        }
      }
    }
    
    return result;
  }

  /**
   * Generate random bytes (simplified for Node.js environment)
   */
  private generateRandomBytes(length: number): Uint8Array {
    if (typeof window !== 'undefined' && window.crypto) {
      return window.crypto.getRandomValues(new Uint8Array(length));
    } else {
      // Fallback for Node.js
      const crypto = require('crypto');
      return new Uint8Array(crypto.randomBytes(length));
    }
  }

  /**
   * Derive encryption key using PBKDF2
   */
  private async deriveKey(masterKey: string, salt: Uint8Array): Promise<Uint8Array> {
    // Simplified key derivation - in production use proper PBKDF2
    const crypto = require('crypto');
    const derived = crypto.pbkdf2Sync(masterKey, salt, 10000, 32, 'sha256');
    return new Uint8Array(derived);
  }

  /**
   * Encrypt data using AES-256-GCM simulation
   */
  private async encryptData(plaintext: string, key: Uint8Array, iv: Uint8Array): Promise<{ encrypted: Uint8Array; tag: Uint8Array }> {
    // Simplified encryption - in production use proper Web Crypto API or Node.js crypto
    const crypto = require('crypto');
    const cipher = crypto.createCipherGCM('aes-256-gcm');
    cipher.setAAD(Buffer.from('additional-auth-data'));
    
    let encrypted = cipher.update(plaintext, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const tag = cipher.getAuthTag();
    
    return {
      encrypted: new Uint8Array(encrypted),
      tag: new Uint8Array(tag)
    };
  }

  /**
   * Decrypt data using AES-256-GCM simulation
   */
  private async decryptData(encrypted: Uint8Array, key: Uint8Array, iv: Uint8Array, tag: Uint8Array): Promise<string> {
    // Simplified decryption - in production use proper Web Crypto API or Node.js crypto
    const crypto = require('crypto');
    const decipher = crypto.createDecipherGCM('aes-256-gcm');
    decipher.setAuthTag(Buffer.from(tag));
    decipher.setAAD(Buffer.from('additional-auth-data'));
    
    let decrypted = decipher.update(Buffer.from(encrypted), null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Convert bytes to base64
   */
  private bytesToBase64(bytes: Uint8Array): string {
    if (typeof window !== 'undefined') {
      return btoa(String.fromCharCode(...bytes));
    } else {
      return Buffer.from(bytes).toString('base64');
    }
  }

  /**
   * Convert base64 to bytes
   */
  private base64ToBytes(base64: string): Uint8Array {
    if (typeof window !== 'undefined') {
      return new Uint8Array(atob(base64).split('').map(c => c.charCodeAt(0)));
    } else {
      return new Uint8Array(Buffer.from(base64, 'base64'));
    }
  }
}

/**
 * Sensitive data field definitions
 */
export const SensitiveFields = {
  USER_DATA: [
    'email',
    'phone_number',
    'ssn',
    'tax_id',
    'bank_account',
    'credit_card',
    'personal_notes'
  ],
  PROJECT_DATA: [
    'contractor_contact',
    'owner_contact',
    'financial_details',
    'confidential_notes',
    'contractor_license',
    'insurance_details'
  ],
  VBA_DATA: [
    'inspector_notes',
    'compliance_details',
    'violation_details',
    'financial_impact',
    'legal_notes'
  ],
  DOCUMENT_DATA: [
    'confidential_content',
    'legal_text',
    'financial_data',
    'personal_information'
  ]
};

/**
 * Encryption service for Supabase integration
 */
export class SupabaseEncryption {
  private encryption: FieldEncryption;
  private supabase: any;

  constructor(supabaseUrl: string, serviceKey: string, masterKey?: string) {
    this.encryption = new FieldEncryption(masterKey);
    this.supabase = createClient(supabaseUrl, serviceKey);
  }

  /**
   * Store encrypted data in Supabase
   */
  async storeEncrypted(
    table: string, 
    data: Record<string, any>, 
    sensitiveFields: string[]
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Encrypt sensitive fields
      const encryptedData = await this.encryption.encryptFields(data, sensitiveFields);
      
      // Store in Supabase
      const { data: result, error } = await this.supabase
        .from(table)
        .insert(encryptedData)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Log encryption activity
      await this.logEncryptionActivity('encrypt', table, sensitiveFields);

      return { success: true, data: result };
    } catch (error) {
      console.error('Failed to store encrypted data:', error);
      return { success: false, error: 'Failed to store encrypted data' };
    }
  }

  /**
   * Retrieve and decrypt data from Supabase
   */
  async retrieveDecrypted(
    table: string, 
    id: string, 
    sensitiveFields: string[]
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Retrieve from Supabase
      const { data: result, error } = await this.supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Decrypt sensitive fields
      const decryptedData = await this.encryption.decryptFields(result, sensitiveFields);

      // Log decryption activity
      await this.logEncryptionActivity('decrypt', table, sensitiveFields);

      return { success: true, data: decryptedData };
    } catch (error) {
      console.error('Failed to retrieve decrypted data:', error);
      return { success: false, error: 'Failed to retrieve decrypted data' };
    }
  }

  /**
   * Update encrypted data in Supabase
   */
  async updateEncrypted(
    table: string, 
    id: string, 
    data: Record<string, any>, 
    sensitiveFields: string[]
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Encrypt sensitive fields
      const encryptedData = await this.encryption.encryptFields(data, sensitiveFields);
      
      // Update in Supabase
      const { data: result, error } = await this.supabase
        .from(table)
        .update(encryptedData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      // Log encryption activity
      await this.logEncryptionActivity('update_encrypt', table, sensitiveFields);

      return { success: true, data: result };
    } catch (error) {
      console.error('Failed to update encrypted data:', error);
      return { success: false, error: 'Failed to update encrypted data' };
    }
  }

  /**
   * Log encryption/decryption activities
   */
  private async logEncryptionActivity(
    operation: string, 
    table: string, 
    fields: string[]
  ): Promise<void> {
    try {
      await this.supabase.from('activity_logs').insert({
        user_id: 'system',
        action: `encryption_${operation}`,
        entity_type: 'encryption',
        metadata: {
          table_name: table,
          encrypted_fields: fields,
          operation_timestamp: new Date().toISOString(),
          algorithm: 'AES-256-GCM'
        }
      });
    } catch (error) {
      console.error('Failed to log encryption activity:', error);
    }
  }
}

// Global encryption service instance
export const globalEncryption = new FieldEncryption();

// Utility functions for easy encryption/decryption
export async function encryptSensitiveData(
  data: Record<string, any>, 
  fieldType: keyof typeof SensitiveFields
): Promise<Record<string, any>> {
  const sensitiveFields = SensitiveFields[fieldType];
  return await globalEncryption.encryptFields(data, sensitiveFields);
}

export async function decryptSensitiveData(
  data: Record<string, any>, 
  fieldType: keyof typeof SensitiveFields
): Promise<Record<string, any>> {
  const sensitiveFields = SensitiveFields[fieldType];
  return await globalEncryption.decryptFields(data, sensitiveFields);
}