import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import {
  Radio,
  Users,
  ChevronRight,
  Plus,
  Sparkles,
  Zap,
  CheckCircle,
  Activity
} from 'lucide-react';

export default function PollList({ onSelectPoll, onCreateClick, user }) {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const endpoint = filter === 'mine' ? '/api/polls/user/mine' : '/api/polls';
      const data = await apiRequest(endpoint);
      setPolls(data || []);
    } catch (err) {
      console.error('Error fetching polls:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolls();
  }, [filter]);

  const filteredPolls = polls.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-300">
      {/* Aesthetic Hero Canvas inspired by Flowboard styling */}
      <div className="relative rounded-[2.5rem] bg-white border border-slate-200/90 p-8 sm:p-14 mb-14 shadow-xl shadow-slate-200/40 overflow-hidden bg-dot-pattern">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Statement */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider mb-6 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span>Streaming Responses Now</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.08] mb-6">
              Where opinions <br />
              flow in <span className="text-indigo-600 underline decoration-indigo-200 underline-offset-8">real time.</span>
            </h1>

            <p className="text-slate-500 text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
              The high-velocity polling engine for creators and engineering teams.
              Built on Go Gin, MongoDB, and Redis atomic counters with zero-delay WebSockets.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={onCreateClick}
                className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Launch New Poll</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 pl-2">
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
                  Global Live Votes
                </span>
              </div>
            </div>
          </div>

          {/* Right Visual Floating Interactive Card Mockup */}
          <div className="lg:col-span-5 relative">
            <div className="relative bg-slate-50/90 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xl shadow-indigo-100/50">
              {/* Dynamic floating badge like Alex.flow / Sarah_Sync */}
              <div className="flex items-center justify-between mb-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-bold shadow-md shadow-indigo-600/30">
                  <Zap className="w-3 h-3" />
                  <span>Redis In-Memory Engine</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500 text-white text-[11px] font-bold shadow-md shadow-pink-500/30">
                  <span>Audience Sync</span>
                </div>
              </div>

              {/* Sample Live Graphic Progress */}
              <div className="space-y-3.5 my-4">
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex justify-between text-xs font-bold text-slate-800 mb-1.5">
                    <span>Microservices with Go &amp; Gin</span>
                    <span className="text-indigo-600">68%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full w-[68%]" />
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-sm">
                  <div className="flex justify-between text-xs font-bold text-slate-800 mb-1.5">
                    <span>Monolith Architecture</span>
                    <span className="text-pink-500">32%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-pink-500 h-full rounded-full w-[32%]" />
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-slate-500">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Active Real-time Session
                </span>
                <span className="font-mono text-slate-400">100% no refresh</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              filter === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200'
            }`}
          >
            All Live Polls
          </button>
          {user && (
            <button
              onClick={() => setFilter('mine')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                filter === 'mine'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-500 hover:text-slate-800 border border-slate-200'
              }`}
            >
              Created by Me
            </button>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search polls..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs font-medium focus:outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 w-full sm:w-64 transition shadow-sm"
          />
        </div>
      </div>

      {/* Polls Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 rounded-3xl bg-white border border-slate-200 animate-pulse"
            />
          ))}
        </div>
      ) : filteredPolls.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Radio className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No polls found</h3>
          <p className="text-xs text-slate-500 mb-6">
            {filter === 'mine'
              ? "You haven't launched any live polls yet."
              : 'Be the first to publish a live poll with Redis updates.'}
          </p>
          <button
            onClick={onCreateClick}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition"
          >
            Create New Poll
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolls.map((poll) => (
            <div
              key={poll.id}
              onClick={() => onSelectPoll(poll.id)}
              className="group bg-white hover:bg-white border border-slate-200/90 hover:border-indigo-500/60 rounded-3xl p-7 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      poll.is_active
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        poll.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                      }`}
                    />
                    {poll.is_active ? 'LIVE' : 'CLOSED'}
                  </span>

                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {poll.total_votes} votes
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2 leading-snug">
                  {poll.title}
                </h3>

                {poll.description && (
                  <p className="text-xs text-slate-500 line-clamp-2 mb-5">
                    {poll.description}
                  </p>
                )}
              </div>

              <div className="pt-5 border-t border-slate-100 flex items-center justify-between mt-4">
                <span className="text-xs font-semibold text-slate-400">
                  {poll.options.length} Options
                </span>
                <span className="text-xs font-bold text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform uppercase tracking-wider">
                  Vote Now <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
