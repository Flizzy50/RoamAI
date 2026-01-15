
import React from 'react';

export interface Suggestion {
  title: string;
  category: string;
  icon: string;
  description: string;
}

interface QuickSuggestionsProps {
  suggestions: Suggestion[];
  isLoading: boolean;
  onSelect: (suggestion: Suggestion) => void;
}

const QuickSuggestions: React.FC<QuickSuggestionsProps> = ({ suggestions, isLoading, onSelect }) => {
  if (isLoading) {
    return (
      <div className="px-6 py-4 animate-pulse flex-none">
        <div className="h-3 w-32 bg-zinc-200 rounded mb-4"></div>
        <div className="flex gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex-1 h-24 bg-zinc-100 rounded-[2rem]"></div>
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  // Limit to exactly 2 items as requested
  const displaySuggestions = suggestions.slice(0, 2);

  return (
    <div className="px-6 py-4 w-full flex-none">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Quick Suggestions</h3>
        <div className="flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-blue-500"></span>
          <span className="text-[9px] font-bold text-blue-500 uppercase">AI Curated</span>
        </div>
      </div>
      
      <div className="flex gap-4">
        {displaySuggestions.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(item)}
            className="flex-1 p-4 bg-white rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-md active:scale-95 transition-all text-left flex flex-col gap-2 group relative overflow-hidden"
          >
            <div className="flex items-center justify-between relative z-10">
              <span className="text-2xl">{item.icon}</span>
              <div className="w-6 h-6 rounded-full bg-zinc-50 flex items-center justify-center group-hover:bg-zinc-900 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-zinc-300 group-hover:text-white">
                  <path fillRule="evenodd" d="M2 8a.75.75 0 0 1 .75-.75h8.69L8.22 4.03a.75.75 0 0 1 1.06-1.06l4.5 4.5a.75.75 0 0 1 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06l3.22-3.22H2.75A.75.75 0 0 1 2 8Z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="relative z-10">
              <h4 className="text-[11px] font-black text-zinc-900 leading-tight mb-0.5 line-clamp-1">{item.title}</h4>
              <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">{item.category}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickSuggestions;
