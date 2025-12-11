import { Copy, Trash2, ExternalLink, MoreHorizontal, UserPlus, Calendar, CheckCircle2, Briefcase } from 'lucide-react';
import { Capture, CATEGORY_INFO } from '../../types/atlas';

interface CaptureCardProps {
  capture: Capture;
  onDelete?: (id: string) => void;
  onCopy?: (content: string) => void;
  onAddToLeadTrack?: (capture: Capture) => void;
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

export function CaptureCard({ capture, onDelete, onCopy, onAddToLeadTrack, compact = false }: CaptureCardProps) {
  const categoryInfo = CATEGORY_INFO[capture.category];

  const handleCopy = () => {
    navigator.clipboard.writeText(capture.rawContent);
    onCopy?.(capture.rawContent);
  };

  const handleAddToLeadTrack = () => {
    onAddToLeadTrack?.(capture);
  };

  // Compact view for sidebar
  if (compact) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 btn-squircle p-3 hover:border-slate-700 transition-colors cursor-pointer group">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-medium uppercase tracking-wider ${categoryInfo.color}`}>
              {categoryInfo.label}
            </span>
            {capture.context === 'business' && (
              <Briefcase className="w-3 h-3 text-accent" />
            )}
          </div>
          <span className="text-[10px] text-slate-600 tabular-nums">
            {formatDate(capture.createdAt)}
          </span>
        </div>
        <p className="text-[12px] text-slate-300 line-clamp-2">{capture.summary}</p>

        {/* Quick actions for leads in compact view */}
        {capture.category === 'leads' && !capture.actionTaken && onAddToLeadTrack && (
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
      </div>
    );
  }

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

      {/* Summary */}
      <p className="text-[13px] text-slate-200 mb-3 leading-relaxed">
        {capture.summary}
      </p>

      {/* Lead Data Display */}
      {capture.category === 'leads' && capture.leadData && (
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
      {capture.category === 'shows' && capture.showData && (
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
      {capture.category === 'tasks' && capture.taskData && (
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
      {capture.tags.length > 0 && (
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
      {capture.source && (
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

      {/* Quick Action for Leads */}
      {capture.category === 'leads' && !capture.actionTaken && onAddToLeadTrack && (
        <button
          onClick={handleAddToLeadTrack}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 mb-3 bg-accent text-slate-950 text-[12px] font-semibold rounded-lg hover:bg-accent-hover transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add to LeadTrack
        </button>
      )}

      {capture.actionTaken === 'added_to_leadtrack' && (
        <div className="flex items-center justify-center gap-2 px-3 py-2 mb-3 bg-emerald-500/10 text-emerald-400 text-[12px] font-medium rounded-lg">
          <CheckCircle2 className="w-4 h-4" />
          Added to LeadTrack
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

        <button className="p-1.5 text-slate-600 hover:text-slate-400 hover:bg-slate-800 btn-squircle transition-colors opacity-0 group-hover:opacity-100">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
