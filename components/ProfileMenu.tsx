
import React from 'react';
import { UserProfile } from '../types';

interface ProfileMenuProps {
  user: UserProfile;
  onClose: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ user, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] bg-white animate-in slide-in-from-right duration-300 flex flex-col">
      {/* Header */}
      <header className="px-6 pt-10 pb-6 flex items-center justify-between">
        <button 
          onClick={onClose}
          className="p-2 -ml-2 rounded-full hover:bg-zinc-100 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-zinc-900">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">Your Roam Profile</h2>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      {/* Profile Overview */}
      <div className="px-6 py-8 flex flex-col items-center text-center gap-4">
        <div className="w-24 h-24 rounded-[2rem] overflow-hidden border-4 border-zinc-50 shadow-xl">
          <img 
            src={user.avatarUrl || 'https://picsum.photos/seed/roamai/200'} 
            alt={user.name} 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h3 className="text-2xl font-black text-zinc-900">{user.name}</h3>
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest mt-1">Master Explorer</p>
        </div>
      </div>

      {/* Menu Options */}
      <div className="flex-1 px-6 mt-4 flex flex-col gap-3">
        {/* Previous Chats */}
        <button className="group flex items-center gap-4 p-5 bg-zinc-50 rounded-[2rem] border border-zinc-100 transition-all active:scale-95 hover:bg-white hover:shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0 1 12 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97a48.901 48.901 0 0 1-3.476.383.39.39 0 0 0-.297.17l-2.755 4.133a.75.75 0 0 1-1.248 0l-2.755-4.133a.39.39 0 0 0-.297-.17 48.9 48.9 0 0 1-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97ZM6.75 8.25a.75.75 0 0 1 .75-.75h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H7.5Z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-sm font-black text-zinc-900">Previous Chats</h4>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Review your travels</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-zinc-300">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Settings */}
        <button className="group flex items-center gap-4 p-5 bg-zinc-50 rounded-[2rem] border border-zinc-100 transition-all active:scale-95 hover:bg-white hover:shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-zinc-200 flex items-center justify-center text-zinc-900 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.11-.454.03L6.21 5.082a1.875 1.875 0 0 0-2.453.441L2.254 7.524a1.875 1.875 0 0 0 .417 2.457l1.032.774c.102.077.122.214.077.388a7.49 7.49 0 0 0 0 1.714c.045.174.025.311-.077.388l-1.032.774a1.875 1.875 0 0 0-.417 2.457l1.503 2.001a1.875 1.875 0 0 0 2.453.441l1.104-.754c.12-.082.288-.087.454.03a7.494 7.494 0 0 0 .986.57c.182.088.277.228.297.348l.178 1.072a1.875 1.875 0 0 0 1.85 1.567h3.004c.917 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.115-.26.297-.348a7.493 7.493 0 0 0 .986-.57c.166-.115.334-.11.454-.03l1.104.754a1.875 1.875 0 0 0 2.453-.441l1.503-2.001a1.875 1.875 0 0 0-.417-2.457l-1.032-.774c-.102-.077-.122-.214-.077-.388a7.49 7.49 0 0 0 0-1.714c-.045-.174-.025-.311.077-.388l1.032-.774a1.875 1.875 0 0 0 .417-2.457l-1.503-2.001a1.875 1.875 0 0 0-2.453-.441l-1.104.754c-.12.082-.288.087-.454-.03a7.49 7.49 0 0 0-.986-.57c-.182-.088-.277-.228-.297-.348l-.178-1.072a1.875 1.875 0 0 0-1.85-1.567h-3.004ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <h4 className="text-sm font-black text-zinc-900">Settings</h4>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">App preferences</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-zinc-300">
            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Footer Branding */}
      <footer className="px-6 py-10 flex flex-col items-center gap-1 opacity-20">
        <h1 className="text-xl font-black italic tracking-tighter text-zinc-900">RoamAi</h1>
        <p className="text-[10px] font-bold uppercase tracking-widest">Version 1.0.4</p>
      </footer>
    </div>
  );
};

export default ProfileMenu;
