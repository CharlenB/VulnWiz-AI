import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { validateStrongPassword } from '../../services/saasAuthService';

interface PasswordRequirementsChecklistProps {
  password: string;
}

export const PasswordRequirementsChecklist: React.FC<PasswordRequirementsChecklistProps> = ({ password }) => {
  const val = validateStrongPassword(password);

  const requirements = [
    { label: 'At least 8 characters', met: val.hasMinLength },
    { label: 'Uppercase letter (A-Z)', met: val.hasUppercase },
    { label: 'Lowercase letter (a-z)', met: val.hasLowercase },
    { label: 'Number (0-9)', met: val.hasNumber },
    { label: 'Special character (!@#$%^&*)', met: val.hasSpecial },
  ];

  if (!password) return null;

  return (
    <div style={{
      marginTop: '8px',
      padding: '10px 12px',
      borderRadius: '8px',
      background: '#F8FAFC',
      border: '1px solid #E2E8F0',
      fontSize: '0.75rem',
    }}>
      <div style={{ fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
        Strong Password Security Checklist:
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
        {requirements.map((req, idx) => (
          <div 
            key={idx} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              color: req.met ? '#059669' : '#64748B',
              fontWeight: req.met ? 600 : 400
            }}
          >
            {req.met ? (
              <CheckCircle2 size={13} color="#059669" />
            ) : (
              <XCircle size={13} color="#94A3B8" />
            )}
            <span>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
