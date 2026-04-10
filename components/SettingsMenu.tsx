
import React, { useState } from 'react';

interface SettingsMenuProps {
  onClose: () => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ onClose }) => {
  const [proximityAlerts, setProximityAlerts] = useState(true);
  const [enhancedAi, setEnhancedAi] = useState(false);

  return (
    <div className="fixed inset-0 z-[70] bg-white animate-in slide-in-from-right duration-300 flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-6 flex items-center justify-between flex-none">
        <button 
          onClick={onClose}
          className="p-2 -ml-2 rounded-full hover:bg-zinc-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-zinc-900">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">Settings</h2>
        <div className="w-10"></div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-8">
        {/* Intelligence Section */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Intelligence</h3>
          <div className="bg-zinc-50 rounded-[2.5rem] p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <h4 className="text-sm font-black text-zinc-900">Enhanced Reasoning</h4>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Uses Gemini 3 Pro model</p>
              </div>
              <button 
                onClick={() => setEnhancedAi(!enhancedAi)}
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${enhancedAi ? 'bg-blue-500' : 'bg-zinc-200'}`}
              >
                <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform duration-300 ${enhancedAi ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>
            
            <div className="h-[1px] bg-zinc-100"></div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <h4 className="text-sm font-black text-zinc-900">Grounding Source</h4>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Google Search + Maps</p>
              </div>
              <span className="text-[10px] font-black text-zinc-300 uppercase">Always On</span>
            </div>
          </div>
        </section>

        {/* Travel Section */}
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Travel Assistant</h3>
          <div className="bg-zinc-50 rounded-[2.5rem] p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <h4 className="text-sm font-black text-zinc-900">Proximity Alerts</h4>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Notify near landmarks</p>
              </div>
              <button 
                onClick={() => setProximityAlerts(!proximityAlerts)}
                className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${proximityAlerts ? 'bg-emerald-500' : 'bg-zinc-200'}`}
              >
                <div className={`w-6 h-6 rounded-full bg-white shadow-lg transition-transform duration-300 ${proximityAlerts ? 'translate-x-6' : 'translate-x-0'}`}></div>
              </button>
            </div>
            
            <div className="h-[1px] bg-zinc-100"></div>

            <button className="flex items-center justify-between w-full group">
              <div className="flex flex-col gap-0.5 text-left">
                <h4 className="text-sm font-black text-zinc-900">Offline Maps</h4>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Download local area data</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-zinc-300 transition-transform group-active:translate-x-1">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </section>
      </div>

      <footer className="px-6 py-10 flex flex-col items-center gap-1 opacity-20 flex-none">
        <h1 className="text-xl font-black italic tracking-tighter text-zinc-900">RoamAi</h1>
        <p className="text-[10px] font-bold uppercase tracking-widest">Settings Page v0.1</p>
      </footer>
    </div>
  );
};

export default SettingsMenu;
