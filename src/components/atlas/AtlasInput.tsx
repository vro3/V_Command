import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Mic, Image, Loader2 } from 'lucide-react';

interface AtlasInputProps {
  onSubmit: (content: string, type: 'text' | 'url' | 'voice') => void;
  isProcessing: boolean;
  placeholder?: string;
}

export function AtlasInput({ onSubmit, isProcessing, placeholder }: AtlasInputProps) {
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (!content.trim() || isProcessing) return;

    // Detect if it's a URL
    const isUrl = /^https?:\/\//.test(content.trim());
    onSubmit(content.trim(), isUrl ? 'url' : 'text');
    setContent('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const handleVoiceClick = () => {
    // Voice recording would be implemented here
    setIsRecording(!isRecording);
  };

  return (
    <div className="border-t border-slate-800 bg-slate-950 p-4">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Paste or type anything... ideas, notes, links, contacts"}
          disabled={isProcessing}
          rows={1}
          className="w-full resize-none bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 pr-24 text-[13px] text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors disabled:opacity-50"
        />

        <div className="absolute right-2 bottom-2 flex items-center gap-1">
          {/* URL indicator */}
          {/^https?:\/\//.test(content.trim()) && (
            <span className="text-[10px] text-cyan-400 bg-cyan-400/10 px-2 py-0.5 rounded mr-1">
              URL
            </span>
          )}

          {/* Image paste button */}
          <button
            type="button"
            className="p-2 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
            title="Paste image"
          >
            <Image className="w-4 h-4" />
          </button>

          {/* Voice button */}
          <button
            type="button"
            onClick={handleVoiceClick}
            className={`p-2 rounded-lg transition-colors ${
              isRecording
                ? 'text-red-400 bg-red-400/10 hover:bg-red-400/20'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700'
            }`}
            title={isRecording ? 'Stop recording' : 'Voice input'}
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim() || isProcessing}
            className="p-2 bg-accent text-slate-950 rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <p className="mt-2 text-[10px] text-slate-600 text-center">
        Press Enter to capture • Shift+Enter for new line
      </p>
    </div>
  );
}
