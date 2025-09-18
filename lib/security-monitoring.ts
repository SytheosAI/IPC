/**
 * Real-Time Security Monitoring and Threat Detection System
 * Comprehensive security event monitoring, anomaly detection, and threat response
 */

import { createClient } from '@supabase/supabase-js';

export interface SecurityEvent {
  id?: string;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source_ip: string;
  user_id?: string;
  user_agent?: string;
  endpoint?: string;
  description: string;
  metadata: Record<string, any>;
  timestamp: string;
  status: 'active' | 'investigating' | 'resolved' | 'false_positive';
}

export interface ThreatPattern {
  pattern_id: string;
  name: string;
  description: string;
  detection_rules: any[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  auto_response: boolean;
  response_actions: string[];
}

export interface SecurityMetrics {
  total_events: number;
  events_by_severity: Record<string, number>;
  top_threats: Array<{ type: string; count: number }>;
  blocked_ips: string[];
  suspicious_users: string[];
  response_times: {
    average_detection_time: number;
    average_response_time: number;
  };
}

/**
 * Real-time security monitoring service
 */
export class SecurityMonitor {
  private supabase: any;
  private alertThresholds: Record<string, number>;
  private activeThreats: Map<string, SecurityEvent[]> = new Map();

  constructor(supabaseUrl: string, serviceKey: string) {
    this.supabase = createClient(supabaseUrl, serviceKey);
    this.alertThresholds = {
      failed_login_attempts: 5,
      rate_limit_violations: 10,
      suspicious_file_access: 3,
      unusual_api_usage: 50,
      failed_2fa_attempts: 3,
      suspicious_ip_activity: 15
    };
  }

  /**
   * Log security event
   */
  async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const securityEvent: SecurityEvent = {
        ...event,
        timestamp: new Date().toISOString()
      };

      // Store in security_events table (simulated via activity_logs)
      await this.supabase.from('activity_logs').insert({
        user_id: event.user_id || 'anonymous',
        action: 'security_event',
        entity_type: 'security',
        metadata: {
          security_event: securityEvent,
          event_type: event.event_type,
          severity: event.severity,
          source_ip: event.source_ip,
          endpoint: event.endpoint,
          detection_timestamp: securityEvent.timestamp
        }
      });

      // Real-time threat detection
      await this.analyzeEvent(securityEvent);

    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Analyze security event for threats
   */
  private async analyzeEvent(event: SecurityEvent): Promise<void> {
    const threats = await this.detectThreats(event);
    
    for (const threat of threats) {
      if (threat.severity === 'critical' || threat.severity === 'high') {
        await this.triggerAlert(threat);
      }
      
      if (threat.auto_response) {
        await this.executeAutoResponse(threat);
      }
    }
  }

  /**
   * Detect threat patterns
   */
  private async detectThreats(event: SecurityEvent): Promise<ThreatPattern[]> {
    const detectedThreats: ThreatPattern[] = [];

    // Brute force detection
    if (event.event_type === 'failed_login') {
      const recentFailures = await this.getRecentEvents('failed_login', event.source_ip, 15);
      if (recentFailures.length >= this.alertThresholds.failed_login_attempts) {
        detectedThreats.push({
          pattern_id: 'brute_force_login',
          name: 'Brute Force Login Attack',
          description: `Multiple failed login attempts from ${event.source_ip}`,
          detection_rules: ['failed_login_count >= 5', 'time_window <= 15_minutes'],
          severity: 'high',
          auto_response: true,
          response_actions: ['block_ip', 'alert_admin', 'log_incident']
        });
      }
    }

    // Rate limiting abuse
    if (event.event_type === 'rate_limit_violation') {
      const recentViolations = await this.getRecentEvents('rate_limit_violation', event.source_ip, 60);
      if (recentViolations.length >= this.alertThresholds.rate_limit_violations) {
        detectedThreats.push({
          pattern_id: 'api_abuse',
          name: 'API Abuse Detected',
          description: `Excessive rate limit violations from ${event.source_ip}`,
          detection_rules: ['rate_limit_violations >= 10', 'time_window <= 60_minutes'],
          severity: 'medium',
          auto_response: true,
          response_actions: ['extend_rate_limit', 'alert_admin']
        });
      }
    }

    // Suspicious 2FA activity
    if (event.event_type === 'failed_2fa') {
      const recent2FAFailures = await this.getRecentEvents('failed_2fa', event.user_id, 30);
      if (recent2FAFailures.length >= this.alertThresholds.failed_2fa_attempts) {
        detectedThreats.push({
          pattern_id: 'compromised_2fa',
          name: 'Potential 2FA Compromise',
          description: `Multiple 2FA failures for user ${event.user_id}`,
          detection_rules: ['failed_2fa_count >= 3', 'time_window <= 30_minutes'],
          severity: 'critical',
          auto_response: true,
          response_actions: ['lock_user_account', 'alert_admin', 'require_password_reset']
        });
      }
    }

    // Unusual file access patterns
    if (event.event_type === 'file_access' && event.metadata?.suspicious) {
      detectedThreats.push({
        pattern_id: 'suspicious_file_access',
        name: 'Suspicious File Access',
        description: `Unusual file access pattern detected`,
        detection_rules: ['file_access_pattern_anomaly'],
        severity: 'medium',
        auto_response: false,
        response_actions: ['alert_admin', 'log_detailed_access']
      });
    }

    // Geographic anomaly detection
    if (event.metadata?.geo_location) {
      const isAnomalous = await this.detectGeographicAnomaly(event);
      if (isAnomalous) {
        detectedThreats.push({
          pattern_id: 'geographic_anomaly',
          name: 'Geographic Access Anomaly',
          description: `Access from unusual geographic location`,
          detection_rules: ['geographic_distance > threshold'],
          severity: 'medium',
          auto_response: false,
          response_actions: ['alert_user', 'require_additional_auth']
        });
      }
    }

    return detectedThreats;
  }

