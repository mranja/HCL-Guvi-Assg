import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { Radio, Users, ChevronRight, PlusCircle, Sparkles, Filter } from 'lucide-react';

export default function PollList({ onSelectPoll, onCreateClick, user }) {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'mine'
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-300">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-slate-900 border border-indigo-500/20 p-8 sm:p-12 mb-10 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-4">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>High-Velocity Live Polling Stack</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Create polls. <br />
            Gather votes in <span className="text-indigo-400">real time</span>.
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Powered by a Go Gin microservice, Redis atomic in-memory counters &amp; Pub/Sub WebSocket streaming, backed by persistent MongoDB storage.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onCreateClick}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 transition hover:scale-[1.02]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Launch a Live Poll</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              filter === 'all'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Live Polls
          </button>
          {user && (
            <button
              onClick={() => setFilter('mine')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                filter === 'mine'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Created By Me
            </button>
          )}
        </div>

        <input
          type="text"
          placeholder="Filter polls by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 w-full sm:w-64 transition"
        />
      </div>

      {/* Grid of Polls */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : filteredPolls.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto">
          <Radio className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No polls available</h3>
          <p className="text-xs text-slate-400 mb-5">
            {filter === 'mine'
              ? "You haven't launched any polls yet."
              : 'Be the first to launch an interactive live poll!'}
          </p>
          <button
            onClick={onCreateClick}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-600/30"
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
              className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-6 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-950/30 hover:-translate-y-0.5"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      poll.is_active
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
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

                  <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                    <Users className="w-3 h-3" />
                    {poll.total_votes} votes
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 mb-2">
                  {poll.title}
                </h3>

                {poll.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                    {poll.description}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-4">
                <span className="text-[11px] text-slate-500">
                  {poll.options.length} options
                </span>
                <span className="text-xs text-indigo-400 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Vote / View Live <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
