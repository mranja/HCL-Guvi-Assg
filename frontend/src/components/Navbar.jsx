import React from 'react';
import { BarChart3, PlusCircle, LogIn, LogOut, User, Radio } from 'lucide-react';

export default function Navbar({ user, onNavigate, onLogout, currentPage }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
              PulsePoll
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs uppercase tracking-wider font-semibold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Live Redis
            </span>
          </div>
        </div>

        {/* Nav actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              currentPage === 'home' 
                ? 'text-white bg-slate-800' 
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Explore Polls
          </button>

          {user ? (
            <>
              <button
                onClick={() => onNavigate('create')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition hover:shadow-indigo-600/50 hover:scale-[1.02]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Poll</span>
              </button>

              <div className="h-4 w-[1px] bg-slate-800 mx-1" />

              <div className="flex items-center gap-2 text-sm text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
                <User className="w-4 h-4 text-indigo-400" />
                <span className="font-medium max-w-[120px] truncate">{user.name}</span>
              </div>

              <button
                onClick={onLogout}
                title="Sign out"
                className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800/60 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => onNavigate('auth')}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <LogIn className="w-4 h-4 text-indigo-400" />
              <span>Sign In / Up</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