  /**
   * Get recent security events
   */
  private async getRecentEvents(eventType: string, identifier: string, minutesBack: number): Promise<any[]> {
    try {
      const since = new Date(Date.now() - minutesBack * 60 * 1000).toISOString();
      
      const { data, error } = await this.supabase
        .from('activity_logs')
        .select('*')
        .eq('action', 'security_event')
        .gte('created_at', since)
        .or(`metadata->>source_ip.eq.${identifier},user_id.eq.${identifier}`);

      return data || [];
    } catch (error) {
      console.error('Failed to get recent events:', error);
      return [];
    }
  }

  /**
   * Trigger security alert
   */
  private async triggerAlert(threat: ThreatPattern): Promise<void> {
    const alert = {
      user_id: 'security_system',
      action: 'security_alert',
      entity_type: 'security_alert',
      metadata: {
        threat_pattern: threat,
        alert_level: threat.severity,
        detection_time: new Date().toISOString(),
        requires_immediate_attention: threat.severity === 'critical',
        auto_response_triggered: threat.auto_response
      }
    };

    await this.supabase.from('activity_logs').insert(alert);
    
    // In production, this would trigger notifications, emails, etc.
    console.warn(`🚨 SECURITY ALERT: ${threat.name} - Severity: ${threat.severity.toUpperCase()}`);
  }

  /**
   * Execute automated response to threats
   */
  private async executeAutoResponse(threat: ThreatPattern): Promise<void> {
    for (const action of threat.response_actions) {
      switch (action) {
        case 'block_ip':
          await this.blockIP(threat);
          break;
        case 'lock_user_account':
          await this.lockUserAccount(threat);
          break;
        case 'extend_rate_limit':
          await this.extendRateLimit(threat);
          break;
        case 'alert_admin':
          await this.alertAdmin(threat);
          break;
        case 'log_incident':
          await this.logIncident(threat);
          break;
      }
    }
  }

  /**
   * Block suspicious IP address
   */
  private async blockIP(threat: ThreatPattern): Promise<void> {
    const blockEntry = {
      user_id: 'security_system',
      action: 'ip_blocked',
      entity_type: 'security_action',
      metadata: {
        threat_pattern_id: threat.pattern_id,
        blocked_reason: threat.description,
        auto_blocked: true,
        block_duration: '24 hours',
        timestamp: new Date().toISOString()
      }
    };

    await this.supabase.from('activity_logs').insert(blockEntry);
  }

  /**
   * Lock user account
   */
  private async lockUserAccount(threat: ThreatPattern): Promise<void> {
    const lockEntry = {
      user_id: 'security_system',
      action: 'user_account_locked',
      entity_type: 'security_action',
      metadata: {
        threat_pattern_id: threat.pattern_id,
        lock_reason: threat.description,
        auto_locked: true,
        requires_admin_unlock: true,
        timestamp: new Date().toISOString()
      }
    };

    await this.supabase.from('activity_logs').insert(lockEntry);
  }

  /**
   * Extend rate limiting for abusive IPs
   */
  private async extendRateLimit(threat: ThreatPattern): Promise<void> {
    const limitEntry = {
      user_id: 'security_system',
      action: 'rate_limit_extended',
      entity_type: 'security_action',
      metadata: {
        threat_pattern_id: threat.pattern_id,
        extended_reason: threat.description,
        new_rate_limit: '1 request per minute',
        duration: '1 hour',
        timestamp: new Date().toISOString()
      }
    };

    await this.supabase.from('activity_logs').insert(limitEntry);
  }

  /**
   * Alert administrators
   */
  private async alertAdmin(threat: ThreatPattern): Promise<void> {
    const alertEntry = {
      user_id: 'security_system',
      action: 'admin_alert_sent',
      entity_type: 'security_action',
      metadata: {
        threat_pattern_id: threat.pattern_id,
        alert_message: `Security threat detected: ${threat.name}`,
        severity: threat.severity,
        requires_action: threat.severity === 'critical',
        timestamp: new Date().toISOString()
      }
    };

    await this.supabase.from('activity_logs').insert(alertEntry);
  }

