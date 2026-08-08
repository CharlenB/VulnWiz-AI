import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import type { UserInvitation } from '../../services/invitationService';
import { acceptInvitation } from '../../services/invitationService';
import { evaluatePasswordStrength, validateStrongPassword } from '../../services/saasAuthService';
import { PasswordRequirementsChecklist } from './PasswordRequirementsChecklist';
import type { UserAccount } from '../../types';

interface AcceptInviteModalProps {
  invitation: UserInvitation;
  onClose: () => void;
  onAcceptSuccess: (user: UserAccount) => void;
}

export const AcceptInviteModal: React.FC<AcceptInviteModalProps> = ({
  invitation,
  onClose,
  onAcceptSuccess,
}) => {
  const [fullName, setFullName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const passwordStrength = evaluatePasswordStrength(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const passwordVal = validateStrongPassword(password);
    if (!passwordVal.isValid) {
      setErrorMessage(`Password does not meet security requirements: ${passwordVal.errors.join(', ')}.`);
      return;
    }

    if (!passwordsMatch) {
      setErrorMessage('Passwords do not match. Please verify your password.');
      return;
    }

    setIsSubmitting(true);

    const result = acceptInvitation({
      token: invitation.token,
      fullName: fullName.trim(),
      password,
    });

    setIsSubmitting(false);

    if (result.success && result.user) {
      onAcceptSuccess(result.user);
    } else {
      setErrorMessage(result.error || 'Failed to accept invitation. Please try again.');
    }
  };

  const getStrengthBarColor = (score: number) => {
    switch (score) {
      case 1: return '#EF4444'; // Red
      case 2: return '#F59E0B'; // Amber
      case 3: return '#3B82F6'; // Blue
      case 4: return '#10B981'; // Green
      default: return '#CBD5E1';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
    }}>
      <div 
        style={{
          width: '540px',
          maxWidth: '100%',
          padding: '32px',
          background: '#FFFFFF',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 20px 50px -10px rgba(124, 58, 237, 0.18), 0 0 15px rgba(0, 0, 0, 0.05)',
          position: 'relative',
          color: '#0F172A',
        }}
      >
        {/* Brand & Security Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
            }}>
              <ShieldCheck size={24} color="#FFFFFF" />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#0F172A' }}>
                VulnWiz <span style={{ color: 'var(--accent-purple)' }}>AI</span>
              </div>
              <div style={{ fontSize: '0.725rem', color: 'var(--accent-purple)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Enterprise Team Onboarding
              </div>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose}
            style={{
              background: '#F1F5F9',
              border: '1px solid #E2E8F0',
              color: '#64748B',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
              transition: 'all 0.2s',
            }}
          >
            ✕
          </button>
        </div>

        {/* Invitation Welcome Banner (White & Purple styling) */}
        <div style={{
          background: 'linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%)',
          border: '1px solid #DDD6FE',
          borderRadius: '12px',
          padding: '18px 20px',
          marginBottom: '24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Sparkles size={16} color="var(--accent-purple)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-purple)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Invitation Details
            </span>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.45 }}>
            You've been invited by <span style={{ color: 'var(--accent-purple)' }}>"{invitation.inviterName}"</span> to join <span style={{ color: '#0F172A' }}>"{invitation.tenantName}"</span> as a <span style={{ color: 'var(--accent-purple)', background: '#FFFFFF', padding: '2px 8px', borderRadius: '6px', border: '1px solid #C4B5FD', fontWeight: 800 }}>{invitation.role}</span>
          </div>
        </div>

        {/* Error Alert Message */}
        {errorMessage && (
          <div style={{
            background: '#FEE2E2',
            border: '1px solid #FCA5A5',
            color: '#991B1B',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: 600 }}>{errorMessage}</span>
          </div>
        )}

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Invited User Email Box (Pre-filled & Read-only) */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Invited Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#64748B" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                readOnly
                disabled
                value={invitation.inviteeEmail}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '8px',
                  background: '#F1F5F9',
                  border: '1px solid #E2E8F0',
                  color: '#475569',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-mono)',
                  cursor: 'not-allowed',
                  outline: 'none',
                  fontWeight: 600,
                }}
              />
              <Lock size={16} color="#64748B" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          {/* Invited User Full Name Field */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Full Name *
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--accent-purple)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                required
                placeholder="e.g. Alex Vance"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px 12px 42px',
                  borderRadius: '8px',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  color: '#0F172A',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontWeight: 500,
                }}
              />
            </div>
          </div>

          {/* Create Password Field */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Create Password *
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--accent-purple)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Set a strong password (min 8 characters)"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 42px',
                  borderRadius: '8px',
                  background: '#F8FAFC',
                  border: '1px solid #CBD5E1',
                  color: '#0F172A',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Strength Bar */}
            {password.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.725rem', color: '#64748B', marginBottom: '4px' }}>
                  <span>Password Strength:</span>
                  <span style={{ color: getStrengthBarColor(passwordStrength.score), fontWeight: 700 }}>
                    {passwordStrength.label}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
                  {[1, 2, 3, 4].map(step => (
                    <div
                      key={step}
                      style={{
                        flex: 1,
                        borderRadius: '2px',
                        background: step <= passwordStrength.score ? getStrengthBarColor(passwordStrength.score) : '#E2E8F0',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <PasswordRequirementsChecklist password={password} />
          </div>

          {/* Verify Password Field */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
              Verify Password *
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--accent-purple)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter your password to confirm"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 44px 12px 42px',
                  borderRadius: '8px',
                  background: '#F8FAFC',
                  border: confirmPassword.length > 0
                    ? (passwordsMatch ? '1px solid #10B981' : '1px solid #EF4444')
                    : '1px solid #CBD5E1',
                  color: '#0F172A',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  cursor: 'pointer',
                }}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Password Match Status */}
            {confirmPassword.length > 0 && (
              <div style={{ marginTop: '6px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {passwordsMatch ? (
                  <span style={{ color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={14} /> Passwords match!
                  </span>
                ) : (
                  <span style={{ color: '#DC2626', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertCircle size={14} /> Passwords do not match
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Submit Sign Up Button */}
          <div style={{ marginTop: '12px' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? (
                'Processing Account Sign Up...'
              ) : (
                <>
                  Sign Up & Join Tenant Dashboard <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.75rem', color: '#64748B' }}>
          By signing up, you agree to VulnWiz AI Security Governance Policies & RBAC Controls.
        </div>
      </div>
    </div>
  );
};
