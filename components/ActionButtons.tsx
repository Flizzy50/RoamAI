
import React from 'react';

interface ActionButtonsProps {
  onVoiceClick: () => void;
  onChatClick: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onVoiceClick, onChatClick }) => {
  return (
    <div className="flex flex-row items-center justify-center gap-10 px-6 py-10 w-full">
      {/* Voice Button */}
      <button 
        className="group flex flex-col items-center gap-3 active:scale-95 transition-transform"
        onClick={onVoiceClick}
      >
        <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-2xl shadow-red-200 group-hover:bg-red-600 transition-colors">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-9 h-9 text-white"
          >
            <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
            <path d="M6 10.5a.75.75 0 0 1 .75.75 5.25 5.25 0 1 0 10.5 0 .75.75 0 0 1 1.5 0 6.75 6.75 0 0 1-6 6.709V21a.75.75 0 0 1-1.5 0v-3.041a6.75 6.75 0 0 1-6-6.709A.75.75 0 0 1 6 10.5Z" />
          </svg>
        </div>
        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Voice</span>
      </button>

      {/* Chat Button - Now a circular icon beside Voice */}
      <button 
        className="group flex flex-col items-center gap-3 active:scale-95 transition-transform"
        onClick={onChatClick}
      >
        <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center shadow-2xl shadow-zinc-200 group-hover:bg-zinc-800 transition-colors">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-9 h-9 text-white"
          >
            <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z" clipRule="evenodd" />
          </svg>
        </div>
        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Chat</span>
      </button>
    </div>
  );
};

export default ActionButtons;
