import React from 'react';
import { 
  PlusCircle, 
  Share2, 
  CheckCircle2, 
  Activity, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Zap
} from 'lucide-react';

export default function HowItWorks({ onGetStarted, onCreatePoll }) {
  const steps = [
    {
      number: '01',
      title: 'Create Your Poll',
      subtitle: 'Draft clear, focused questions with multiple options',
      description:
        'Sign in securely with your verified Gmail account. Set up your poll with custom options in just a few clicks. You retain full control to toggle your poll open or closed whenever you decide.',
      icon: PlusCircle,
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
    {
      number: '02',
      title: 'Share The Instant Link',
      subtitle: 'One click URL copying for your audience',
      description:
        'Copy the direct link and drop it into your presentation slides, conference chat, Zoom window, or social feed. Voters need no software downloads or account setups to participate.',
      icon: Share2,
      accent: 'text-pink-600 bg-pink-50 border-pink-100',
    },
    {
      number: '03',
      title: 'Audience Votes Live',
      subtitle: 'Fast, intuitive, and spam-protected',
      description:
        'Audience members tap their option of choice from any phone, tablet, or desktop browser. Instant cryptographic verification ensures fair voting by preventing accidental duplicates.',
      icon: CheckCircle2,
      accent: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      number: '04',
      title: 'Watch Real-Time Results',
      subtitle: 'Instant animation with zero page refresh',
      description:
        'Witness your audience consensus unfold in front of your eyes. Visual percentage bars and interactive categorical charts re-render dynamically as each ballot drops in real time.',
      icon: Activity,
      accent: 'text-purple-600 bg-purple-50 border-purple-100',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4 border border-indigo-100">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Simple, Transparent Workflow</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
          How PulsePoll Works
        </h1>
        <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
          From question creation to live audience feedback in four straightforward steps.
        </p>
      </div>

      {/* Steps List */}
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

      {/* Trust & Guarantee Callout */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-10 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-3 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Reliable &amp; Verified</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
              Protected Against Automated Spam
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              PulsePoll pairs Gmail verification for poll authors with cryptographic voter key hashing for participants. Every vote is authentic, auditable, and tracked seamlessly in our high-speed persistent database.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <button
              onClick={onCreatePoll}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-sm transition"
            >
              Launch Your First Poll
            </button>
            <button
              onClick={onGetStarted}
              className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md shadow-indigo-600/20 transition"
            >
              Explore Active Polls
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
