import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Eye, EyeOff, Sparkles, Flame, LayoutGrid, Award, TrendingUp, Gift, ShieldCheck, Star, Layers, ChevronRight } from 'lucide-react';
import { AdminTab } from '../../types';

interface SortableSectionProps {
  sec: any; // Using any for now based on previous code
  index: number;
  shortcut: { label: string; tab: AdminTab } | null;
  isEnabled: boolean;
  getSectionIcon: (key: string) => React.ReactNode;
  getSectionDescription: (key: string) => string;
  setAdminTab: (tab: AdminTab) => void;
  toggleHomepageSection: (id: string) => Promise<void>;
  showToast: (message: string, type: 'success' | 'info' | 'error') => void;
}

export const SortableHomepageSection: React.FC<SortableSectionProps> = ({ 
  sec, index, shortcut, isEnabled, getSectionIcon, getSectionDescription, setAdminTab, toggleHomepageSection, showToast 
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: sec.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isEnabled 
          ? 'bg-[#FAF7F5] border-rose-100/90 shadow-xs hover:border-[#DFBE65]/70' 
          : 'bg-gray-50/80 border-gray-200 opacity-60'
      }`}
    >
      <div className="flex items-center gap-2">
        <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
          <GripVertical className="w-5 h-5" />
        </div>
        
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs ${
            isEnabled ? 'bg-gradient-to-br from-[#58152D] to-[#7E1D3B] text-white' : 'bg-gray-200 text-gray-500'
          }`}>
            {index + 1}
          </div>

          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
            isEnabled ? 'bg-[#E0BFB8]/70 border-rose-100' : 'bg-gray-100 border-gray-200'
          }`}>
            {getSectionIcon(sec.key)}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">
                {sec.title}
              </h4>
              {isEnabled ? (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  Active
                </span>
              ) : (
                <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">
                  Hidden
                </span>
              )}
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
              {getSectionDescription(sec.key)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {shortcut && isEnabled && (
          <button
            type="button"
            onClick={() => setAdminTab(shortcut.tab)}
            className="px-2.5 py-1 bg-[#E0BFB8]/20 hover:bg-[#E0BFB8]/40 text-[#58152D] rounded-lg text-[11px] font-bold transition flex items-center gap-1 border border-rose-200 cursor-pointer mr-1"
          >
            <span>{shortcut.label}</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        )}
        
        <button
          type="button"
          onClick={async () => {
            await toggleHomepageSection(sec.id);
            showToast(`Section "${sec.title}" is now ${!isEnabled ? 'Visible' : 'Hidden'} on storefront.`, 'info');
          }}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ml-1 ${
            isEnabled 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100' 
              : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          {isEnabled ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-gray-400" />}
          <span>{isEnabled ? 'Visible' : 'Hidden'}</span>
        </button>
      </div>
    </div>
  );
};
