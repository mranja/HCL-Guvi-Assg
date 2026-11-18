import React from 'react';
import { Radio, Plus, LogIn, LogOut, User, Sparkles } from 'lucide-react';

export default function Navbar({ user, onNavigate, onLogout, currentPage }) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Inspired by Clean Minimal Typography */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-200">
            <Radio className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900 uppercase font-mono">
                PULSE<span className="text-indigo-600">POLL</span>
              </span>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              LIVE REALTIME ENGINE
            </p>
          </div>
        </div>

        {/* Center / Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <button
            onClick={() => onNavigate('home')}
            className={`transition hover:text-slate-900 ${
              currentPage === 'home' ? 'text-indigo-600 font-bold' : ''
            }`}
          >
            Live Polls
          </button>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400 hover:text-slate-600 cursor-pointer">
            How It Works
          </span>
          <span className="text-slate-300">•</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium lowercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            redis + ws active
          </div>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <button
                onClick={() => onNavigate('create')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4 text-indigo-400" />
                <span>Create Poll</span>
              </button>

              <div className="h-5 w-[1px] bg-slate-200 mx-1" />

              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80">
                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span className="max-w-[120px] truncate">{user.name}</span>
              </div>

              <button
                onClick={onLogout}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onNavigate('auth')}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 transition"
              >
                Sign In
              </button>
              <button
                onClick={() => onNavigate('auth')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white shadow-md shadow-slate-900/10 transition hover:scale-[1.02]"
              >
                <span>Get Started</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
