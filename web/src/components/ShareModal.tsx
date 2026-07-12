import React, { useState } from 'react';
import api from '../api';

interface ShareModalProps {
  documentId?: number;
  personId?: number;
  personName?: string;
  isOpen: boolean;
  onClose: () => void;
  onShareSuccess?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  documentId,
  personId,
  personName,
  isOpen,
  onClose,
  onShareSuccess,
}) => {
  const isPersonMode = personId !== undefined;
  const [recipientEmail, setRecipientEmail] = useState('');
  const [permissionLevel, setPermissionLevel] = useState<'read' | 'edit' | 'download'>('read');
  const [isInvite, setIsInvite] = useState(false);
  const [includeFuture, setIncludeFuture] = useState(true);
  const [expiresInDays, setExpiresInDays] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showInviteOption, setShowInviteOption] = useState(false);

  const handleShare = async () => {
    if (!recipientEmail.trim()) {
      setError('Please enter a recipient email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      setError('Please enter a valid email address (e.g., bob@neverexpire.test)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const body: Record<string, unknown> = {
        recipient_email: recipientEmail,
        permission_level: permissionLevel,
        is_invite: isInvite,
        expires_in_days: expiresInDays ? Number(expiresInDays) : null,
      };
      if (isPersonMode) {
        await api.post(`/persons/${personId}/share-all`, { ...body, include_future: includeFuture });
      } else {
        await api.post(`/documents/${documentId}/share`, body);
      }

      setRecipientEmail('');
      setPermissionLevel('read');
      setIsInvite(false);
      setIncludeFuture(true);
      setExpiresInDays('');
      onShareSuccess?.();
      onClose();
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to share document';

      // Check if user doesn't exist
      if (errorMsg.includes('User not found') || errorMsg.includes('not found')) {
        setError(`User not found with email: ${recipientEmail}`);
        setShowInviteOption(true);
      } else {
        setError(errorMsg);
        setShowInviteOption(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvitation = async () => {
    // Mock email invitation
    const message = `Hi ${recipientEmail.split('@')[0]},\n\nYou've been invited to join NeverExpire - a document expiry tracker.\n\nVisit: http://localhost:5173/register\n\nThen, you can access shared documents!\n\nBest regards,\nNeverExpire Team`;

    console.log(`[MOCK EMAIL] Invitation sent to ${recipientEmail}:`);
    console.log(message);

    setError(`Invitation sent to ${recipientEmail}!`);
    setShowInviteOption(false);
    setRecipientEmail('');
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
        padding: '24px',
        width: '100%',
        maxWidth: '420px',
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
          {isPersonMode ? `Share All of ${personName}'s Documents` : 'Share Document'}
        </h2>

        {error && (
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: showInviteOption ? '#fef3c7' : '#fee2e2', color: showInviteOption ? '#92400e' : '#dc2626', borderRadius: '4px', border: showInviteOption ? '1px solid #fde68a' : '1px solid #fecaca' }}>
            <div>{error}</div>
            {showInviteOption && (
              <button
                onClick={handleSendInvitation}
                style={{
                  marginTop: '8px',
                  padding: '6px 12px',
                  backgroundColor: '#34c9ba',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                📧 Send Invitation
              </button>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Recipient Email Address
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="e.g., bob@neverexpire.test"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#14b8a6'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
            />
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              Enter the email address of the person you want to share with
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Permission Level
            </label>
            <select
              value={permissionLevel}
              onChange={(e) => setPermissionLevel(e.target.value as any)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#14b8a6'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
            >
              <option value="read">Read Only (view document)</option>
              <option value="edit">Edit (modify fields)</option>
              <option value="download">Download (download file)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
              Access Duration
            </label>
            <select
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#14b8a6'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#d1d5db'}
            >
              <option value="">No expiry (until revoked)</option>
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center' }}>
            <input
              type="checkbox"
              id="is-invite"
              checked={isInvite}
              onChange={(e) => setIsInvite(e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer' }}
            />
            <label htmlFor="is-invite" style={{ marginLeft: '8px', fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
              Send as invite (requires acceptance)
            </label>
          </div>

          {isPersonMode && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="include-future"
                checked={includeFuture}
                onChange={(e) => setIncludeFuture(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <label htmlFor="include-future" style={{ marginLeft: '8px', fontSize: '14px', color: '#374151', cursor: 'pointer' }}>
                Also share documents added in the future
              </label>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={onClose}
            style={{ flex: 1, padding: '10px 16px', border: '1px solid #d1d5db', borderRadius: '4px', color: '#374151', backgroundColor: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={loading}
            style={{ flex: 1, padding: '10px 16px', backgroundColor: loading ? '#9ca3af' : '#0d9488', color: 'white', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#0f766e')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#0d9488')}
          >
            {loading ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  );
};
