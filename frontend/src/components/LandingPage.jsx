import React, { useState } from 'react';
import { 
  ChevronRight, 
  Sparkles, 
  Zap, 
  BarChart3, 
  QrCode, 
  Users, 
  Tv, 
  Hash, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  Presentation,
  Rocket,
  Smartphone,
  Flame
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
      
      {/* Editorial Hero Section (Inspired by livepoll.io image reference) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-16 text-center">
        
        {/* Top Tag Pill like "Built for teachers" */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#fcedea] text-[#c84b31] border border-[#f5d0c8] text-xs font-semibold mb-8">
          <span className="w-2 h-2 rounded-full bg-[#c84b31]" />
          <span>Built for speakers, teachers &amp; teams</span>
        </div>

        {/* Large Editorial Headline */}
        <h1 className="text-5xl sm:text-7xl font-normal text-[#1c1917] tracking-tight leading-[1.08] mb-6 font-editorial">
          Your participants never <br />
          get <span className="text-[#c84b31] underline decoration-[#f5d0c8] underline-offset-8">locked out.</span>
        </h1>

        {/* Subtitle & Value Proposition */}
        <p className="text-xl sm:text-2xl font-semibold text-stone-800 max-w-2xl mx-auto mb-4 leading-snug">
          No locked features. No paywall on the join screen. No upgrade prompt in the middle of your presentation.
        </p>

        <p className="text-sm sm:text-base text-stone-500 max-w-2xl mx-auto leading-relaxed mb-10">
          PulsePoll is a live polling, Q&amp;A, and quiz platform for presenters, trainers, and educators. Sessions support real-time participation with every feature unlocked.
        </p>

        {/* Instant Join Box (Center) */}
        <div className="max-w-md mx-auto p-2 bg-white rounded-2xl border border-stone-200 shadow-sm mb-8">
          <form onSubmit={handleRoomSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Hash className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Enter 6-character poll code..."
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                className="w-full pl-9 pr-3 py-3 bg-[#faf9f6] border border-stone-200 rounded-xl text-stone-900 font-mono text-sm placeholder-stone-400 focus:outline-none focus:border-[#c84b31] transition"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-sm"
            >
              Join
            </button>
          </form>
        </div>

        {/* Action CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onCreate}
            className="px-8 py-4 bg-[#c84b31] hover:bg-[#b03e26] text-white font-bold text-sm rounded-2xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Host a poll now →
          </button>

          <button
            onClick={onExplore}
            className="px-7 py-4 bg-white hover:bg-stone-50 text-stone-800 font-semibold text-sm rounded-2xl border border-stone-200 shadow-sm transition"
          >
            Explore Dashboard
          </button>
        </div>
      </section>

      {/* "Live in under 60 seconds" 3-Card Grid (Screenshot 2 replication in forest/warm palette) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-stone-200/80">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#c84b31] mb-2 block font-mono">
            HOW IT WORKS
          </span>
          <h2 className="text-3xl sm:text-5xl font-normal text-[#1c1917] tracking-tight font-editorial">
            Live in under 60 seconds.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col justify-between relative hover:border-[#1b4332]/40 transition">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#fef3c7] text-[#d97706] flex items-center justify-center text-xl">
                  🚀
                </div>
                <span className="text-4xl font-editorial font-bold text-stone-200">
                  01
                </span>
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3 font-editorial">
                Create your session
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                Sign in, name your session, add as many options as you need. Multiple choice, word questions, and audience check-ins with no limits.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col justify-between relative hover:border-[#1b4332]/40 transition">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#eef2ff] text-[#4f46e5] flex items-center justify-center text-xl">
                  📲
                </div>
                <span className="text-4xl font-editorial font-bold text-stone-200">
                  02
                </span>
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3 font-editorial">
                Share a code
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                Participants get a 6-character code or scan a QR. No app to download. No account needed. They're in instantly from any phone or laptop.
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col justify-between relative hover:border-[#1b4332]/40 transition">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#fef2f2] text-[#ef4444] flex items-center justify-center text-xl">
                  ⚡
                </div>
                <span className="text-4xl font-editorial font-bold text-stone-200">
                  03
                </span>
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3 font-editorial">
                See results live
              </h3>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                Responses appear in real time as people answer. Switch views, watch the room react, and share results in one link.
              </p>
            </div>
          </div>

        </div>

        {/* Step Link indicators */}
        <div className="flex items-center justify-center gap-3 mt-10 text-xs font-semibold text-stone-400">
          <span>Create</span>
          <span>→</span>
          <span>Share</span>
          <span>→</span>
          <span className="text-[#c84b31] font-bold">See results live</span>
        </div>
      </section>

      {/* "Ready to run your first poll?" Box (Screenshot 3 & 4 replication in Warm Terracotta) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-16">
        <div className="rounded-[2.5rem] bg-[#fbf6ef] border border-[#f3ebe1] p-10 sm:p-16 text-center shadow-sm">
          <h2 className="text-3xl sm:text-5xl font-normal text-[#1c1917] tracking-tight mb-4 font-editorial">
            Ready to run your first poll?
          </h2>
          <p className="text-sm sm:text-base text-stone-600 max-w-lg mx-auto mb-8 leading-relaxed">
            Create a session in seconds. Share a 6-character code. Watch responses come in live.
          </p>

          <button
            onClick={onCreate}
            className="px-10 py-4 bg-[#c84b31] hover:bg-[#b03e26] text-white font-bold text-sm rounded-2xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] mb-4"
          >
            Try it now
          </button>

          <p className="text-xs text-stone-400">
            No credit card. No limits. No catch.
          </p>
        </div>

        {/* Platform Stat Bar */}
        <div className="mt-12 pt-8 border-t border-stone-200 text-center text-xs text-stone-400 font-mono flex flex-wrap items-center justify-center gap-8">
          <span>Platform active since 2026</span>
          <span>•</span>
          <span>Real-time audience consensus</span>
          <span>•</span>
          <span>Up to 1,000 participant joins</span>
        </div>
      </section>

    </div>
  );
}
