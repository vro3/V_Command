import { useEffect, useState } from 'react';
import {
  Calendar,
  Mail,
  Eye,
  Check,
  X,
  Clock,
  RefreshCw,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import {
  fetchShowSyncData,
  formatShowDate,
  ShowSyncData,
  ShowSummary,
} from '../../services/showSyncService';

interface StatusDotProps {
  sent: boolean;
  opened: boolean;
  responded: boolean;
  response: string | null;
  type: 'inquiry' | 'offer' | 'confirmation';
}

function StatusDot({ sent, opened, responded, response, type }: StatusDotProps) {
  // Determine color based on state
  let bgColor = 'bg-slate-700'; // Not sent
  let title = `${type}: Not sent`;

  if (sent && !opened && !responded) {
    bgColor = 'bg-amber-500'; // Sent but not opened
    title = `${type}: Sent (not opened)`;
  } else if (sent && opened && !responded) {
    bgColor = 'bg-blue-500'; // Opened but no response
    title = `${type}: Opened (awaiting response)`;
  } else if (responded) {
    if (response === 'Available' || response === 'Accepted' || response === 'Confirmed') {
      bgColor = 'bg-emerald-500'; // Positive response
      title = `${type}: ${response}`;
    } else if (response === 'Unavailable' || response === 'Declined') {
      bgColor = 'bg-red-500'; // Negative response
      title = `${type}: ${response}`;
    }
  }

  return (
    <div
      className={`w-2.5 h-2.5 rounded-full ${bgColor} transition-colors`}
      title={title}
    />
  );
}

interface ShowCardProps {
  show: ShowSummary;
}

function ShowCard({ show }: ShowCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-slate-800 last:border-b-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-slate-800/30 transition-colors text-left"
      >
        <div className="flex-shrink-0">
          <span className="text-[11px] font-semibold text-accent">
            {formatShowDate(show.showDate)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-slate-200 truncate">
            {show.showName || show.clientName}
          </p>
          <p className="text-[11px] text-slate-500 truncate">
            {show.venue}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Summary stats */}
          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-emerald-400">{show.stats.confirmed}</span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">{show.stats.total}</span>
          </div>
          <ChevronRight
            className={`w-4 h-4 text-slate-500 transition-transform ${
              expanded ? 'rotate-90' : ''
            }`}
          />
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          {/* Legend */}
          <div className="flex items-center gap-4 text-[10px] text-slate-500 pb-2 border-b border-slate-800">
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3" /> Inquiry
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" /> Offer
            </span>
            <span className="flex items-center gap-1">
              <Check className="w-3 h-3" /> Confirm
            </span>
          </div>

          {/* Roster entries */}
          {show.roster.length === 0 ? (
            <p className="text-[12px] text-slate-500 py-2">No performers on roster</p>
          ) : (
            show.roster.map((entry) => (
              <div
                key={entry.performerId}
                className="flex items-center gap-3 py-1.5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] text-slate-300 truncate">
                    {entry.performerName}
                  </p>
                </div>
                {/* 6 status dots - 3 for sent, 3 for response */}
                <div className="flex items-center gap-1">
                  {/* Top row: Sent status */}
                  <StatusDot
                    sent={!!entry.inquiry.sentAt}
                    opened={!!entry.inquiry.openedAt}
                    responded={!!entry.inquiry.response}
                    response={entry.inquiry.response}
                    type="inquiry"
                  />
                  <StatusDot
                    sent={!!entry.offer.sentAt}
                    opened={!!entry.offer.openedAt}
                    responded={!!entry.offer.response}
                    response={entry.offer.response}
                    type="offer"
                  />
                  <StatusDot
                    sent={!!entry.confirmation.sentAt}
                    opened={!!entry.confirmation.openedAt}
                    responded={!!entry.confirmation.response}
                    response={entry.confirmation.response}
                    type="confirmation"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function ShowSyncWidget() {
  const [data, setData] = useState<ShowSyncData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    const result = await fetchShowSyncData();
    if (result) {
      setData(result);
    } else {
      setError('Failed to load show data');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="bg-slate-900/50 border border-slate-800 card-squircle overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-400" />
          <h3 className="text-[13px] font-semibold text-slate-200">
            Upcoming Shows
          </h3>
          {data && (
            <span className="text-[11px] text-slate-500">
              ({data.totalUpcoming})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`}
            />
          </button>
          <a
            href="https://script.google.com/macros/s/AKfycbxIIaIOJNVEXxfjdQOEOzox8wwqrGYn1HEiea5Fp5bUQ2w5YurZISCuxe7P0nJV3nI/exec"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors"
            title="Open Show Sync"
          >
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>
        </div>
      </div>

      {/* Stats bar */}
      {data && (
        <div className="px-4 py-2 bg-slate-800/30 flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-amber-400" />
            <span className="text-slate-400">
              {data.pendingResponses} pending
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-3 h-3 text-blue-400" />
            <span className="text-slate-400">
              {data.recentlyOpened} opened
            </span>
          </span>
        </div>
      )}

      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        {loading && !data && (
          <div className="p-8 text-center">
            <RefreshCw className="w-5 h-5 text-slate-500 animate-spin mx-auto mb-2" />
            <p className="text-[12px] text-slate-500">Loading shows...</p>
          </div>
        )}

        {error && (
          <div className="p-8 text-center">
            <X className="w-5 h-5 text-red-400 mx-auto mb-2" />
            <p className="text-[12px] text-red-400">{error}</p>
            <button
              onClick={loadData}
              className="mt-2 text-[11px] text-slate-400 hover:text-slate-200"
            >
              Try again
            </button>
          </div>
        )}

        {data && data.shows.length === 0 && (
          <div className="p-8 text-center">
            <Calendar className="w-5 h-5 text-slate-600 mx-auto mb-2" />
            <p className="text-[12px] text-slate-500">No upcoming shows</p>
          </div>
        )}

        {data && data.shows.length > 0 && (
          <div>
            {data.shows.slice(0, 5).map((show) => (
              <ShowCard key={show.showId} show={show} />
            ))}
            {data.shows.length > 5 && (
              <div className="px-4 py-2 text-center">
                <a
                  href="https://script.google.com/macros/s/AKfycbxIIaIOJNVEXxfjdQOEOzox8wwqrGYn1HEiea5Fp5bUQ2w5YurZISCuxe7P0nJV3nI/exec"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-accent hover:underline"
                >
                  View all {data.shows.length} shows
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
