import React from 'react';
import { 
  Radio, 
  ChevronRight, 
  Sparkles, 
  Zap, 
  BarChart3, 
  Share2, 
  ShieldCheck, 
  Users, 
  ArrowRight,
  TrendingUp,
  Clock,
  HeartHandshake
} from 'lucide-react';

export default function LandingPage({ onExplore, onCreate, user }) {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        <div className="relative rounded-[2.5rem] bg-white border border-slate-200/90 p-8 sm:p-14 shadow-xl shadow-slate-200/40 overflow-hidden bg-dot-pattern">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Hero Statement */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider mb-6 border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                <span>Zero-Latency Audience Polling</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.08] mb-6">
                Where opinions <br />
                flow in <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">real time.</span>
              </h1>

              <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
                PulsePoll empowers educators, event organizers, and engineering teams to ask questions, share an instant link, and watch audience results animate live as votes come in.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  onClick={onExplore}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Explore Live Polls</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

                <button
                  onClick={onCreate}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all hover:scale-[1.02]"
                >
                  <span>Create a Poll</span>
                </button>

                <div className="flex items-center gap-3 pl-2 sm:pl-4">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold ring-2 ring-white">
                      A
                    </div>
                    <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold ring-2 ring-white">
                      R
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold ring-2 ring-white">
                      S
                    </div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Live Active Voters
                  </span>
                </div>
              </div>
            </div>

            {/* Right Interactive Presentation Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative bg-slate-50/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xl shadow-indigo-100/60">
                <div className="flex items-center justify-between mb-5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-bold shadow-md shadow-indigo-600/30">
                    <Zap className="w-3 h-3" />
                    <span>Real-time Stream</span>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500 text-white text-[11px] font-bold shadow-md shadow-pink-500/30">
                    <span>Audience Sync</span>
                  </div>
                </div>

                {/* About PulsePoll Feature Box */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm mb-4">
                  <div className="flex items-center gap-2 mb-1.5 text-xs font-bold uppercase tracking-wider text-slate-900">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Instant Live Aggregation</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Audience votes are counted atomically in-memory with sub-millisecond latencies, delivering fluid live bar updates without requiring manual page reloads.
                  </p>
                </div>

                {/* Interactive Dynamic Poll Preview */}
                <div className="space-y-3">
                  <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex justify-between text-xs font-bold text-slate-800 mb-1.5">
                      <span>Live Polling Engine</span>
                      <span className="text-indigo-600 font-black">74%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full w-[74%] transition-all duration-700" />
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex justify-between text-xs font-bold text-slate-800 mb-1.5">
                      <span>Traditional Static Forms</span>
                      <span className="text-pink-500 font-black">26%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-pink-500 h-full rounded-full w-[26%] transition-all duration-700" />
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-500">
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Voting Session
                  </span>
                  <span className="font-mono text-slate-400">100% no refresh</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Feature Grid: What Makes PulsePoll Different */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-100">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2 block">
            Engineered For Interaction
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Everything you need to engage your audience
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            No complex installations, no clunky signups. Create your poll in 10 seconds and share a single link.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Truly Real-Time</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every vote updates instantly for everyone watching. No refresh button, no lag, no stale counters.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Anti-Spam &amp; Verified</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Organizers verify via valid Gmail accounts. Voter cryptographic fingerprinting prevents ballot stuffing.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-3xl p-8 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-5">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Live Analytics Visualizer</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Toggle effortlessly between dynamic vote proportion tracks and responsive categorical charts.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mb-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
              Ready to gather live audience feedback?
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Host your first live poll in seconds. Zero friction for participants.
            </p>
          </div>
          <button
            onClick={onExplore}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition shadow-lg shadow-indigo-600/30 whitespace-nowrap"
          >
            Launch Interactive Dashboard
          </button>
        </div>
      </section>
    </div>
  );
}
