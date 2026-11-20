import React, { useState } from 'react';
import { Plus, LogOut, ArrowRight, Hash } from 'lucide-react';

export default function Navbar({ user, onNavigate, onLogout, currentPage, onJoinCode }) {
  const [pinCode, setPinCode] = useState('');

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (pinCode.trim()) {
      onJoinCode(pinCode.trim());
      setPinCode('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#faf9f6]/90 backdrop-blur-md border-b border-[#e7e5e4] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand with Warm Logo */}
        <div 
          onClick={() => onNavigate(user ? 'dashboard' : 'landing')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img 
            src="/logo.svg" 
            alt="PulsePoll Logo" 
            className="w-10 h-10 rounded-xl shadow-sm group-hover:scale-105 transition-transform duration-200"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-[#1c1917] font-editorial">
                Pulse<span className="text-[#c84b31]">Poll</span>
              </span>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-[#78716c]">
              Audience Consensus
            </p>
          </div>
        </div>

        {/* Center Quick Join PIN (Audience direct join) */}
        <form onSubmit={handleJoinSubmit} className="hidden lg:flex items-center gap-2">
          <div className="relative">
            <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Join a poll (Enter PIN / ID)..."
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-[#e7e5e4] rounded-xl text-stone-900 placeholder-stone-400 text-xs font-mono focus:outline-none focus:border-[#c84b31] focus:ring-1 focus:ring-[#c84b31] transition w-60 shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-semibold text-xs rounded-xl transition shadow-sm"
          >
            Join
          </button>
        </form>

        {/* Center Navigation Links: ONLY visible when authenticated */}
        {user ? (
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-stone-600">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`transition hover:text-[#1c1917] ${
                currentPage === 'dashboard' ? 'text-[#c84b31] font-bold' : ''
              }`}
            >
              Polls Dashboard
            </button>
            
            <button
              onClick={() => onNavigate('how-it-works')}
              className={`transition hover:text-[#1c1917] ${
                currentPage === 'how-it-works' ? 'text-[#c84b31] font-bold' : ''
              }`}
            >
              How it works
            </button>
          </nav>
        ) : (
          <div className="hidden md:flex items-center gap-4 text-xs text-stone-500 font-editorial italic">
            <span>Free live audience polling</span>
          </div>
        )}

        {/* Right CTA / User State */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={() => onNavigate('create')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#c84b31] hover:bg-[#b03e26] text-white shadow-md shadow-amber-900/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Host a Poll</span>
              </button>

              <div className="h-5 w-[1px] bg-stone-300 mx-1" />

              <div className="flex items-center gap-2 text-xs font-semibold text-stone-700 bg-white px-3.5 py-2 rounded-xl border border-stone-200 shadow-sm">
                <div className="w-6 h-6 rounded-full bg-[#1b4332] text-white flex items-center justify-center font-bold text-xs">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="max-w-[120px] truncate">{user.name}</span>
              </div>

              <button
                onClick={onLogout}
                title="Sign out"
                className="p-2 text-stone-400 hover:text-rose-600 rounded-xl hover:bg-stone-100 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('auth')}
                className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 transition"
              >
                Log in
              </button>
              <button
                onClick={() => onNavigate('auth')}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#c84b31] hover:bg-[#b03e26] text-white shadow-sm transition hover:scale-[1.02]"
              >
                <span>Host a poll →</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
