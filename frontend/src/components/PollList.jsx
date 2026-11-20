import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import {
  Users,
  ChevronRight,
  Plus,
  Sparkles,
  Zap,
  Radio,
  Search
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
      
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Live Polls Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time interactive audience voting rooms
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                filter === 'all'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Polls
            </button>
            {user && (
              <button
                onClick={() => setFilter('mine')}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
                  filter === 'mine'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
              }`}
            >
              My Polls
            </button>
          )}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search polls..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-900/90 border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 transition w-48 sm:w-60"
            />
          </div>
        </div>
      </div>

      {/* Grid of Polls with Dark Cyber Aesthetic */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 rounded-3xl bg-slate-900/50 border border-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : filteredPolls.length === 0 ? (
        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-12 text-center max-w-md mx-auto shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-4">
            <Radio className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">No polls found</h3>
          <p className="text-xs text-slate-400 mb-6">
            {filter === 'mine'
              ? "You haven't launched any live polls yet."
              : 'Be the first to launch an interactive live poll!'}
          </p>
          <button
            onClick={onCreateClick}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-cyan-500/20"
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
              className="group bg-[#111827]/90 hover:bg-[#111827] border border-white/5 hover:border-cyan-500/40 rounded-3xl p-7 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-xl hover:shadow-cyan-500/10 hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      poll.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        poll.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                      }`}
                    />
                    {poll.is_active ? 'LIVE' : 'CLOSED'}
                  </span>

                  <span className="text-xs font-mono font-bold text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    {poll.total_votes} votes
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2 leading-snug">
                  {poll.title}
                </h3>

                {poll.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mb-5">
                    {poll.description}
                  </p>
                )}
              </div>

              <div className="pt-5 border-t border-white/5 flex items-center justify-between mt-4">
                <span className="text-xs font-mono text-slate-500">
                  {poll.options.length} Options
                </span>
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform uppercase tracking-wider">
                  Enter Room <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
