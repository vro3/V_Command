import { useState } from 'react';
import {
  Copy, Trash2, MoreHorizontal, UserPlus, Calendar,
  CheckCircle2, Edit3, RefreshCw, X, Check, Clock,
  Lightbulb, FileText, User, Target, BookOpen, CheckSquare
} from 'lucide-react';
import { Capture, SimpleType } from '../../types/atlas';

interface CaptureCardProps {
  capture: Capture;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, newContent: string) => void;
  onReprocess?: (id: string) => void;
  onCopy?: (content: string) => void;
  onAddToLeadTrack?: (capture: Capture) => void;
  onResearch?: (query: string) => void;
  compact?: boolean;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

// Format due date relative to today
function formatDueDate(dueDate: string | null | undefined): string | null {
  if (!dueDate) return null;

  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((due.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) return 'Overdue';
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return due.toLocaleDateString([], { weekday: 'short' });
  return due.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

// Get icon for simple type
function getTypeIcon(type: SimpleType | undefined) {
  switch (type) {
    case 'task': return CheckSquare;
    case 'reminder': return Clock;
    case 'idea': return Lightbulb;
    case 'note': return FileText;
    case 'contact': return User;
    case 'show': return Calendar;
    case 'lead': return Target;
    case 'reference': return BookOpen;
    default: return FileText;
  }
}

// Get styling for simple type
function getTypeStyle(type: SimpleType | undefined) {
  switch (type) {
    case 'task': return { color: 'text-blue-400', bg: 'bg-blue-500/10' };
    case 'reminder': return { color: 'text-orange-400', bg: 'bg-orange-500/10' };
    case 'idea': return { color: 'text-purple-400', bg: 'bg-purple-500/10' };
    case 'note': return { color: 'text-slate-400', bg: 'bg-slate-500/10' };
    case 'contact': return { color: 'text-green-400', bg: 'bg-green-500/10' };
    case 'show': return { color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    case 'lead': return { color: 'text-accent', bg: 'bg-accent/10' };
    case 'reference': return { color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
    default: return { color: 'text-slate-400', bg: 'bg-slate-500/10' };
  }
}

export function CaptureCard({
  capture,
  onDelete,
  onEdit,
  onReprocess,
  onCopy,
  onAddToLeadTrack,
  compact = false
}: CaptureCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(capture.rawContent);
  const [showMenu, setShowMenu] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);

  const TypeIcon = getTypeIcon(capture.simpleType);
  const typeStyle = getTypeStyle(capture.simpleType);
  const dueDateFormatted = formatDueDate(capture.dueDate);
  const isOverdue = dueDateFormatted === 'Overdue';
  const isDueToday = dueDateFormatted === 'Today';

  const handleCopy = () => {
    navigator.clipboard.writeText(capture.rawContent);
    onCopy?.(capture.rawContent);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== capture.rawContent) {
      onEdit?.(capture.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(capture.rawContent);
    setIsEditing(false);
  };

  const handleReprocess = async () => {
    setIsReprocessing(true);
    setShowMenu(false);
    await onReprocess?.(capture.id);
    setIsReprocessing(false);
  };

  // Compact view for sidebar - conversational style
  if (compact) {
    return (
      <div className={`bg-slate-900/50 border btn-squircle p-3 hover:border-slate-700 transition-colors group relative ${
        isOverdue ? 'border-red-500/30' :
        isDueToday ? 'border-orange-500/20' :
        capture.needsAction ? 'border-accent/20' :
        'border-slate-800'
      }`}>
        {/* Edit mode */}
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 text-[12px] bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveEdit}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-accent text-slate-950 text-[10px] font-medium rounded-lg hover:bg-accent-hover"
              >
                <Check className="w-3 h-3" />
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-slate-700 text-slate-300 text-[10px] font-medium rounded-lg hover:bg-slate-600"
              >
                <X className="w-3 h-3" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Header: Type icon + Due date + Menu */}
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5">
                {/* Type icon */}
                <span className={`p-1 rounded ${typeStyle.bg}`}>
                  <TypeIcon className={`w-3 h-3 ${typeStyle.color}`} />
                </span>
                {/* Due date badge */}
                {dueDateFormatted && (
                  <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                    isOverdue ? 'bg-red-500/20 text-red-400' :
                    isDueToday ? 'bg-orange-500/20 text-orange-400' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {dueDateFormatted}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-600 tabular-nums">
                  {formatDate(capture.createdAt)}
                </span>
                {/* Actions dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="p-1 text-slate-600 hover:text-slate-400 hover:bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                  {showMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-20 py-1">
                        <button
                          onClick={() => { setIsEditing(true); setShowMenu(false); }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-300 hover:bg-slate-700"
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={handleReprocess}
                          disabled={isReprocessing}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-300 hover:bg-slate-700 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3 h-3 ${isReprocessing ? 'animate-spin' : ''}`} />
                          Reprocess
                        </button>
                        <button
                          onClick={handleCopy}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-slate-300 hover:bg-slate-700"
                        >
                          <Copy className="w-3 h-3" />
                          Copy
                        </button>
                        <hr className="my-1 border-slate-700" />
                        <button
                          onClick={() => { onDelete?.(capture.id); setShowMenu(false); }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] text-red-400 hover:bg-slate-700"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Brain's response - conversational */}
            {capture.response && (
              <p className="text-[11px] text-slate-500 italic mb-1">
                {capture.response}
              </p>
            )}

            {/* Summary */}
            <p className="text-[12px] text-slate-300 line-clamp-2">{capture.summary}</p>

            {/* Time context */}
            {capture.timeContext && capture.timeContext !== 'no deadline' && !dueDateFormatted && (
              <p className="text-[10px] text-slate-500 mt-1">
                <Clock className="w-3 h-3 inline mr-1" />
                {capture.timeContext}
              </p>
            )}

            {/* Mentions - for context linking */}
            {capture.mentions && capture.mentions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {capture.mentions.slice(0, 3).map((mention, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded"
                  >
                    {mention}
                  </span>
                ))}
              </div>
            )}

            {/* Action needed */}
            {capture.needsAction && capture.suggestedAction && !capture.actionTaken && (
              <button
                onClick={() => onAddToLeadTrack?.(capture)}
                className={`mt-2 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 text-[11px] font-medium rounded-lg transition-colors ${
                  isOverdue
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : isDueToday
                    ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                    : 'bg-accent/10 text-accent hover:bg-accent/20'
                }`}
              >
                {capture.suggestedAction}
              </button>
            )}

            {/* Legacy: Quick action for leads */}
            {capture.simpleType === 'lead' && !capture.actionTaken && onAddToLeadTrack && !capture.suggestedAction && (
              <button
                onClick={() => onAddToLeadTrack(capture)}
                className="mt-2 w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-accent/10 text-accent text-[10px] font-medium rounded-lg hover:bg-accent/20 transition-colors"
              >
                <UserPlus className="w-3 h-3" />
                Add to LeadTrack
              </button>
            )}

            {capture.actionTaken === 'added_to_leadtrack' && (
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                Added to LeadTrack
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // Full card view - conversational style
  return (
    <div className={`bg-slate-900/50 border card-squircle p-4 hover:border-slate-700 transition-colors group ${
      isOverdue ? 'border-red-500/30' :
      isDueToday ? 'border-orange-500/20' :
      'border-slate-800'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={`p-1.5 rounded-lg ${typeStyle.bg}`}>
            <TypeIcon className={`w-4 h-4 ${typeStyle.color}`} />
          </span>
          {dueDateFormatted && (
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${
              isOverdue ? 'bg-red-500/20 text-red-400' :
              isDueToday ? 'bg-orange-500/20 text-orange-400' :
              'bg-slate-700 text-slate-400'
            }`}>
              {dueDateFormatted}
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-600 tabular-nums flex-shrink-0">
          {formatDate(capture.createdAt)}
        </span>
      </div>

      {/* Brain's response */}
      {capture.response && (
        <p className="text-[12px] text-slate-500 italic mb-2">
          "{capture.response}"
        </p>
      )}

      {/* Summary */}
      <p className="text-[13px] text-slate-200 mb-3 leading-relaxed">
        {capture.summary}
      </p>

      {/* Time context */}
      {capture.timeContext && capture.timeContext !== 'no deadline' && (
        <div className="flex items-center gap-1.5 text-[12px] text-slate-500 mb-3">
          <Clock className="w-3.5 h-3.5" />
          {capture.timeContext}
        </div>
      )}

      {/* Mentions */}
      {capture.mentions && capture.mentions.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {capture.mentions.map((mention, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded"
            >
              {mention}
            </span>
          ))}
        </div>
      )}

      {/* Tags */}
      {capture.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {capture.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] bg-slate-800/50 text-slate-500 px-2 py-0.5 btn-squircle"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Action */}
      {capture.needsAction && capture.suggestedAction && !capture.actionTaken && (
        <button
          onClick={() => onAddToLeadTrack?.(capture)}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 mb-3 text-[13px] font-medium rounded-lg transition-colors ${
            isOverdue
              ? 'bg-red-500 text-white hover:bg-red-600'
              : isDueToday
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-accent text-slate-950 hover:bg-accent-hover'
          }`}
        >
          {capture.suggestedAction}
        </button>
      )}

      {/* Action Taken */}
      {capture.actionTaken && (
        <div className="flex items-center justify-center gap-2 px-3 py-2 mb-3 bg-emerald-500/10 text-emerald-400 text-[12px] font-medium rounded-lg">
          <CheckCircle2 className="w-4 h-4" />
          Done
        </div>
      )}

      {/* Footer Actions */}
      {!isEditing && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 btn-squircle transition-colors"
                title="Edit"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
            {onReprocess && (
              <button
                onClick={handleReprocess}
                disabled={isReprocessing}
                className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 btn-squircle transition-colors disabled:opacity-50"
                title="Reprocess with AI"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isReprocessing ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 btn-squircle transition-colors"
              title="Copy content"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(capture.id)}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 btn-squircle transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-[10px] text-slate-600">
            {isReprocessing ? 'Reprocessing...' : ''}
          </div>
        </div>
      )}
    </div>
  );
}
