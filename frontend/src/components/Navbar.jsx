import React from 'react';
import { Plus, LogOut, ArrowRight } from 'lucide-react';

export default function Navbar({ user, onNavigate, onLogout, currentPage }) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand with Custom Logo */}
        <div 
          onClick={() => onNavigate('landing')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img 
            src="/logo.svg" 
            alt="PulsePoll Logo" 
            className="w-10 h-10 rounded-xl shadow-sm group-hover:scale-105 transition-transform duration-200"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-slate-900 uppercase font-mono">
                Pulse<span className="text-indigo-600">Poll</span>
              </span>
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              Audience Polling Engine
            </p>
          </div>
        </div>

        {/* Center Navigation Links (Clean, No Tech-Stack Labels) */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-500">
          <button
            onClick={() => onNavigate('landing')}
            className={`transition hover:text-slate-900 ${
              currentPage === 'landing' ? 'text-indigo-600 font-extrabold' : ''
            }`}
          >
            Overview
          </button>
          
          <button
            onClick={() => onNavigate('how-it-works')}
            className={`transition hover:text-slate-900 ${
              currentPage === 'how-it-works' ? 'text-indigo-600 font-extrabold' : ''
            }`}
          >
            How It Works
          </button>

          <button
            onClick={() => onNavigate('dashboard')}
            className={`transition hover:text-slate-900 ${
              currentPage === 'dashboard' ? 'text-indigo-600 font-extrabold' : ''
            }`}
          >
            Explore Polls
          </button>
        </nav>

        {/* Right CTA / User State */}
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
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition hover:scale-[1.02]"
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
