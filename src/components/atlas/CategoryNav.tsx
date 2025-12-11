import {
  Lightbulb,
  CheckSquare,
  Users,
  FileText,
  BookOpen,
  Quote,
  Bookmark,
  Calendar,
  Folder,
  LucideIcon,
} from 'lucide-react';
import { Category, CATEGORY_INFO } from '../../types/atlas';

const categoryIcons: Record<Category, LucideIcon> = {
  ideas: Lightbulb,
  tasks: CheckSquare,
  contacts: Users,
  notes: FileText,
  reference: BookOpen,
  quotes: Quote,
  bookmarks: Bookmark,
  meetings: Calendar,
  projects: Folder,
};

interface CategoryNavProps {
  selectedCategory: Category | 'all';
  onSelectCategory: (category: Category | 'all') => void;
  counts: Record<Category | 'all', number>;
}

export function CategoryNav({ selectedCategory, onSelectCategory, counts }: CategoryNavProps) {
  const categories = Object.keys(CATEGORY_INFO) as Category[];

  return (
    <div className="space-y-1">
      {/* All */}
      <button
        onClick={() => onSelectCategory('all')}
        className={`w-full flex items-center justify-between px-3 py-2 btn-squircle text-[13px] transition-colors ${
          selectedCategory === 'all'
            ? 'bg-slate-800 text-slate-100'
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
        }`}
      >
        <span className="font-medium">All Captures</span>
        <span className="text-[11px] tabular-nums text-slate-500">{counts.all}</span>
      </button>

      <div className="h-px bg-slate-800 my-2" />

      {/* Categories */}
      {categories.map((category) => {
        const Icon = categoryIcons[category];
        const info = CATEGORY_INFO[category];
        const count = counts[category] || 0;

        return (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`w-full flex items-center justify-between px-3 py-2 btn-squircle text-[13px] transition-colors ${
              selectedCategory === category
                ? 'bg-slate-800 text-slate-100'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className={`w-4 h-4 ${info.color}`} />
              <span className="font-medium">{info.label}</span>
            </div>
            {count > 0 && (
              <span className="text-[11px] tabular-nums text-slate-500">{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
