import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import {
  Users,
  ChevronRight,
  Plus,
  Sparkles,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in duration-300">
      
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-stone-200">
        <div>
          <h1 className="text-3xl font-normal text-stone-900 tracking-tight font-editorial">
            Active Polls
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Real-time interactive audience rooms
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-1 rounded-2xl border border-stone-200 shadow-sm">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                filter === 'all'
                  ? 'bg-[#1b4332] text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Sessions
            </button>
            {user && (
              <button
                onClick={() => setFilter('mine')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                  filter === 'mine'
                    ? 'bg-[#1b4332] text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                My Polls
              </button>
            )}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Filter polls..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 text-xs focus:outline-none focus:border-[#c84b31] transition w-48 sm:w-60 shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Grid of Polls */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 rounded-3xl bg-white border border-stone-200 animate-pulse"
            />
          ))}
        </div>
      ) : filteredPolls.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center max-w-md mx-auto shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-[#fcedea] text-[#c84b31] flex items-center justify-center mx-auto mb-4">
            <Radio className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-1 font-editorial">No polls available</h3>
          <p className="text-xs text-stone-500 mb-6">
            {filter === 'mine'
              ? "You haven't launched any live polls yet."
              : 'Be the first to host an interactive session!'}
          </p>
          <button
            onClick={onCreateClick}
            className="px-5 py-2.5 bg-[#c84b31] hover:bg-[#b03e26] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-sm"
          >
            Create Session
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPolls.map((poll) => (
            <div
              key={poll.id}
              onClick={() => onSelectPoll(poll.id)}
              className="group bg-white hover:bg-white border border-stone-200 hover:border-[#c84b31] rounded-3xl p-7 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-1"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      poll.is_active
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        poll.is_active ? 'bg-emerald-600 animate-pulse' : 'bg-stone-400'
                      }`}
                    />
                    {poll.is_active ? 'LIVE' : 'CLOSED'}
                  </span>

                  <span className="text-xs font-mono font-bold text-stone-500 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#1b4332]" />
                    {poll.total_votes} votes
                  </span>
                </div>

                <h3 className="text-lg font-bold text-stone-900 group-hover:text-[#c84b31] transition-colors line-clamp-2 mb-2 leading-snug font-editorial">
                  {poll.title}
                </h3>

                {poll.description && (
                  <p className="text-xs text-stone-500 line-clamp-2 mb-5">
                    {poll.description}
                  </p>
                )}
              </div>

              <div className="pt-5 border-t border-stone-100 flex items-center justify-between mt-4">
                <span className="text-xs font-mono text-stone-400">
                  {poll.options.length} Options
                </span>
                <span className="text-xs font-bold text-[#c84b31] flex items-center gap-1 group-hover:translate-x-1 transition-transform uppercase tracking-wider">
                  Open Room <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
