import { useState } from 'react';
import { X, Search, Filter } from 'lucide-react';
import { CategoryNav } from './CategoryNav';
import { CaptureCard } from './CaptureCard';
import { Capture, Category } from '../../types/atlas';

interface AtlasSidebarProps {
  captures: Capture[];
  onClose: () => void;
  onDeleteCapture: (id: string) => void;
}

export function AtlasSidebar({ captures, onClose, onDeleteCapture }: AtlasSidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <>
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-slate-100">Brain Library</h2>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 btn-squircle transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search captures..."
            className="w-full pl-9 pr-4 py-2 text-[13px] bg-slate-800/50 border border-slate-700 input-squircle text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-colors"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-3 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
            Categories
          </span>
          <button className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors">
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
        <CategoryNav
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          counts={counts}
        />
      </div>

      {/* Captures List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredCaptures.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[13px] text-slate-500">
              {searchQuery ? 'No captures match your search' : 'No captures yet'}
            </p>
            <p className="text-[11px] text-slate-600 mt-1">
              {searchQuery ? 'Try a different search term' : 'Start by capturing something'}
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

      {/* Footer Stats */}
      <div className="px-4 py-3 border-t border-slate-800 bg-slate-950">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500">
            {filteredCaptures.length} of {captures.length} captures
          </span>
          <span className="text-slate-600">
            {selectedCategory !== 'all' && CATEGORY_INFO[selectedCategory]?.label}
          </span>
        </div>
      </div>
    </>
  );
}

// Need to import CATEGORY_INFO
import { CATEGORY_INFO } from '../../types/atlas';
