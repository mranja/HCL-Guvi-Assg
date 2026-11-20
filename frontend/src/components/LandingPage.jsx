import React, { useState } from 'react';
import { 
  ChevronRight, 
  Sparkles, 
  Zap, 
  BarChart3, 
  QrCode, 
  Radio, 
  Users, 
  Tv, 
  Hash, 
  CheckCircle2, 
  Flame,
  ArrowRight
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function LandingPage({ onExplore, onCreate, onJoinCode }) {
  const [roomInput, setRoomInput] = useState('');

  const handleRoomSubmit = (e) => {
    e.preventDefault();
    if (roomInput.trim()) {
      onJoinCode(roomInput.trim());
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* Hero Section with Cyber/Electric Palette */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <div className="relative rounded-[2.5rem] bg-gradient-to-b from-[#111827]/90 to-[#0b0f19] border border-white/10 p-8 sm:p-14 shadow-2xl overflow-hidden cyber-grid">
          
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            
            {/* Left Content */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Next-Gen Interactive Polling</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.08] mb-6">
                Live polls for conferences, <br />
                classes &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">gatherings.</span>
              </h1>

              <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
                Create engaging live polls in seconds. Audiences participate from any mobile browser with a PIN code or QR scan—no signups or downloads required.
              </p>

              {/* Instant Room PIN Input Bar */}
              <form onSubmit={handleRoomSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-md mb-8">
                <div className="relative flex-1">
                  <Hash className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Enter Poll Code (e.g. 6af...)"
                    value={roomInput}
                    onChange={(e) => setRoomInput(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900/90 border border-white/10 rounded-2xl text-white font-mono placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-cyan-500/20 transition whitespace-nowrap"
                >
                  Join Room
                </button>
              </form>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={onCreate}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-violet-600/25 transition-all hover:scale-[1.02]"
                >
                  <span>Create a Poll</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onExplore}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition"
                >
                  <span>Explore Dashboard</span>
                </button>
              </div>
            </div>

            {/* Right Presenter / Big-Screen Preview Mockup */}
            <div className="lg:col-span-5 relative">
              <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-3xl p-6 sm:p-7 border border-white/10 shadow-2xl glow-cyan">
                
                {/* Header bar */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <Tv className="w-4 h-4 text-cyan-400" />
                    <span>Presenter Projection View</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE
                  </div>
                </div>

                {/* QR Code and Code Pill */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/70 border border-white/5 mb-5">
                  <div className="p-2 bg-white rounded-xl shadow-md">
                    <QRCodeSVG 
                      value="https://pulsepoll.live" 
                      size={64} 
                      fgColor="#0b0f19"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Join Instantly</span>
                    <h3 className="text-base font-mono font-black text-white">Scan QR or enter PIN</h3>
                    <p className="text-[11px] text-cyan-400 font-mono mt-0.5">pulsepoll.live</p>
                  </div>
                </div>

                {/* Question and Realtime Animated Bars */}
                <div className="space-y-3 mb-4">
                  <div className="text-xs font-bold text-slate-200">
                    Which stack are you deploying your real-time apps on?
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-300">Go (Gin) + Redis + WebSockets</span>
                      <span className="text-cyan-400 font-mono">72%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full w-[72%]" />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-white/5">
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-300">Traditional Polling Engine</span>
                      <span className="text-violet-400 font-mono">28%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-violet-500 to-pink-500 h-full rounded-full w-[28%]" />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    148 Live Voters
                  </span>
                  <span>Instant Redis sync</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3 Pillar Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 transition">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">QR Code &amp; PIN Entry</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Audiences scan a projected QR code on screen or type the 6-character room PIN on their phone to participate instantly.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/5 hover:border-violet-500/30 transition">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-5">
              <Tv className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Projection Mode</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full-screen stage and presentation view designed specifically for large conference monitors and classroom projectors.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/5 hover:border-emerald-500/30 transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Sub-Second Redis Sync</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              In-memory atomic incrementation ensures thousands of simultaneous ballots register with zero lag or database bottlenecks.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
