import React, { useState } from 'react';
import { 
  PlusCircle, 
  Share2, 
  CheckCircle2, 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Zap,
  Sliders,
  Eye,
  Lock,
  Tv,
  QrCode
} from 'lucide-react';

export default function HowItWorks({ onGetStarted, onCreatePoll }) {
  const [activeTab, setActiveTab] = useState('workflow');

  const steps = [
    {
      number: '01',
      title: 'Create Your Poll',
      subtitle: 'Draft clear, focused questions with multiple options',
      description:
        'Sign in effortlessly with your email account. Set up questions with 2 to 8 distinct options. You have full author controls to open, monitor, or close polls anytime.',
      icon: PlusCircle,
      accent: 'text-cyan-400 bg-cyan-950/40 border-cyan-500/20',
    },
    {
      number: '02',
      title: 'Project or Share PIN / QR',
      subtitle: 'Instant audience entry with zero friction',
      description:
        'Project the live poll on a large screen with a prominent QR code and room PIN. Voters simply scan from their phones or enter the code—no software downloads or accounts needed.',
      icon: QrCode,
      accent: 'text-violet-400 bg-violet-950/40 border-violet-500/20',
    },
    {
      number: '03',
      title: 'Audience Votes Live',
      subtitle: 'Fast, thumb-friendly, and spam-protected',
      description:
        'Participants select their answer from any device. Cryptographic client fingerprinting and Redis atomic set logic prevent ballot stuffing.',
      icon: CheckCircle2,
      accent: 'text-emerald-400 bg-emerald-950/40 border-emerald-500/20',
    },
    {
      number: '04',
      title: 'Live Real-Time Telemetry',
      subtitle: 'Instant animation with zero page refresh',
      description:
        'Audience consensus updates dynamically on screen as votes are submitted. Live percentage tracks and interactive charts animate fluidly powered by Redis Pub/Sub and WebSockets.',
      icon: Activity,
      accent: 'text-pink-400 bg-pink-950/40 border-pink-500/20',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Architecture &amp; Controls</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          How PulsePoll Works
        </h1>
        <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
          Explore the live polling workflow and customize presentation settings for your sessions.
        </p>

        {/* Setting Switcher Tabs */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setActiveTab('workflow')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'workflow'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 border border-white/10 hover:text-white'
            }`}
          >
            4-Step Polling Workflow
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 border border-white/10 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Poll Presentation Settings</span>
          </button>
        </div>
      </div>

      {activeTab === 'workflow' ? (
        /* Steps List */
        <div className="space-y-6 mb-16">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-[#111827]/90 border border-white/5 rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-cyan-500/20 transition"
              >
                <div className="flex items-start gap-6">
                  <div className="font-mono text-3xl sm:text-4xl font-black text-slate-600">
                    {step.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-xl border ${step.accent}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-bold text-white">
                        {step.title}
                      </h2>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                      {step.subtitle}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="self-end md:self-center shrink-0">
                  <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-400">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Presentation Settings */
        <div className="bg-[#111827]/90 border border-white/5 rounded-[2.5rem] p-8 sm:p-12 mb-16 shadow-2xl cyber-grid">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight mb-2">
              Audience &amp; Presentation Controls
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Tailor how votes are displayed and how interactions are handled during live presentations or team reviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Visual Representation</h3>
              <p className="text-xs text-slate-400 mb-4">
                Switch between real-time progress bars or responsive pie and vertical breakdown charts.
              </p>
              <span className="inline-block px-3 py-1 bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 text-[11px] font-bold rounded-lg font-mono">
                Dynamic Toggle Active
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Anti-Duplication Shield</h3>
              <p className="text-xs text-slate-400 mb-4">
                Ensures single-ballot accuracy per participant via cryptographic client hash verification in Redis Sets.
              </p>
              <span className="inline-block px-3 py-1 bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold rounded-lg font-mono">
                Enabled by Default
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Author Locking Controls</h3>
              <p className="text-xs text-slate-400 mb-4">
                Instantly close active polls to lock final responses, or reopen them anytime from your poll dashboard.
              </p>
              <span className="inline-block px-3 py-1 bg-violet-950/60 border border-violet-500/30 text-violet-400 text-[11px] font-bold rounded-lg font-mono">
                One-Click Status Toggle
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CTA Box */}
      <div className="bg-gradient-to-r from-[#111827] via-slate-900 to-[#111827] border border-white/10 rounded-3xl p-8 sm:p-10 mb-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight mb-1">
            Ready to experience live polling?
          </h3>
          <p className="text-xs text-slate-400">
            Launch a question in seconds and share with your audience.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCreatePoll}
            className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-violet-600 hover:opacity-90 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-lg shadow-cyan-500/20 transition"
          >
            Create a Poll
          </button>
          <button
            onClick={onGetStarted}
            className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider rounded-2xl border border-white/10 transition"
          >
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
