import { useState } from 'react';
import {
  Copy, Trash2, ExternalLink, MoreHorizontal, UserPlus, Calendar,
  CheckCircle2, Briefcase, Edit3, RefreshCw, X, Check, Mail, Phone,
  ArrowRight, Clock, Target
} from 'lucide-react';
import { Capture, CATEGORY_INFO, SuggestedAction } from '../../types/atlas';

interface CaptureCardProps {
  capture: Capture;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, newContent: string) => void;
  onReprocess?: (id: string) => void;
  onCopy?: (content: string) => void;
  onAddToLeadTrack?: (capture: Capture) => void;
  onAction?: (capture: Capture, action: SuggestedAction) => void;
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

function getActionIcon(type: SuggestedAction['type']) {
  switch (type) {
    case 'add_to_leadtrack': return UserPlus;
    case 'add_to_showsync': return Calendar;
    case 'send_email': return Mail;
    case 'call': return Phone;
    case 'schedule_followup': return Clock;
    case 'create_task': return CheckCircle2;
    case 'add_to_calendar': return Calendar;
    case 'research': return Target;
    default: return ArrowRight;
  }
}

export function CaptureCard({
  capture,
  onDelete,
  onEdit,
  onReprocess,
  onCopy,
  onAddToLeadTrack,
  onAction,
  compact = false
}: CaptureCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(capture.rawContent);
  const [showMenu, setShowMenu] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);

  const categoryInfo = CATEGORY_INFO[capture.category];

  const handleCopy = () => {
    navigator.clipboard.writeText(capture.rawContent);
    onCopy?.(capture.rawContent);
  };

  const handleAddToLeadTrack = () => {
    onAddToLeadTrack?.(capture);
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

  const handleAction = (action: SuggestedAction) => {
    onAction?.(capture, action);
  };

  // Compact view for sidebar
  if (compact) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 btn-squircle p-3 hover:border-slate-700 transition-colors group relative">
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
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-medium uppercase tracking-wider ${categoryInfo.color}`}>
                  {categoryInfo.label}
                </span>
                {capture.context === 'business' && (
                  <Briefcase className="w-3 h-3 text-accent" />
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
            <p className="text-[12px] text-slate-300 line-clamp-2">{capture.summary}</p>

            {/* Suggested Actions */}
            {capture.suggestedActions && capture.suggestedActions.length > 0 && !capture.actionTaken && (
              <div className="mt-2 space-y-1">
                {capture.suggestedActions.slice(0, 2).map((action, idx) => {
                  const Icon = getActionIcon(action.type);
                  return (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); handleAction(action); }}
                      className={`w-full flex items-center gap-1.5 px-2 py-1.5 text-[10px] font-medium rounded-lg transition-colors ${
                        action.priority === 'high'
                          ? 'bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {action.label}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Legacy: Quick actions for leads in compact view */}
            {capture.category === 'leads' && !capture.actionTaken && !capture.suggestedActions?.length && onAddToLeadTrack && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToLeadTrack();
                }}
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

  // Full card view
  return (
    <div className="bg-slate-900/50 border border-slate-800 card-squircle p-4 hover:border-slate-700 transition-colors group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-medium uppercase tracking-wider ${categoryInfo.color}`}>
            {categoryInfo.label}
          </span>
          {capture.context === 'business' && (
            <span className="text-[10px] text-accent bg-accent/10 px-1.5 py-0.5 rounded flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              Business
            </span>
          )}
          {capture.contentType === 'url' && (
            <span className="text-[10px] text-cyan-400 bg-cyan-400/10 px-1.5 py-0.5 rounded">
              Link
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-600 tabular-nums flex-shrink-0">
          {formatDate(capture.createdAt)}
        </span>
      </div>

      {/* Edit mode */}
      {isEditing ? (
        <div className="mb-3 space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-3 text-[13px] bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            rows={4}
            autoFocus
          />
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-slate-950 text-[12px] font-medium rounded-lg hover:bg-accent-hover"
            >
              <Check className="w-3.5 h-3.5" />
              Save & Reprocess
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 text-slate-300 text-[12px] font-medium rounded-lg hover:bg-slate-600"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Summary */}
          <p className="text-[13px] text-slate-200 mb-3 leading-relaxed">
            {capture.summary}
          </p>

          {/* Suggested Actions */}
          {capture.suggestedActions && capture.suggestedActions.length > 0 && !capture.actionTaken && (
            <div className="mb-3 p-3 bg-slate-800/50 rounded-lg">
              <p className="text-[10px] font-semibold text-accent uppercase tracking-wider mb-2">
                Suggested Actions
              </p>
              <div className="space-y-2">
                {capture.suggestedActions.map((action, idx) => {
                  const Icon = getActionIcon(action.type);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAction(action)}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-[12px] font-medium rounded-lg transition-colors text-left ${
                        action.priority === 'high'
                          ? 'bg-accent text-slate-950 hover:bg-accent-hover'
                          : action.priority === 'medium'
                          ? 'bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <span>{action.label}</span>
                        {action.description && (
                          <p className={`text-[10px] mt-0.5 truncate ${
                            action.priority === 'high' ? 'text-slate-950/70' : 'text-slate-400'
                          }`}>
                            {action.description}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Lead Data Display */}
      {capture.category === 'leads' && capture.leadData && !isEditing && (
        <div className="mb-3 p-2.5 bg-slate-800/50 rounded-lg space-y-1.5">
          <p className="text-[10px] font-semibold text-accent uppercase tracking-wider">Lead Details</p>
          {capture.leadData.company && (
            <p className="text-[12px] text-slate-300">
              <span className="text-slate-500">Company:</span> {capture.leadData.company}
            </p>
          )}
          {capture.leadData.name && (
            <p className="text-[12px] text-slate-300">
              <span className="text-slate-500">Contact:</span> {capture.leadData.name}
            </p>
          )}
          {capture.leadData.email && (
            <p className="text-[12px] text-slate-300">
              <span className="text-slate-500">Email:</span> {capture.leadData.email}
            </p>
          )}
          {capture.leadData.eventDate && (
            <p className="text-[12px] text-slate-300">
              <span className="text-slate-500">Event Date:</span> {capture.leadData.eventDate}
            </p>
          )}
          {capture.leadData.budget && (
            <p className="text-[12px] text-slate-300">
              <span className="text-slate-500">Budget:</span> {capture.leadData.budget}
            </p>
          )}
        </div>
      )}

      {/* Show Data Display */}
      {capture.category === 'shows' && capture.showData && !isEditing && (
        <div className="mb-3 p-2.5 bg-slate-800/50 rounded-lg space-y-1.5">
          <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Show Details</p>
          {capture.showData.client && (
            <p className="text-[12px] text-slate-300">
              <span className="text-slate-500">Client:</span> {capture.showData.client}
            </p>
          )}
          {capture.showData.showType && (
            <p className="text-[12px] text-slate-300">
              <span className="text-slate-500">Show:</span> {capture.showData.showType}
            </p>
          )}
          {capture.showData.date && (
            <p className="text-[12px] text-slate-300">
              <span className="text-slate-500">Date:</span> {capture.showData.date}
            </p>
          )}
          {capture.showData.fee && (
            <p className="text-[12px] text-slate-300">
              <span className="text-slate-500">Fee:</span> {capture.showData.fee}
            </p>
          )}
          {capture.showData.status && (
            <p className="text-[12px]">
              <span className="text-slate-500">Status:</span>{' '}
              <span className={
                capture.showData.status === 'confirmed' ? 'text-emerald-400' :
                capture.showData.status === 'quoted' ? 'text-amber-400' :
                capture.showData.status === 'completed' ? 'text-blue-400' :
                'text-slate-400'
              }>
                {capture.showData.status.charAt(0).toUpperCase() + capture.showData.status.slice(1)}
              </span>
            </p>
          )}
        </div>
      )}

      {/* Task Data Display */}
      {capture.category === 'tasks' && capture.taskData && !isEditing && (
        <div className="mb-3 p-2.5 bg-slate-800/50 rounded-lg space-y-1.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Task</p>
            {capture.taskData.priority && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                capture.taskData.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                capture.taskData.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                'bg-slate-700 text-slate-400'
              }`}>
                {capture.taskData.priority.toUpperCase()}
              </span>
            )}
          </div>
          {capture.taskData.dueDate && (
            <p className="text-[12px] text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-slate-500" />
              Due: {capture.taskData.dueDate}
            </p>
          )}
        </div>
      )}

      {/* Tags */}
      {capture.tags.length > 0 && !isEditing && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {capture.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 btn-squircle"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Source URL */}
      {capture.source && !isEditing && (
        <a
          href={capture.source}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-cyan-400 transition-colors mb-3 truncate"
        >
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{capture.source}</span>
        </a>
      )}

      {/* Legacy: Quick Action for Leads */}
      {capture.category === 'leads' && !capture.actionTaken && !capture.suggestedActions?.length && onAddToLeadTrack && !isEditing && (
        <button
          onClick={handleAddToLeadTrack}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 mb-3 bg-accent text-slate-950 text-[12px] font-semibold rounded-lg hover:bg-accent-hover transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add to LeadTrack
        </button>
      )}

      {capture.actionTaken === 'added_to_leadtrack' && !isEditing && (
        <div className="flex items-center justify-center gap-2 px-3 py-2 mb-3 bg-emerald-500/10 text-emerald-400 text-[12px] font-medium rounded-lg">
          <CheckCircle2 className="w-4 h-4" />
          Added to LeadTrack
        </div>
      )}

      {/* Actions */}
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
