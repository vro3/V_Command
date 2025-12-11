import { useState } from 'react';
import { X, Send, Loader2 } from 'lucide-react';
import { getStoredAuth } from '../../services/authService';

const LEADTRACK_API = 'https://leadtrack-api-663014504688.us-central1.run.app';

interface EmailComposerProps {
  onClose: () => void;
  onSent?: () => void;
}

export function EmailComposer({ onClose, onSent }: EmailComposerProps) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSend = async () => {
    if (!to || !subject || !body) {
      setError('Please fill in all fields');
      return;
    }

    // Basic email validation
    if (!to.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    const auth = getStoredAuth();
    if (!auth) {
      setError('Not authenticated');
      return;
    }

    setSending(true);
    setError(null);

    try {
      // Create the auth token for LeadTrack API
      // LeadTrack expects encrypted tokens, but we'll try with our base64 format
      const tokenData = btoa(JSON.stringify(auth));

      const response = await fetch(`${LEADTRACK_API}/api/gmail/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenData}`,
        },
        body: JSON.stringify({ to, subject, body }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send email');
      }

      setSuccess(true);
      setTimeout(() => {
        onSent?.();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Email send error:', err);
      setError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <h2 className="text-[14px] font-semibold text-slate-200">New Email</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          {/* To */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
              To
            </label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[13px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent/50"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[13px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent/50"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
              Message
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message..."
              rows={8}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[13px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent/50 resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-[12px] text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Success */}
          {success && (
            <p className="text-[12px] text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg">
              Email sent successfully!
            </p>
          )}

          {/* From indicator */}
          <p className="text-[11px] text-slate-500">
            Sending from: vr@vrcreativegroup.com
          </p>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={sending || success}
            className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-slate-950 text-[13px] font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
