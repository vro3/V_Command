import { useState, useRef, useEffect } from 'react';
import { Brain, Sparkles, User, Copy, Check } from 'lucide-react';
import { AtlasInput } from './AtlasInput';
import { CaptureCard } from './CaptureCard';
import { Capture, ChatMessage } from '../../types/atlas';

interface AtlasChatProps {
  captures: Capture[];
  onCapture: (content: string, type: 'text' | 'url' | 'voice') => Promise<Capture | null>;
  onSearch: (query: string) => Capture[];
}

export function AtlasChat({ onCapture, onSearch }: AtlasChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "I'm Atlas, your knowledge capture assistant. Paste or type anything — ideas, notes, contacts, links — and I'll organize it for you. You can also ask me questions about things you've captured.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (content: string, type: 'text' | 'url' | 'voice') => {
    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // Check if it's a question (starts with what, how, when, where, why, who, find, search, etc.)
      const isQuestion = /^(what|how|when|where|why|who|find|search|show|list|get|tell)/i.test(
        content.trim()
      );

      if (isQuestion) {
        // Search mode
        const results = onSearch(content);
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            results.length > 0
              ? `Found ${results.length} related capture${results.length > 1 ? 's' : ''}:`
              : "I couldn't find anything matching that. Try different keywords or capture something new!",
          timestamp: new Date().toISOString(),
          captures: results.slice(0, 5),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Capture mode
        const capture = await onCapture(content, type);

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: capture
            ? `Got it! I've saved this as a **${capture.category}** capture.`
            : "I had trouble processing that. Please try again.",
          timestamp: new Date().toISOString(),
          captures: capture ? [capture] : undefined,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Something went wrong. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
          >
            {message.role === 'assistant' && (
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4 text-accent" />
              </div>
            )}

            <div
              className={`max-w-[80%] ${
                message.role === 'user' ? 'order-first' : ''
              }`}
            >
              <div
                className={`rounded-xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-accent text-slate-950'
                    : 'bg-slate-800/50 border border-slate-700'
                }`}
              >
                <p
                  className={`text-[13px] leading-relaxed whitespace-pre-wrap ${
                    message.role === 'user' ? 'text-slate-950' : 'text-slate-200'
                  }`}
                >
                  {message.content}
                </p>
              </div>

              {/* Related captures */}
              {message.captures && message.captures.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.captures.map((capture) => (
                    <CaptureCard key={capture.id} capture={capture} compact />
                  ))}
                </div>
              )}

              {/* Copy button for assistant messages */}
              {message.role === 'assistant' && (
                <button
                  onClick={() => handleCopy(message.content, message.id)}
                  className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {copiedId === message.id ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              )}
            </div>

            {message.role === 'user' && (
              <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-accent rounded-full animate-bounce"
                  style={{ animationDelay: '0.1s' }}
                />
                <div
                  className="w-2 h-2 bg-accent rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <AtlasInput onSubmit={handleSubmit} isProcessing={isProcessing} />
    </div>
  );
}
