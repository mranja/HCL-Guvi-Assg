import React, { useState } from 'react';
import { Plus, LogOut, ArrowRight, Radio, Hash, MonitorPlay } from 'lucide-react';

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
    <header className="sticky top-0 z-40 bg-[#0b0f19]/80 backdrop-blur-xl border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand with Logo */}
        <div 
          onClick={() => onNavigate(user ? 'dashboard' : 'landing')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img 
            src="/logo.svg" 
            alt="PulsePoll Logo" 
            className="w-10 h-10 rounded-2xl shadow-lg shadow-cyan-500/10 group-hover:scale-105 transition-transform duration-200"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white uppercase font-mono">
                PULSE<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-400">POLL</span>
              </span>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              LIVE AUDIENCE ENGINE
            </p>
          </div>
        </div>

        {/* Center Quick Join PIN (livepoll.io feature) */}
        <form onSubmit={handleJoinSubmit} className="hidden lg:flex items-center gap-2">
          <div className="relative">
            <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Enter Room / Poll ID..."
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition w-56"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-md shadow-cyan-500/20"
          >
            Join
          </button>
        </form>

        {/* Center Navigation Links (Hidden when user is on dashboard) */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-400">
          {!user && (
            <button
              onClick={() => onNavigate('landing')}
              className={`transition hover:text-white ${
                currentPage === 'landing' ? 'text-cyan-400 font-extrabold' : ''
              }`}
            >
              Overview
            </button>
          )}

          <button
            onClick={() => onNavigate('dashboard')}
            className={`transition hover:text-white ${
              currentPage === 'dashboard' ? 'text-cyan-400 font-extrabold' : ''
            }`}
          >
            Dashboard
          </button>
          
          <button
            onClick={() => onNavigate('how-it-works')}
            className={`transition hover:text-white ${
              currentPage === 'how-it-works' ? 'text-cyan-400 font-extrabold' : ''
            }`}
          >
            How It Works
          </button>
        </nav>

        {/* Right CTA / User State */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={() => onNavigate('create')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:opacity-90 text-white shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Create Poll</span>
              </button>

              <div className="h-5 w-[1px] bg-slate-800 mx-1" />

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-slate-900/90 px-3.5 py-2 rounded-xl border border-white/10">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-cyan-500 to-violet-500 text-white flex items-center justify-center font-bold text-xs">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="max-w-[120px] truncate">{user.name}</span>
              </div>

              <button
                onClick={onLogout}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('auth')}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('auth')}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-violet-600 hover:opacity-90 text-white shadow-lg shadow-cyan-500/20 transition hover:scale-[1.02]"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