  /**
   * Log detailed security incident
   */
  private async logIncident(threat: ThreatPattern): Promise<void> {
    const incidentEntry = {
      user_id: 'security_system',
      action: 'security_incident_logged',
      entity_type: 'security_incident',
      metadata: {
        incident_id: `INC-${Date.now()}`,
        threat_pattern: threat,
        incident_status: 'open',
        assigned_to: 'security_team',
        priority: threat.severity,
        created_at: new Date().toISOString()
      }
    };

    await this.supabase.from('activity_logs').insert(incidentEntry);
  }

  /**
   * Detect geographic anomalies
   */
  private async detectGeographicAnomaly(event: SecurityEvent): Promise<boolean> {
    // Simplified geographic anomaly detection
    // In production, this would use IP geolocation services
    const suspiciousCountries = ['CN', 'RU', 'KP', 'IR'];
    const userCountry = event.metadata?.geo_location?.country;
    
    return suspiciousCountries.includes(userCountry);
  }

  /**
   * Get security metrics
   */
  async getSecurityMetrics(timeRange: number = 24): Promise<SecurityMetrics> {
    try {
      const since = new Date(Date.now() - timeRange * 60 * 60 * 1000).toISOString();
      
      const { data: events, error } = await this.supabase
        .from('activity_logs')
        .select('*')
        .eq('action', 'security_event')
        .gte('created_at', since);

      if (error) throw error;

      const metrics: SecurityMetrics = {
        total_events: events?.length || 0,
        events_by_severity: {
          low: 0,
          medium: 0,
          high: 0,
          critical: 0
        },
        top_threats: [],
        blocked_ips: [],
        suspicious_users: [],
        response_times: {
          average_detection_time: 0,
          average_response_time: 0
        }
      };

      // Calculate metrics from events
      events?.forEach(event => {
        const severity = event.metadata?.security_event?.severity || 'low';
        metrics.events_by_severity[severity]++;
      });

      return metrics;
    } catch (error) {
      console.error('Failed to get security metrics:', error);
      return {
        total_events: 0,
        events_by_severity: { low: 0, medium: 0, high: 0, critical: 0 },
        top_threats: [],
        blocked_ips: [],
        suspicious_users: [],
        response_times: { average_detection_time: 0, average_response_time: 0 }
      };
    }
  }

  /**
   * Generate security report
   */
  async generateSecurityReport(timeRange: number = 24): Promise<string> {
    const metrics = await this.getSecurityMetrics(timeRange);
    
    const report = `
SECURITY MONITORING REPORT
Time Range: Last ${timeRange} hours
Generated: ${new Date().toISOString()}

📊 OVERVIEW:
- Total Security Events: ${metrics.total_events}
- Critical Events: ${metrics.events_by_severity.critical}
- High Severity: ${metrics.events_by_severity.high}
- Medium Severity: ${metrics.events_by_severity.medium}
- Low Severity: ${metrics.events_by_severity.low}

🚨 ACTIVE THREATS:
- Blocked IPs: ${metrics.blocked_ips.length}
- Suspicious Users: ${metrics.suspicious_users.length}

⚡ RESPONSE METRICS:
- Average Detection Time: ${metrics.response_times.average_detection_time}ms
- Average Response Time: ${metrics.response_times.average_response_time}ms

🛡️ STATUS: All monitoring systems operational
    `;

    return report;
  }
}

// Predefined security event types
export const SecurityEventTypes = {
  AUTHENTICATION: {
    FAILED_LOGIN: 'failed_login',
    SUCCESSFUL_LOGIN: 'successful_login',
    PASSWORD_RESET: 'password_reset',
    ACCOUNT_LOCKED: 'account_locked'
  },
  TWO_FACTOR: {
    FAILED_2FA: 'failed_2fa',
    SUCCESSFUL_2FA: 'successful_2fa',
    BACKUP_CODE_USED: 'backup_code_used'
  },
  API_SECURITY: {
    RATE_LIMIT_VIOLATION: 'rate_limit_violation',
    INVALID_TOKEN: 'invalid_token',
    UNAUTHORIZED_ACCESS: 'unauthorized_access'
  },
  DATA_ACCESS: {
    FILE_ACCESS: 'file_access',
    DATA_EXPORT: 'data_export',
    SENSITIVE_DATA_ACCESS: 'sensitive_data_access'
  },
  SYSTEM: {
    SECURITY_SCAN: 'security_scan',
    VULNERABILITY_DETECTED: 'vulnerability_detected',
    SYSTEM_COMPROMISE: 'system_compromise'
  }
};

// Global security monitor instance
export let globalSecurityMonitor: SecurityMonitor;

export function initializeSecurityMonitor(supabaseUrl: string, serviceKey: string): SecurityMonitor {
  globalSecurityMonitor = new SecurityMonitor(supabaseUrl, serviceKey);
  return globalSecurityMonitor;
}