import { useState } from 'react';
import { X, UserPlus, Loader2, Sparkles, Check } from 'lucide-react';
import { getStoredAuth } from '../../services/authService';

interface LeadCaptureProps {
  onClose: () => void;
  onAdded?: () => void;
}

interface ParsedLead {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  eventType?: string;
  eventDate?: string;
  venue?: string;
  budget?: string;
  notes?: string;
  source?: string;
}

export function LeadCapture({ onClose, onAdded }: LeadCaptureProps) {
  const [rawInput, setRawInput] = useState('');
  const [parsedLead, setParsedLead] = useState<ParsedLead | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Parse raw input with AI
  const handleParse = async () => {
    if (!rawInput.trim()) {
      setError('Please enter some lead information');
      return;
    }

    setIsParsing(true);
    setError(null);

    try {
      const response = await fetch('/api/leads/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: rawInput }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse lead information');
      }

      const data = await response.json();
      setParsedLead(data);
    } catch (err) {
      console.error('Parse error:', err);
      setError('Failed to parse lead information. Try again.');
    } finally {
      setIsParsing(false);
    }
  };

  // Save lead to CRM spreadsheet
  const handleSave = async () => {
    if (!parsedLead) return;

    const auth = getStoredAuth();
    if (!auth?.tokens) {
      setError('Not authenticated');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const token = btoa(JSON.stringify(auth.tokens));

      const response = await fetch('/api/leads/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(parsedLead),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save lead');
      }

      setSuccess(true);
      setTimeout(() => {
        onAdded?.();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save lead');
    } finally {
      setIsSaving(false);
    }
  };

  // Update a field in parsedLead
  const updateField = (field: keyof ParsedLead, value: string) => {
    if (parsedLead) {
      setParsedLead({ ...parsedLead, [field]: value });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-accent" />
            <h2 className="text-[14px] font-semibold text-slate-200">New Lead</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!parsedLead ? (
            // Step 1: Raw input
            <>
              <div>
                <label className="block text-[11px] font-medium text-slate-500 uppercase tracking-wider mb-1.5">
                  Paste or type lead information
                </label>
                <textarea
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  placeholder="Paste an email, copy contact info, or just type what you know...

Example:
Got an inquiry from Sarah Johnson at Marriott Hotels. She's looking for entertainment for their annual gala on March 15th. Budget around $5k. Email: sarah.johnson@marriott.com"
                  rows={8}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-[13px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent/50 resize-none"
                  autoFocus
                />
              </div>
              <p className="text-[11px] text-slate-500">
                AI will extract contact details, event info, and organize it for your CRM.
              </p>
            </>
          ) : (
            // Step 2: Review & edit parsed data
            <>
              <p className="text-[11px] text-slate-400 mb-2">
                Review and edit the extracted information:
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={parsedLead.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[12px] text-slate-200 focus:outline-none focus:border-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    value={parsedLead.company || ''}
                    onChange={(e) => updateField('company', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[12px] text-slate-200 focus:outline-none focus:border-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={parsedLead.email || ''}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[12px] text-slate-200 focus:outline-none focus:border-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={parsedLead.phone || ''}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[12px] text-slate-200 focus:outline-none focus:border-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                    Event Type
                  </label>
                  <input
                    type="text"
                    value={parsedLead.eventType || ''}
                    onChange={(e) => updateField('eventType', e.target.value)}
                    placeholder="Corporate, Wedding, etc."
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[12px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                    Event Date
                  </label>
                  <input
                    type="text"
                    value={parsedLead.eventDate || ''}
                    onChange={(e) => updateField('eventDate', e.target.value)}
                    placeholder="March 15, 2025"
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[12px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={parsedLead.venue || ''}
                    onChange={(e) => updateField('venue', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[12px] text-slate-200 focus:outline-none focus:border-accent/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                    Budget
                  </label>
                  <input
                    type="text"
                    value={parsedLead.budget || ''}
                    onChange={(e) => updateField('budget', e.target.value)}
                    placeholder="$5,000"
                    className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[12px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-accent/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Notes
                </label>
                <textarea
                  value={parsedLead.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                  rows={3}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[12px] text-slate-200 focus:outline-none focus:border-accent/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Lead Source
                </label>
                <input
                  type="text"
                  value={parsedLead.source || ''}
                  onChange={(e) => updateField('source', e.target.value)}
                  placeholder="Email, Referral, Website, etc."
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[12px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-accent/50"
                />
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <p className="text-[12px] text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Success */}
          {success && (
            <p className="text-[12px] text-emerald-400 bg-emerald-500/10 px-3 py-2 rounded-lg flex items-center gap-2">
              <Check className="w-4 h-4" />
              Lead added to CRM!
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-800 flex justify-between items-center">
          {parsedLead && (
            <button
              onClick={() => setParsedLead(null)}
              className="text-[12px] text-slate-400 hover:text-slate-200"
            >
              Back to edit
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[13px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            {!parsedLead ? (
              <button
                onClick={handleParse}
                disabled={isParsing || !rawInput.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-slate-950 text-[13px] font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isParsing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {isParsing ? 'Parsing...' : 'Parse with AI'}
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={isSaving || success}
                className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-slate-950 text-[13px] font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                {isSaving ? 'Saving...' : 'Add to CRM'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
