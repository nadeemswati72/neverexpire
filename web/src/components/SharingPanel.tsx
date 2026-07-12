import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

interface Share {
  share_id: number;
  document_id: number;
  document_title: string;
  shared_by_email?: string;
  shared_with_email?: string;
  permission_level: string;
  is_invite: boolean;
  response: string;
  created_at: string;
  expires_at?: string | null;
  is_expired?: boolean;
}

function formatExpiry(expiresAt?: string | null, isExpired?: boolean) {
  if (!expiresAt) return null
  const date = new Date(expiresAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  return isExpired ? `Expired ${date}` : `Expires ${date}`
}

interface Recipient {
  user_id: number;
  email: string;
  full_name: string;
  documents_shared: number;
  persons_shared: number;
}

type TabType = 'incoming' | 'outgoing' | 'recipients';

export default function SharingPanel() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('incoming');
  const [incoming, setIncoming] = useState<Share[]>([]);
  const [outgoing, setOutgoing] = useState<Share[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'incoming') {
        const res = await api.get('/sharing/incoming');
        setIncoming(res.data.data);
      } else if (activeTab === 'outgoing') {
        const res = await api.get('/sharing/outgoing');
        setOutgoing(res.data.data);
      } else {
        const res = await api.get('/sharing/recipients');
        setRecipients(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load sharing data');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (shareId: number, type: 'share' | 'grant') => {
    if (!window.confirm('Are you sure you want to revoke this share?')) return;

    try {
      const endpoint = type === 'share' ? `/shares/${shareId}` : `/share-grants/${shareId}`;
      await api.delete(endpoint);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to revoke share');
    }
  };

  const tabStyle = (isActive: boolean) => ({
    padding: '12px 16px',
    border: 'none',
    backgroundColor: isActive ? 'rgba(52, 201, 186, 0.1)' : 'transparent',
    color: isActive ? '#34c9ba' : '#8a9ab5',
    fontWeight: isActive ? '600' : '400',
    cursor: 'pointer',
    borderBottom: isActive ? '2px solid #34c9ba' : '2px solid transparent',
  });

  return (
    <div style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderRadius: 16, padding: '20px' }}>
      <h2 style={{ marginTop: 0, fontSize: 18, fontWeight: 700, color: '#15203a' }}>Document Sharing</h2>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(30,45,80,0.1)', marginBottom: '20px' }}>
        <button style={tabStyle(activeTab === 'incoming')} onClick={() => setActiveTab('incoming')}>
          📥 Shared With Me
        </button>
        <button style={tabStyle(activeTab === 'outgoing')} onClick={() => setActiveTab('outgoing')}>
          📤 Documents I Shared
        </button>
        <button style={tabStyle(activeTab === 'recipients')} onClick={() => setActiveTab('recipients')}>
          👥 My Recipients
        </button>
      </div>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#8a9ab5' }}>Loading...</div>
      ) : (
        <>
          {/* Incoming Shares */}
          {activeTab === 'incoming' && (
            <div>
              {incoming.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#8a9ab5' }}>
                  No documents shared with you yet
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {incoming.map(share => (
                    <div
                      key={share.share_id}
                      onClick={() => navigate(`/documents/${share.document_id}`)}
                      style={{
                        padding: '16px',
                        backgroundColor: 'rgba(255,255,255,0.6)',
                        borderRadius: '8px',
                        border: '1px solid rgba(30,45,80,0.1)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.backgroundColor = 'rgba(52,201,186,0.08)';
                        el.style.borderColor = '#34c9ba';
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.backgroundColor = 'rgba(255,255,255,0.6)';
                        el.style.borderColor = 'rgba(30,45,80,0.1)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, color: '#15203a', fontSize: 14 }}>{share.document_title}</div>
                          <div style={{ fontSize: 12, color: '#8a9ab5', marginTop: 4 }}>
                            Shared by: <strong>{share.shared_by_email}</strong>
                          </div>
                          <div style={{ fontSize: 12, color: '#8a9ab5', marginTop: 2 }}>
                            Permission: <strong>{share.permission_level.toUpperCase()}</strong> {share.is_invite && '(Pending)'}
                          </div>
                          {share.expires_at && (
                            <div style={{ fontSize: 11, marginTop: 4, color: share.is_expired ? '#c53030' : '#b45309', fontWeight: 600 }}>
                              ⏳ {formatExpiry(share.expires_at, share.is_expired)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Outgoing Shares */}
          {activeTab === 'outgoing' && (
            <div>
              {outgoing.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#8a9ab5' }}>
                  You haven't shared any documents yet
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {outgoing.map(share => (
                    <div
                      key={share.share_id}
                      style={{
                        padding: '16px',
                        backgroundColor: 'rgba(255,255,255,0.6)',
                        borderRadius: '8px',
                        border: '1px solid rgba(30,45,80,0.1)',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.backgroundColor = 'rgba(52,201,186,0.08)';
                        el.style.borderColor = '#34c9ba';
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLDivElement;
                        el.style.backgroundColor = 'rgba(255,255,255,0.6)';
                        el.style.borderColor = 'rgba(30,45,80,0.1)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px' }}>
                        <div
                          style={{ flex: 1, cursor: 'pointer' }}
                          onClick={() => navigate(`/documents/${share.document_id}`)}
                        >
                          <div style={{ fontWeight: 600, color: '#15203a', fontSize: 14 }}>{share.document_title}</div>
                          <div style={{ fontSize: 12, color: '#8a9ab5', marginTop: 4 }}>
                            Shared with: <strong>{share.shared_with_email}</strong>
                          </div>
                          <div style={{ fontSize: 12, color: '#8a9ab5', marginTop: 2 }}>
                            Permission: <strong>{share.permission_level.toUpperCase()}</strong> {share.is_invite && '(Pending)'}
                          </div>
                          {share.expires_at && (
                            <div style={{ fontSize: 11, marginTop: 4, color: share.is_expired ? '#c53030' : '#b45309', fontWeight: 600 }}>
                              ⏳ {formatExpiry(share.expires_at, share.is_expired)}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRevoke(share.share_id, 'share');
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#fee2e2',
                            color: '#dc2626',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                        >
                          Revoke
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Recipients */}
          {activeTab === 'recipients' && (
            <div>
              {recipients.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#8a9ab5' }}>
                  You haven't shared with anyone yet
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {recipients.map(recipient => (
                    <div key={recipient.user_id} style={{ padding: '16px', backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: '8px', border: '1px solid rgba(30,45,80,0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: '#15203a', fontSize: 14 }}>{recipient.full_name}</div>
                          <div style={{ fontSize: 12, color: '#8a9ab5', marginTop: 4 }}>
                            {recipient.email}
                          </div>
                          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
                            📄 {recipient.documents_shared} document{recipient.documents_shared !== 1 ? 's' : ''} {recipient.persons_shared > 0 && `• 👥 ${recipient.persons_shared} person share${recipient.persons_shared !== 1 ? 's' : ''}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
