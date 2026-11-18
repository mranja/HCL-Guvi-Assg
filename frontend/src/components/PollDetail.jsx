import React, { useState, useEffect } from 'react';
import { apiRequest, createPollWebSocket, getVoterFingerprint } from '../services/api';
import confetti from 'canvas-confetti';
import {
  Share2,
  Check,
  Radio,
  Lock,
  Unlock,
  Users,
  Sparkles,
  BarChart2,
  PieChart as PieIcon,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Zap
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const ELEGANT_COLORS = [
  '#4f46e5', // Indigo
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#3b82f6', // Blue
  '#ef4444', // Red
];

export default function PollDetail({ pollId, currentUser, onBack }) {
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [userVotedOptionId, setUserVotedOptionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('bars');
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    const savedVote = localStorage.getItem(`voted_${pollId}`);
    if (savedVote) {
      setHasVoted(true);
      setUserVotedOptionId(savedVote);
    }
  }, [pollId]);

  useEffect(() => {
    let isMounted = true;
    const fetchPoll = async () => {
      try {
        setLoading(true);
        const data = await apiRequest(`/api/polls/${pollId}`);
        if (isMounted) setPoll(data);
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load poll');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPoll();
    return () => {
      isMounted = false;
    };
  }, [pollId]);

  useEffect(() => {
    if (!pollId) return;

    const socket = createPollWebSocket(
      pollId,
      (data) => {
        if (data.event === 'vote_cast') {
          setPoll((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              options: data.options,
              total_votes: data.total_votes,
            };
          });
        } else if (data.event === 'status_changed') {
          setPoll((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              is_active: data.is_active,
            };
          });
        }
      },
      (err) => {
        console.warn('Real-time connection error:', err);
      }
    );

    return () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close();
      }
    };
  }, [pollId]);

  const handleVote = async () => {
    if (!selectedOption || hasVoted || !poll?.is_active) return;
    setError('');
    setVoting(true);

    try {
      const voterFingerprint = getVoterFingerprint();
      const res = await apiRequest(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        body: JSON.stringify({
          option_id: selectedOption,
          voter_id: voterFingerprint,
        }),
      });

      setHasVoted(true);
      setUserVotedOptionId(selectedOption);
      localStorage.setItem(`voted_${pollId}`, selectedOption);

      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.75 },
        });
      } catch (e) {
        // no-op
      }

      if (res.options) {
        setPoll((prev) => ({
          ...prev,
          options: res.options,
          total_votes: res.total_votes,
        }));
      }
    } catch (err) {
      setError(err.message || 'Voting failed');
    } finally {
      setVoting(false);
    }
  };

  const handleCopyLink = () => {
    const shareableUrl = `${window.location.origin}?poll=${pollId}`;
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleStatus = async () => {
    if (!poll) return;
    setToggling(true);
    try {
      const res = await apiRequest(`/api/polls/${pollId}/toggle`, {
        method: 'PATCH',
      });
      setPoll((prev) => ({ ...prev, is_active: res.is_active }));
    } catch (err) {
      setError(err.message || 'Failed to toggle status');
    } finally {
      setToggling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
          Connecting to Redis Pub/Sub...
        </p>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="max-w-xl mx-auto my-14 p-10 bg-white border border-slate-200 rounded-3xl text-center shadow-lg">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900 mb-2">Poll Not Found</h3>
        <p className="text-xs text-slate-500 mb-6">{error}</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition"
        >
          Return to Polls
        </button>
      </div>
    );
  }

  const isCreator = currentUser && poll && poll.creator_id === currentUser.id;
  const chartData = (poll?.options || []).map((o) => ({
    name: o.text,
    votes: o.votes,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Navigation & Controls */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={onBack}
          className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Polls</span>
        </button>

        <div className="flex items-center gap-3">
          {isCreator && (
            <button
              onClick={handleToggleStatus}
              disabled={toggling}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition ${
                poll.is_active
                  ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                  : 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              {poll.is_active ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{poll.is_active ? 'Close Poll' : 'Reopen Poll'}</span>
            </button>
          )}

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied!' : 'Share Link'}</span>
          </button>
        </div>
      </div>

      {/* Main Poll Card */}
      <div className="bg-white border border-slate-200/90 rounded-[2.5rem] p-8 sm:p-12 shadow-xl shadow-slate-200/40 mb-8 relative overflow-hidden bg-dot-pattern">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              poll.is_active
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                poll.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>{poll.is_active ? 'LIVE & RECEIVING VOTES' : 'CLOSED'}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100/90 px-3 py-1 rounded-full border border-slate-200">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>{poll.total_votes} {poll.total_votes === 1 ? 'vote' : 'votes'} total</span>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            <Zap className="w-3.5 h-3.5 text-indigo-600" />
            <span>Redis Stream</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug mb-3">
          {poll.title}
        </h1>

        {poll.description && (
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
            {poll.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-slate-400 pt-4 border-t border-slate-100 font-medium">
          <span>Host: <strong className="text-slate-700 font-bold">{poll.creator_name || 'Anonymous'}</strong></span>
          <span>•</span>
          <span>Zero-latency WebSocket broadcast</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Voting or Live Results */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-[2rem] p-7 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>{hasVoted ? 'Real-time Live Results' : 'Choose an Option'}</span>
            </h2>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('bars')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'bars' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Progress Bars"
              >
                <BarChart2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'chart' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Chart Analytics"
              >
                <PieIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!hasVoted && poll.is_active ? (
            <div className="space-y-3">
              {poll.options.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setSelectedOption(opt.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedOption === opt.id
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-md shadow-indigo-100'
                      : 'border-slate-100 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                        selectedOption === opt.id
                          ? 'border-indigo-600 bg-indigo-600'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {selectedOption === opt.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-sm font-bold text-slate-800">
                      {opt.text}
                    </span>
                  </div>
                </div>
              ))}

              <button
                onClick={handleVote}
                disabled={!selectedOption || voting}
                className="w-full mt-5 py-4 px-6 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-slate-900/10 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {voting ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Submit Live Vote</span>
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {poll.options.map((opt, idx) => {
                const percentage =
                  poll.total_votes > 0
                    ? Math.round((opt.votes / poll.total_votes) * 100)
                    : 0;
                const isSelectedByUser = userVotedOptionId === opt.id;
                const color = ELEGANT_COLORS[idx % ELEGANT_COLORS.length];

                return (
                  <div
                    key={opt.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSelectedByUser
                        ? 'border-indigo-300 bg-indigo-50/40 shadow-sm'
                        : 'border-slate-100 bg-slate-50/60'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-800">
                          {opt.text}
                        </span>
                        {isSelectedByUser && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-600 text-white">
                            Your Choice
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-slate-900">
                          {percentage}%
                        </span>
                        <span className="text-xs text-slate-400 font-semibold ml-1.5">
                          ({opt.votes})
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200/70 rounded-full h-3 overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="pt-3 flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  WebSocket Stream Live
                </span>
                <span>Instant Redis Sync</span>
              </div>
            </div>
          )}
        </div>

        {/* Analytics Card */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-[2rem] p-7 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 mb-1">
              Live Breakdown
            </h3>
            <p className="text-xs text-slate-400 mb-6 font-medium">
              Real-time response distribution
            </p>

            {poll.total_votes === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <BarChart2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold uppercase tracking-wider">Awaiting audience votes...</p>
              </div>
            ) : viewMode === 'chart' ? (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="votes"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      innerRadius={40}
                      paddingAngle={3}
                    >
                      {chartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={ELEGANT_COLORS[index % ELEGANT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 10, right: 20, left: 20, bottom: 5 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={80}
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                    />
                    <Bar dataKey="votes" radius={[0, 6, 6, 0]}>
                      {chartData.map((_, index) => (
                        <Cell
                          key={`bar-${index}`}
                          fill={ELEGANT_COLORS[index % ELEGANT_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 space-y-1.5 font-medium">
            <div className="flex justify-between">
              <span>Streaming Engine:</span>
              <span className="text-slate-800 font-mono font-bold">Redis Pub/Sub</span>
            </div>
            <div className="flex justify-between">
              <span>Database Layer:</span>
              <span className="text-slate-800 font-mono font-bold">MongoDB Cluster</span>
            </div>
            <div className="flex justify-between">
              <span>Concurrency Check:</span>
              <span className="text-emerald-700 font-mono font-bold">Atomic Redis SAdd</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
