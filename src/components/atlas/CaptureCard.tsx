import { Copy, Trash2, ExternalLink, MoreHorizontal } from 'lucide-react';
import { Capture, CATEGORY_INFO } from '../../types/atlas';

interface CaptureCardProps {
  capture: Capture;
  onDelete?: (id: string) => void;
  onCopy?: (content: string) => void;
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

export function CaptureCard({ capture, onDelete, onCopy, compact = false }: CaptureCardProps) {
  const categoryInfo = CATEGORY_INFO[capture.category];

  const handleCopy = () => {
    navigator.clipboard.writeText(capture.rawContent);
    onCopy?.(capture.rawContent);
  };

  if (compact) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors cursor-pointer group">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className={`text-[10px] font-medium uppercase tracking-wider ${categoryInfo.color}`}>
            {categoryInfo.label}
          </span>
          <span className="text-[10px] text-slate-600 tabular-nums">
            {formatDate(capture.createdAt)}
          </span>
        </div>
        <p className="text-[12px] text-slate-300 line-clamp-2">{capture.summary}</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-medium uppercase tracking-wider ${categoryInfo.color}`}>
            {categoryInfo.label}
          </span>
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

      {/* Tags */}
      {capture.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {capture.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full"
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

      {/* Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded transition-colors"
            title="Copy content"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          {onDelete && (
            <button
              onClick={() => onDelete(capture.id)}
              className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button className="p-1.5 text-slate-600 hover:text-slate-400 hover:bg-slate-800 rounded transition-colors opacity-0 group-hover:opacity-100">
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
