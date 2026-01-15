
import React from 'react';
import { UserProfile, LocationData } from '../types';

interface HeaderProps {
  user: UserProfile;
  location: LocationData & { isLocating?: boolean; error?: string | null };
  onProfileClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, location, onProfileClick }) => {
  const isLive = !location.isLocating && !location.error;

  return (
    <header className="flex items-center justify-between px-6 pt-8 pb-4 w-full">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Hi {user.name}
        </h1>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            {/* Radar Ripple Effect for active tracking */}
            {isLive && (
              <div className="absolute w-6 h-6 rounded-full bg-blue-500/20 animate-ping"></div>
            )}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className={`relative z-10 w-4 h-4 transition-colors duration-500 ${
                location.error 
                  ? 'text-red-400' 
                  : isLive 
                    ? 'text-blue-500' 
                    : 'text-zinc-300 animate-pulse'
              }`}
            >
              <path fillRule="evenodd" d="m11.54 22.351.07.04.028.016a.76.76 0 0 0 .723 0l.028-.015.071-.041a16.975 16.975 0 0 0 1.144-.742 19.58 19.58 0 0 0 2.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 0 0-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 0 0 2.682 2.282 16.975 16.975 0 0 0 1.145.742ZM12 13.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
            </svg>
          </div>

          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className={`text-sm font-semibold truncate max-w-[180px] transition-colors duration-300 ${
              location.error ? 'text-red-500' : 'text-zinc-600'
            }`}>
              {location.error ? location.error : (location.isLocating ? 'Finding you...' : `${location.city}, ${location.country}`)}
            </span>
            
            {isLive && (
              <div className="flex items-center gap-1 bg-blue-50 px-1.5 py-0.5 rounded-md border border-blue-100 animate-in fade-in zoom-in duration-500">
                <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-tighter">Live</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <button 
        onClick={onProfileClick}
        className="relative group focus:outline-none"
      >
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-zinc-100 transition-transform active:scale-90">
          <img 
            src={user.avatarUrl || 'https://picsum.photos/seed/roamai/100/100'} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
        <div className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full transition-colors duration-500 ${
          user.status === 'online' || user.status === 'exploring' ? 'bg-green-500' : 'bg-zinc-300'
        }`}></div>
      </button>
    </header>
  );
};

export default Header;
