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
  Bell,
  Eye,
  Lock
} from 'lucide-react';

export default function HowItWorks({ onGetStarted, onCreatePoll }) {
  const [activeTab, setActiveTab] = useState('workflow'); // 'workflow' or 'settings'

  const steps = [
    {
      number: '01',
      title: 'Create Your Poll',
      subtitle: 'Draft clear, focused questions with multiple options',
      description:
        'Sign in effortlessly with your email account. Set up questions with 2 to 8 distinct options. You have full author controls to open, monitor, or close polls anytime.',
      icon: PlusCircle,
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      number: '02',
      title: 'Share The Instant Link',
      subtitle: 'One-click shareable URL generation',
      description:
        'Copy the direct live poll URL with one click. Share it in presentations, conferences, Zoom chats, or forums. Voters do not need to install software or register accounts to participate.',
      icon: Share2,
      accent: 'text-pink-600 bg-pink-50 border-pink-100',
    },
    {
      number: '03',
      title: 'Audience Votes Live',
      subtitle: 'Fast, intuitive, and spam-protected',
      description:
        'Participants select their answer from any device. Cryptographic fingerprinting and Redis set logic ensure fair polling by preventing ballot stuffing.',
      icon: CheckCircle2,
      accent: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      number: '04',
      title: 'Live Real-Time Telemetry',
      subtitle: 'Instant animation with zero page refresh',
      description:
        'Audience consensus updates dynamically on screen as votes are submitted. Live percentage tracks and interactive charts animate fluidly powered by Redis Pub/Sub and WebSockets.',
      icon: Activity,
      accent: 'text-purple-600 bg-purple-50 border-purple-100',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4 border border-indigo-100">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Architecture &amp; Controls</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
          How PulsePoll Works
        </h1>
        <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
          Explore the live polling workflow and customize presentation settings for your sessions.
        </p>

        {/* Setting Switcher Tabs */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setActiveTab('workflow')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'workflow'
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
            }`}
          >
            4-Step Polling Workflow
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'settings'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Poll Presentation Settings</span>
          </button>
        </div>
      </div>

      {activeTab === 'workflow' ? (
        /* Steps List */
        <div className="space-y-8 mb-16">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-sm hover:shadow-md transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-6">
                  <div className="font-mono text-3xl sm:text-4xl font-black text-slate-300">
                    {step.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-xl border ${step.accent}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">
                        {step.title}
                      </h2>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
                      {step.subtitle}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="self-end md:self-center shrink-0">
                  <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Poll Settings Showcase */
        <div className="bg-white border border-slate-200/90 rounded-[2.5rem] p-8 sm:p-12 mb-16 shadow-lg shadow-slate-200/40">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              Audience &amp; Presentation Controls
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              Tailor how votes are displayed and how interactions are handled during live presentations or team reviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Visual Representation</h3>
              <p className="text-xs text-slate-500 mb-4">
                Switch between real-time progress bars or responsive pie and vertical breakdown charts.
              </p>
              <span className="inline-block px-3 py-1 bg-white border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg">
                Dynamic Toggle Active
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Anti-Duplication Shield</h3>
              <p className="text-xs text-slate-500 mb-4">
                Ensures single-ballot accuracy per participant via cryptographic client hash verification in Redis Sets.
              </p>
              <span className="inline-block px-3 py-1 bg-white border border-slate-200 text-emerald-700 text-[11px] font-bold rounded-lg">
                Enabled by Default
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1">Author Locking Controls</h3>
              <p className="text-xs text-slate-500 mb-4">
                Instantly close active polls to lock final responses, or reopen them anytime from your poll dashboard.
              </p>
              <span className="inline-block px-3 py-1 bg-white border border-slate-200 text-slate-700 text-[11px] font-bold rounded-lg">
                One-Click Status Toggle
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CTA Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-10 mb-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight mb-1">
            Ready to experience live polling?
          </h3>
          <p className="text-xs text-slate-500">
            Launch a question in seconds and share with your audience.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCreatePoll}
            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition"
          >
            Create a Poll
          </button>
          <button
            onClick={onGetStarted}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md shadow-indigo-600/20 transition"
          >
            View Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
