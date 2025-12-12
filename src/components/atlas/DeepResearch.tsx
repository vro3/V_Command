import { useState, useEffect, useRef } from 'react';
import { Search, Loader2, X, ExternalLink, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';

interface ResearchResult {
  interactionId: string;
  state: string;
  isComplete: boolean;
  isFailed: boolean;
  isRunning: boolean;
  report: string | null;
  sources: Array<{ title: string; url: string }>;
  progress: string | null;
}

interface DeepResearchProps {
  onClose: () => void;
  onSaveToCaptures?: (report: string, query: string) => void;
  initialQuery?: string;
}

export function DeepResearch({ onClose, onSaveToCaptures, initialQuery = '' }: DeepResearchProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isStarting, setIsStarting] = useState(false);
  const [interactionId, setInteractionId] = useState<string | null>(null);
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-start if initial query provided
  useEffect(() => {
    if (initialQuery && !interactionId) {
      handleStartResearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll for status when research is running
  useEffect(() => {
    if (interactionId && result?.isRunning) {
      pollIntervalRef.current = setInterval(async () => {
        try {
          const response = await fetch(`/api/research/status?id=${encodeURIComponent(interactionId)}`);
          const data = await response.json();

          if (data.error) {
            setError(data.error);
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          } else {
            setResult(data);
            if (data.isComplete || data.isFailed) {
              if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
            }
          }
        } catch (err) {
          console.error('Poll error:', err);
        }
      }, 5000); // Poll every 5 seconds
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [interactionId, result?.isRunning]);

  const handleStartResearch = async () => {
    if (!query.trim()) return;

    setIsStarting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/research/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setInteractionId(data.interactionId);
        setResult({
          interactionId: data.interactionId,
          state: 'RUNNING',
          isComplete: false,
          isFailed: false,
          isRunning: true,
          report: null,
          sources: [],
          progress: 'Research started...',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start research');
    } finally {
      setIsStarting(false);
    }
  };

  const handleSave = () => {
    if (result?.report && onSaveToCaptures) {
      onSaveToCaptures(result.report, query);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-slate-100">Deep Research</h2>
              <p className="text-[11px] text-slate-500">AI-powered multi-step research with citations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        {!result && (
          <div className="p-4 border-b border-slate-800">
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="What would you like to research? (e.g., 'Corporate entertainment trends in Miami 2025')"
                rows={3}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 pr-12 text-[13px] text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleStartResearch();
                  }
                }}
              />
              <button
                onClick={handleStartResearch}
                disabled={!query.trim() || isStarting}
                className="absolute right-2 bottom-2 p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStarting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="mt-2 text-[10px] text-slate-600">
              Deep Research autonomously searches the web and synthesizes a comprehensive report
            </p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-500/10 border-b border-red-500/20">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <p className="text-[13px]">{error}</p>
            </div>
          </div>
        )}

        {/* Status/Progress */}
        {result?.isRunning && (
          <div className="p-6 flex flex-col items-center justify-center border-b border-slate-800">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-purple-300" />
              </div>
            </div>
            <p className="mt-4 text-[13px] text-slate-300 font-medium">Researching...</p>
            <p className="text-[11px] text-slate-500 mt-1">
              This may take 1-3 minutes. Deep Research is searching the web, analyzing sources, and synthesizing findings.
            </p>
            <div className="mt-4 bg-slate-800 rounded-lg px-4 py-2">
              <p className="text-[12px] text-slate-400">Query: {query}</p>
            </div>
          </div>
        )}

        {/* Complete - Show Report */}
        {result?.isComplete && result.report && (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="flex items-center gap-2 mb-4 text-green-400">
              <CheckCircle className="w-4 h-4" />
              <span className="text-[13px] font-medium">Research Complete</span>
            </div>

            {/* Report */}
            <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
              <div className="prose prose-sm prose-invert max-w-none">
                <div className="text-[13px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {result.report}
                </div>
              </div>
            </div>

            {/* Sources */}
            {result.sources.length > 0 && (
              <div className="mt-4">
                <h3 className="text-[12px] font-medium text-slate-400 uppercase tracking-wider mb-2">Sources</h3>
                <div className="space-y-2">
                  {result.sources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[12px] text-purple-400 hover:text-purple-300 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Failed */}
        {result?.isFailed && (
          <div className="p-6 flex flex-col items-center justify-center">
            <AlertCircle className="w-12 h-12 text-red-400" />
            <p className="mt-4 text-[13px] text-slate-300">Research failed</p>
            <p className="text-[11px] text-slate-500 mt-1">Please try again with a different query</p>
          </div>
        )}

        {/* Footer */}
        {result?.isComplete && result.report && (
          <div className="p-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-[13px] text-slate-400 hover:text-slate-200 transition-colors"
            >
              Close
            </button>
            {onSaveToCaptures && (
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-purple-500 text-white text-[13px] font-medium rounded-lg hover:bg-purple-600 transition-colors"
              >
                Save to Brain
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
