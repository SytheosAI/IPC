'use client';

import { useState, useEffect } from 'react';
import { Shield, Smartphone, QrCode, Copy, CheckCircle, AlertCircle, Phone, Key } from 'lucide-react';
import { generateTOTPSecret, store2FASettings, get2FASettings, disable2FA, sendSMSCode, verifyTOTPCode, verifySMSCode, TwoFactorSettings } from '../lib/2fa-utils';

interface TwoFactorAuthProps {
  userId: string;
  onSettingsChange?: (settings: TwoFactorSettings | null) => void;
}

export default function TwoFactorAuth({ userId, onSettingsChange }: TwoFactorAuthProps) {
  const [settings, setSettings] = useState<TwoFactorSettings | null>(null);
  const [setupMode, setSetupMode] = useState<'none' | 'totp' | 'sms'>('none');
  const [totpSetup, setTotpSetup] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [smsSetup, setSmsSetup] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [userId]);

  const loadSettings = async () => {
    try {
      const userSettings = await get2FASettings(userId);
      setSettings(userSettings);
      onSettingsChange?.(userSettings);
    } catch (error) {
      console.error('Failed to load 2FA settings:', error);
    }
  };

  const startTOTPSetup = () => {
    const setup = generateTOTPSecret('user@example.com', 'IPC System');
    setTotpSetup(setup);
    setSetupMode('totp');
    setError('');
    setSuccess('');
  };

  const startSMSSetup = () => {
    setSetupMode('sms');
    setError('');
    setSuccess('');
  };

  const sendSMSVerification = async () => {
    if (!phoneNumber) {
      setError('Please enter a phone number');
      return;
    }

    setLoading(true);
    try {
      const result = await sendSMSCode(phoneNumber);
      setSmsSetup(result);
      setSuccess('Verification code sent to your phone');
      setError('');
    } catch (error) {
      setError('Failed to send SMS verification code');
    } finally {
      setLoading(false);
    }
  };

  const verifyTOTP = async () => {
    if (!verificationCode || !totpSetup) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    try {
      const isValid = verifyTOTPCode(totpSetup.secret, verificationCode);
      
      if (isValid) {
        const result = await store2FASettings(userId, {
          totp_enabled: true,
          totp_secret: totpSetup.secret,
          backup_codes: totpSetup.backupCodes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (result.success) {
          setSuccess('TOTP authentication enabled successfully!');
          setSetupMode('none');
          setTotpSetup(null);
          setVerificationCode('');
          await loadSettings();
        } else {
          setError(result.error || 'Failed to enable TOTP');
        }
      } else {
        setError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      setError('Failed to verify TOTP code');
    } finally {
      setLoading(false);
    }
  };

  const verifySMS = async () => {
    if (!smsCode || !smsSetup) {
      setError('Please enter the SMS verification code');
      return;
    }

    setLoading(true);
    try {
      const isValid = verifySMSCode(smsCode, smsSetup.verificationCode, smsSetup.expiresAt);
      
      if (isValid) {
        const result = await store2FASettings(userId, {
          sms_enabled: true,
          phone_number: phoneNumber,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        if (result.success) {
          setSuccess('SMS authentication enabled successfully!');
          setSetupMode('none');
          setSmsSetup(null);
          setSmsCode('');
          setPhoneNumber('');
          await loadSettings();
        } else {
          setError(result.error || 'Failed to enable SMS authentication');
        }
      } else {
        setError('Invalid or expired SMS code. Please try again.');
      }
    } catch (error) {
      setError('Failed to verify SMS code');
    } finally {
      setLoading(false);
    }
  };

  const disableTwoFactor = async () => {
    if (!confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
      return;
    }

    setLoading(true);
    try {
      const result = await disable2FA(userId);
      
      if (result.success) {
        setSuccess('Two-factor authentication disabled');
        await loadSettings();
      } else {
        setError(result.error || 'Failed to disable 2FA');
      }
    } catch (error) {
      setError('Failed to disable two-factor authentication');
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    if (totpSetup?.manualEntryKey) {
      navigator.clipboard.writeText(totpSetup.manualEntryKey);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const cancel = () => {
    setSetupMode('none');
    setTotpSetup(null);
    setSmsSetup(null);
    setVerificationCode('');
    setSmsCode('');
    setPhoneNumber('');
    setError('');
    setSuccess('');
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-lg rounded-xl p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-6 w-6 text-yellow-400" />
        <h3 className="text-xl font-semibold text-white">Two-Factor Authentication</h3>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <span className="text-red-300 text-sm">{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <span className="text-green-300 text-sm">{success}</span>
        </div>
      )}

      {/* Current Status */}
      {settings && (
        <div className="mb-6 p-4 bg-gray-700/50 rounded-lg">
          <h4 className="text-lg font-medium text-white mb-3">Current Status</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">TOTP (Authenticator App)</span>
              <span className={`text-sm px-2 py-1 rounded ${
                settings.totp_enabled 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {settings.totp_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">SMS Authentication</span>
              <span className={`text-sm px-2 py-1 rounded ${
                settings.sms_enabled 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {settings.sms_enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            {settings.phone_number && (
              <div className="text-sm text-gray-400">
                Phone: {settings.phone_number}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Setup Mode: None */}
      {setupMode === 'none' && (
        <div className="space-y-4">
          <p className="text-gray-300 mb-4">
            Add an extra layer of security to your account with two-factor authentication.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* TOTP Setup */}
            <div className="p-4 border border-gray-600 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Smartphone className="h-5 w-5 text-blue-400" />
                <h5 className="font-medium text-white">Authenticator App</h5>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Use apps like Google Authenticator or Authy to generate codes.
              </p>
              <button
                onClick={startTOTPSetup}
                disabled={loading || settings?.totp_enabled}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
              >
                {settings?.totp_enabled ? 'Already Enabled' : 'Setup TOTP'}
              </button>
            </div>

            {/* SMS Setup */}
            <div className="p-4 border border-gray-600 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Phone className="h-5 w-5 text-green-400" />
                <h5 className="font-medium text-white">SMS Authentication</h5>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Receive verification codes via text message.
              </p>
              <button
                onClick={startSMSSetup}
                disabled={loading || settings?.sms_enabled}
                className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
              >
                {settings?.sms_enabled ? 'Already Enabled' : 'Setup SMS'}
              </button>
            </div>
          </div>

          {/* Disable 2FA */}
          {(settings?.totp_enabled || settings?.sms_enabled) && (
            <div className="mt-6 pt-4 border-t border-gray-600">
              <button
                onClick={disableTwoFactor}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                Disable Two-Factor Authentication
              </button>
            </div>
          )}
        </div>
      )}

      {/* TOTP Setup Mode */}
      {setupMode === 'totp' && totpSetup && (
        <div className="space-y-6">
          <div className="text-center">
            <h4 className="text-lg font-medium text-white mb-4">Setup Authenticator App</h4>
            
            {/* QR Code */}
            <div className="bg-white p-4 rounded-lg inline-block mb-4">
              <img src={totpSetup.qrCodeUrl} alt="QR Code" className="w-48 h-48" />
            </div>
            
            {/* Manual Entry */}
            <div className="p-4 bg-gray-700/50 rounded-lg mb-4">
              <p className="text-sm text-gray-400 mb-2">Can't scan? Enter this key manually:</p>
              <div className="flex items-center gap-2 justify-center">
                <code className="text-sm font-mono text-yellow-400 bg-gray-800 px-2 py-1 rounded">
                  {totpSetup.manualEntryKey}
                </code>
                <button
                  onClick={copySecret}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                >
                  {copiedSecret ? <CheckCircle className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Verification */}
            <div className="max-w-xs mx-auto">
              <label className="block text-sm text-gray-400 mb-2">
                Enter the code from your authenticator app:
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-center text-white text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            {/* Backup Codes */}
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg mt-4">
              <p className="text-sm text-yellow-300 mb-2">⚠️ Save these backup codes:</p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                {totpSetup.backupCodes.map((code: string, index: number) => (
                  <span key={index} className="text-yellow-400">{code}</span>
                ))}
              </div>
              <p className="text-xs text-yellow-300 mt-2">
                Use these codes if you lose access to your authenticator app.
              </p>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={cancel}
              disabled={loading}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={verifyTOTP}
              disabled={loading || verificationCode.length !== 6}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify & Enable'}
            </button>
          </div>
        </div>
      )}

      {/* SMS Setup Mode */}
      {setupMode === 'sms' && (
        <div className="space-y-6">
          <div className="max-w-sm mx-auto">
            <h4 className="text-lg font-medium text-white mb-4 text-center">Setup SMS Authentication</h4>
            
            {!smsSetup ? (
              <>
                <label className="block text-sm text-gray-400 mb-2">
                  Enter your phone number:
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
                <div className="flex gap-3 justify-center mt-4">
                  <button
                    onClick={cancel}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={sendSMSVerification}
                    disabled={loading || !phoneNumber}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
                  >
                    {loading ? 'Sending...' : 'Send Code'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-400 mb-4 text-center">
                  Enter the verification code sent to {phoneNumber}
                </p>
                <input
                  type="text"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-center text-white text-lg tracking-widest"
                  maxLength={6}
                />
                <div className="flex gap-3 justify-center mt-4">
                  <button
                    onClick={cancel}
                    disabled={loading}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={verifySMS}
                    disabled={loading || smsCode.length !== 6}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm transition-colors"
                  >
                    {loading ? 'Verifying...' : 'Verify & Enable'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}