import { useState } from 'react';
import { Brain, Search, Filter, X } from 'lucide-react';
import { AtlasInput } from './AtlasInput';
import { CategoryNav } from './CategoryNav';
import { CaptureCard } from './CaptureCard';
import { Capture, Category, CATEGORY_INFO } from '../../types/atlas';

interface BrainSidebarProps {
  captures: Capture[];
  onCapture: (content: string, type: 'text' | 'url' | 'voice') => Promise<Capture | null>;
  onDeleteCapture: (id: string) => void;
  isProcessing: boolean;
}

export function BrainSidebar({ captures, onCapture, onDeleteCapture, isProcessing }: BrainSidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategories, setShowCategories] = useState(false);

  // Calculate category counts
  const counts = captures.reduce(
    (acc, capture) => {
      acc.all++;
      acc[capture.category] = (acc[capture.category] || 0) + 1;
      return acc;
    },
    { all: 0 } as Record<Category | 'all', number>
  );

  // Filter captures
  const filteredCaptures = captures.filter((capture) => {
    const matchesCategory = selectedCategory === 'all' || capture.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      capture.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      capture.rawContent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      capture.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleSubmit = async (content: string, type: 'text' | 'url' | 'voice') => {
    await onCapture(content, type);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
        <Brain className="w-4 h-4 text-accent" />
        <h2 className="text-[15px] font-semibold text-slate-100">Brain</h2>
        <span className="text-[11px] text-slate-500 ml-auto tabular-nums">
          {captures.length} captures
        </span>
      </div>

      {/* Capture Input */}
      <div className="border-b border-slate-800">
        <AtlasInput
          onSubmit={handleSubmit}
          isProcessing={isProcessing}
          placeholder="Capture anything..."
        />
      </div>

      {/* Search & Filter */}
      <div className="px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2 text-[13px] bg-slate-800/50 border border-slate-700 input-squircle text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
            />
          </div>
          <button
            onClick={() => setShowCategories(!showCategories)}
            className={`p-2 btn-squircle transition-colors ${
              showCategories || selectedCategory !== 'all'
                ? 'bg-accent/10 text-accent'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>

        {/* Category filter (shown when filter active) */}
        {showCategories && (
          <div className="mt-3">
            <CategoryNav
              selectedCategory={selectedCategory}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
              }}
              counts={counts}
            />
          </div>
        )}

        {/* Active filter pill */}
        {selectedCategory !== 'all' && !showCategories && (
          <div className="mt-2 flex items-center gap-2">
            <span className={`text-[11px] px-2 py-1 btn-squircle ${CATEGORY_INFO[selectedCategory].color} bg-slate-800`}>
              {CATEGORY_INFO[selectedCategory].label}
            </span>
            <button
              onClick={() => setSelectedCategory('all')}
              className="p-1 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Captures List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredCaptures.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[13px] text-slate-500">
              {searchQuery ? 'No captures match your search' : 'No captures yet'}
            </p>
            <p className="text-[11px] text-slate-600 mt-1">
              {searchQuery ? 'Try different keywords' : 'Type above to capture something'}
            </p>
          </div>
        ) : (
          filteredCaptures.map((capture) => (
            <CaptureCard
              key={capture.id}
              capture={capture}
              onDelete={onDeleteCapture}
              compact
            />
          ))
        )}
      </div>
    </div>
  );
}
