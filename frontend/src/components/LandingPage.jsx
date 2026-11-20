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
  ArrowRight,
  ShieldCheck,
  Globe2,
  PieChart,
  HelpCircle,
  Vote,
  MonitorSmartphone,
  Presentation,
  Smile
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
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="relative rounded-[2.5rem] bg-gradient-to-b from-[#111827]/95 to-[#0b0f19] border border-white/10 p-8 sm:p-14 shadow-2xl overflow-hidden cyber-grid">
          
          {/* Ambient Lighting */}
          <div className="absolute top-0 right-1/4 w-[32rem] h-[32rem] bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-[30rem] h-[30rem] bg-violet-500/15 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            
            {/* Left Hero Statement */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-6">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>Next-Generation Live Polling &amp; Interaction</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.08] mb-6">
                Interactive live polls, <br />
                quizzes &amp; <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-400">audience consensus.</span>
              </h1>

              <p className="text-slate-400 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
                The ultimate real-time audience engagement platform. Built for speakers, educators, workshops, and teams. Instant QR scan, sub-second live vote sync, and presenter projection mode.
              </p>

              {/* Instant Join Box (like livepoll.io) */}
              <div className="p-2 sm:p-3 rounded-2xl bg-slate-900/90 border border-white/10 max-w-md mb-8 shadow-xl">
                <form onSubmit={handleRoomSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="relative flex-1">
                    <Hash className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400" />
                    <input
                      type="text"
                      placeholder="Enter Poll ID or PIN..."
                      value={roomInput}
                      onChange={(e) => setRoomInput(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-950/80 border border-white/10 rounded-xl text-white font-mono placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 transition"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-500/25 transition whitespace-nowrap"
                  >
                    Join Poll
                  </button>
                </form>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={onCreate}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-violet-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Create Free Poll</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onExplore}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider border border-white/10 transition"
                >
                  <span>Explore Dashboard</span>
                </button>
              </div>

              <div className="mt-8 flex items-center gap-6 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <CheckCircle2 className="w-4 h-4" /> No apps required
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" /> 100% Real-time
                </span>
                <span className="flex items-center gap-1.5 text-violet-400">
                  <CheckCircle2 className="w-4 h-4" /> Up to 1,000 voters
                </span>
              </div>
            </div>

            {/* Right Live Visual Presentation Screen */}
            <div className="lg:col-span-5 relative">
              <div className="relative bg-[#0d1322] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl glow-cyan">
                
                {/* Header Screen Controls */}
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                    <Tv className="w-4 h-4 text-cyan-400" />
                    <span>Presenter Stage View</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    BROADCASTING
                  </div>
                </div>

                {/* QR Code and Quick Link Card */}
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/80 border border-white/10 mb-5">
                  <div className="p-2 bg-white rounded-xl shadow-lg shrink-0">
                    <QRCodeSVG 
                      value="https://pulsepoll.live" 
                      size={68} 
                      fgColor="#0b0f19"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 font-mono">Quick Access</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">Scan to Vote from Mobile</h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">or visit pulsepoll.live</p>
                  </div>
                </div>

                {/* Animated Poll Bars Preview */}
                <div className="space-y-3.5 mb-5">
                  <div className="text-xs font-bold text-slate-200">
                    What format works best for your team's live interactive meetings?
                  </div>

                  <div className="p-3 bg-slate-950/70 rounded-xl border border-white/5">
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-300">Live Realtime Polling</span>
                      <span className="text-cyan-400 font-mono">68%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full rounded-full w-[68%] transition-all duration-700" />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/70 rounded-xl border border-white/5">
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-300">Word Clouds &amp; Open Q&amp;A</span>
                      <span className="text-violet-400 font-mono">22%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-violet-500 to-pink-500 h-full rounded-full w-[22%] transition-all duration-700" />
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/70 rounded-xl border border-white/5">
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-slate-300">Static Feedback Forms</span>
                      <span className="text-slate-500 font-mono">10%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-slate-700 h-full rounded-full w-[10%] transition-all duration-700" />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="flex items-center gap-1.5 text-slate-200">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    142 Active Voters
                  </span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Zero-latency sync
                  </span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Section: What PulsePoll Delivers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2 block font-mono">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Designed for presentations, conferences &amp; classrooms
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Engage hundreds of audience participants simultaneously with zero latency and high visual impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 transition">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-5">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">QR Code &amp; PIN Entry</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Audiences scan the projected QR code directly from their mobile camera or enter the room code to vote in seconds.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/5 hover:border-violet-500/30 transition">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-5">
              <Presentation className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Presenter Stage View</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full-screen stage and presentation view designed specifically for large conference monitors and classroom projectors.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/60 border border-white/5 hover:border-emerald-500/30 transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Anti-Spam &amp; Atomic Counting</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              In-memory atomic counting with cryptographic voter fingerprinting ensures fair voting and eliminates duplicate entries.
            </p>
          </div>
        </div>
      </section>

      {/* How it Compares / Free Forever Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 mb-12">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-white/10 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Free Interactive Polling</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
              Ready to gather live audience feedback?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
              Launch your first live poll in 10 seconds. Share the room PIN or QR code and watch real-time results stream in.
            </p>
          </div>
          <button
            onClick={onCreate}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-violet-600 hover:opacity-90 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition shadow-xl shadow-cyan-500/25 whitespace-nowrap"
          >
            Create Your First Poll
          </button>
        </div>
      </section>

    </div>
  );
}
