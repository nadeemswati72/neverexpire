import React, { useState } from 'react';
import { api } from '../api';

interface ShareModalProps {
  documentId: number;
  isOpen: boolean;
  onClose: () => void;
  onShareSuccess?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  documentId,
  isOpen,
  onClose,
  onShareSuccess,
}) => {
  const [sharedWithUserId, setSharedWithUserId] = useState('');
  const [permissionLevel, setPermissionLevel] = useState<'read' | 'edit' | 'download'>('read');
  const [isInvite, setIsInvite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleShare = async () => {
    if (!sharedWithUserId) {
      setError('Please enter a user ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await api.post(`/api/v1/documents/${documentId}/share`, {
        shared_with_user_id: parseInt(sharedWithUserId),
        permission_level: permissionLevel,
        is_invite: isInvite,
      });

      setSharedWithUserId('');
      setPermissionLevel('read');
      setIsInvite(false);
      onShareSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to share document');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Share Document</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded border border-red-300">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID to share with
            </label>
            <input
              type="text"
              value={sharedWithUserId}
              onChange={(e) => setSharedWithUserId(e.target.value)}
              placeholder="Enter user ID"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Permission Level
            </label>
            <select
              value={permissionLevel}
              onChange={(e) => setPermissionLevel(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="read">Read Only (view document)</option>
              <option value="edit">Edit (modify fields)</option>
              <option value="download">Download (download file)</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is-invite"
              checked={isInvite}
              onChange={(e) => setIsInvite(e.target.checked)}
              className="w-4 h-4 text-teal-600"
            />
            <label htmlFor="is-invite" className="ml-2 text-sm text-gray-700">
              Send as invite (requires acceptance)
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 disabled:opacity-50"
          >
            {loading ? 'Sharing...' : 'Share'}
          </button>
        </div>
      </div>
    </div>
  );
};
