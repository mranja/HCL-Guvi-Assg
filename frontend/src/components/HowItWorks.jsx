import React, { useState } from 'react';
import { 
  PlusCircle, 
  CheckCircle2, 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Sliders,
  Eye,
  Lock,
  QrCode
} from 'lucide-react';

export default function HowItWorks({ onGetStarted, onCreatePoll }) {
  const [activeTab, setActiveTab] = useState('workflow');

  const steps = [
    {
      number: '01',
      title: 'Create Your Session',
      subtitle: 'Draft clear, focused questions with multiple options',
      description:
        'Sign in, name your session, add as many options as you need. Multiple choice, word questions, and audience check-ins with no limits.',
      icon: PlusCircle,
      accent: 'text-[#d97706] bg-[#fef3c7]',
    },
    {
      number: '02',
      title: 'Share a Code or QR',
      subtitle: 'Participants get a 6-character code or scan a QR',
      description:
        'No app to download. No account needed. They are in instantly, from any phone, tablet, or laptop in seconds.',
      icon: QrCode,
      accent: 'text-[#4f46e5] bg-[#eef2ff]',
    },
    {
      number: '03',
      title: 'See Results Live',
      subtitle: 'Fast, thumb-friendly, and spam-protected',
      description:
        'Responses appear in real time as people answer. Switch views, watch the room react, and share results in one link.',
      icon: CheckCircle2,
      accent: 'text-[#10b981] bg-[#ecfdf5]',
    },
    {
      number: '04',
      title: 'Presenter Projection',
      subtitle: 'Designed for big screens and projectors',
      description:
        'Toggle stage projection view for classrooms, auditoriums, and conferences with live updating response bars.',
      icon: Activity,
      accent: 'text-[#ef4444] bg-[#fef2f2]',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fcedea] text-[#c84b31] border border-[#f5d0c8] text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Architecture</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-normal text-[#1c1917] tracking-tight leading-tight mb-4 font-editorial">
          How PulsePoll Works
        </h1>
        <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
          From question creation to audience consensus in under 60 seconds.
        </p>

        {/* Tab Controls */}
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setActiveTab('workflow')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'workflow'
                ? 'bg-[#1b4332] text-white shadow-sm'
                : 'bg-white text-stone-600 border border-stone-200 hover:text-stone-900'
            }`}
          >
            Session Workflow
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition ${
              activeTab === 'settings'
                ? 'bg-[#c84b31] text-white shadow-sm'
                : 'bg-white text-stone-600 border border-stone-200 hover:text-stone-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Presentation Controls</span>
          </button>
        </div>
      </div>

      {activeTab === 'workflow' ? (
        <div className="space-y-6 mb-16">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-stone-200 rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:border-[#1b4332]/40 transition"
              >
                <div className="flex items-start gap-6">
                  <div className="font-editorial text-3xl sm:text-4xl font-bold text-stone-300">
                    {step.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`p-2 rounded-xl ${step.accent}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-bold text-stone-900 font-editorial">
                        {step.title}
                      </h2>
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-[#c84b31] mb-2 font-mono">
                      {step.subtitle}
                    </p>
                    <p className="text-xs sm:text-sm text-stone-500 max-w-2xl leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>

                <div className="self-end md:self-center shrink-0">
                  <div className="w-8 h-8 rounded-full bg-stone-50 border border-stone-200 flex items-center justify-center text-stone-400">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-[2.5rem] p-8 sm:p-12 mb-16 shadow-sm">
          <div className="max-w-2xl mb-8">
            <h2 className="text-2xl font-bold text-stone-900 tracking-tight mb-2 font-editorial">
              Audience &amp; Presentation Controls
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
              Tailor how votes are displayed and how interactions are handled during live sessions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-[#faf9f6] border border-stone-200">
              <div className="w-10 h-10 rounded-xl bg-[#eef2ff] text-[#4f46e5] flex items-center justify-center mb-4">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900 mb-1">Visual Representation</h3>
              <p className="text-xs text-stone-500 mb-4">
                Switch between real-time progress bars or responsive pie and vertical breakdown charts.
              </p>
              <span className="inline-block px-3 py-1 bg-white border border-stone-200 text-stone-700 text-[11px] font-bold rounded-lg font-mono">
                Dynamic Toggle
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-[#faf9f6] border border-stone-200">
              <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] text-[#10b981] flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900 mb-1">Anti-Duplication Shield</h3>
              <p className="text-xs text-stone-500 mb-4">
                Ensures single-ballot accuracy per participant via cryptographic client hash verification.
              </p>
              <span className="inline-block px-3 py-1 bg-white border border-stone-200 text-emerald-700 text-[11px] font-bold rounded-lg font-mono">
                Always Active
              </span>
            </div>

            <div className="p-6 rounded-3xl bg-[#faf9f6] border border-stone-200">
              <div className="w-10 h-10 rounded-xl bg-[#fcedea] text-[#c84b31] flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900 mb-1">Author Locking Controls</h3>
              <p className="text-xs text-stone-500 mb-4">
                Instantly close active polls to lock final responses, or reopen them anytime.
              </p>
              <span className="inline-block px-3 py-1 bg-white border border-stone-200 text-[#c84b31] text-[11px] font-bold rounded-lg font-mono">
                One-Click Status Toggle
              </span>
            </div>
          </div>
        </div>
      )}

      {/* CTA Box */}
      <div className="bg-[#fbf6ef] border border-[#f3ebe1] rounded-3xl p-8 sm:p-10 mb-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div>
          <h3 className="text-2xl font-normal text-stone-900 tracking-tight mb-1 font-editorial">
            Ready to host your session?
          </h3>
          <p className="text-xs text-stone-600">
            Launch a question in seconds and share with your audience.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCreatePoll}
            className="px-6 py-3.5 bg-[#c84b31] hover:bg-[#b03e26] text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition"
          >
            Host a Poll
          </button>
          <button
            onClick={onGetStarted}
            className="px-6 py-3.5 bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-bold uppercase tracking-wider rounded-2xl transition"
          >
            All Polls
          </button>
        </div>
      </div>
    </div>
  );
}
