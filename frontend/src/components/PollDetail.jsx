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
  Clock,
  Sparkles,
  BarChart,
  PieChart as PieIcon,
  CheckCircle2,
  AlertCircle
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

const CHART_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Blue
  '#14b8a6', // Teal
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
  const [viewMode, setViewMode] = useState('bars'); // 'bars' or 'chart'
  const [toggling, setToggling] = useState(false);

  // Check if voter already cast vote for this specific poll in localStorage
  useEffect(() => {
    const savedVote = localStorage.getItem(`voted_${pollId}`);
    if (savedVote) {
      setHasVoted(true);
      setUserVotedOptionId(savedVote);
    }
  }, [pollId]);

  // Initial Poll Fetch
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

  // Real-time WebSocket Subscription via Go + Redis Pub/Sub
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

      // Trigger celebratory micro-confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      } catch (e) {
        // ignore
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
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Streaming poll from Redis...</p>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Poll Not Found</h3>
        <p className="text-sm text-slate-400 mb-6">{error}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-xl transition"
        >
          Return to All Polls
        </button>
      </div>
    );
  }

  const isCreator = currentUser && poll && poll.creator_id === currentUser.id;
  const chartData = (poll?.options || []).map((o) => ({
    name: o.text,
    votes: o.votes,
    percentage: poll.total_votes > 0 ? ((o.votes / poll.total_votes) * 100).toFixed(1) : 0,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in fade-in duration-300">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-sm text-slate-400 hover:text-white flex items-center gap-1.5 transition"
        >
          ← Back to Polls
        </button>

        <div className="flex items-center gap-2">
          {isCreator && (
            <button
              onClick={handleToggleStatus}
              disabled={toggling}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                poll.is_active
                  ? 'border-amber-500/40 text-amber-300 hover:bg-amber-500/10'
                  : 'border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10'
              }`}
            >
              {poll.is_active ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{poll.is_active ? 'Close Poll' : 'Reopen Poll'}</span>
            </button>
          )}

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 rounded-lg text-xs font-medium transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied!' : 'Share Live Link'}</span>
          </button>
        </div>
      </div>

      {/* Poll Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl mb-6 relative overflow-hidden">
        {/* Glowing badge */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              poll.is_active
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                poll.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span>{poll.is_active ? 'LIVE & ACCEPTING VOTES' : 'CLOSED'}</span>
          </div>

          <div className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/40">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>{poll.total_votes} {poll.total_votes === 1 ? 'vote' : 'votes'} cast</span>
          </div>

          <div className="inline-flex items-center gap-1 text-xs text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-full border border-slate-700/40">
            <Radio className="w-3.5 h-3.5 text-pink-400" />
            <span>Redis Realtime Engine</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
          {poll.title}
        </h1>

        {poll.description && (
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-4 max-w-2xl">
            {poll.description}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 border-t border-slate-800/60">
          <span>Created by: <span className="text-slate-300 font-medium">{poll.creator_name || 'Anonymous'}</span></span>
          <span>•</span>
          <span>Updated in real-time</span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Vote or Live Vote Bars */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>{hasVoted ? 'Live Results' : 'Cast Your Vote'}</span>
            </h2>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewMode('bars')}
                className={`p-1.5 rounded text-xs transition ${
                  viewMode === 'bars' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Progress Bars"
              >
                <BarChart className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`p-1.5 rounded text-xs transition ${
                  viewMode === 'chart' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Visual Chart"
              >
                <PieIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Voting Options */}
          {!hasVoted && poll.is_active ? (
            <div className="space-y-3">
              {poll.options.map((opt) => (
                <label
                  key={opt.id}
                  onClick={() => setSelectedOption(opt.id)}
                  className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedOption === opt.id
                      ? 'border-indigo-500 bg-indigo-500/10 ring-1 ring-indigo-500 shadow-md'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                        selectedOption === opt.id
                          ? 'border-indigo-500 bg-indigo-600'
                          : 'border-slate-700 bg-slate-900'
                      }`}
                    >
                      {selectedOption === opt.id && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-sm sm:text-base font-medium text-slate-200">
                      {opt.text}
                    </span>
                  </div>
                </label>
              ))}

              <button
                onClick={handleVote}
                disabled={!selectedOption || voting}
                className="w-full mt-4 py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] text-white font-semibold rounded-2xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {voting ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Submit Live Vote</span>
                    <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Live Dynamic Progress List */
            <div className="space-y-4">
              {poll.options.map((opt, idx) => {
                const percentage =
                  poll.total_votes > 0
                    ? Math.round((opt.votes / poll.total_votes) * 100)
                    : 0;
                const isSelectedByUser = userVotedOptionId === opt.id;
                const color = CHART_COLORS[idx % CHART_COLORS.length];

                return (
                  <div
                    key={opt.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSelectedByUser
                        ? 'border-indigo-500/60 bg-indigo-950/20'
                        : 'border-slate-800/90 bg-slate-950/40'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {opt.text}
                        </span>
                        {isSelectedByUser && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            Your Vote
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-white">
                          {percentage}%
                        </span>
                        <span className="text-xs text-slate-500 ml-1.5">
                          ({opt.votes})
                        </span>
                      </div>
                    </div>

                    {/* Progress track */}
                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
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

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Redis WebSocket Stream Connected
                </span>
                <span>Updates dynamically as votes arrive</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Interactive Charts & Metrics */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white mb-1">
              Visual Analytics
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Real-time distribution of audience responses
            </p>

            {poll.total_votes === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <BarChart className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Awaiting first live vote...</p>
              </div>
            ) : viewMode === 'chart' ? (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      dataKey="votes"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      paddingAngle={4}
                    >
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 w-full">
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
                      tick={{ fill: '#94a3b8', fontSize: 11 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                    />
                    <Bar dataKey="votes" radius={[0, 6, 6, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`bar-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Architecture callout footer */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-500 space-y-1.5">
            <div className="flex justify-between">
              <span>Sync Engine:</span>
              <span className="text-slate-300 font-mono">Redis Pub/Sub + Hashes</span>
            </div>
            <div className="flex justify-between">
              <span>Persistence:</span>
              <span className="text-slate-300 font-mono">MongoDB Replica/Cluster</span>
            </div>
            <div className="flex justify-between">
              <span>Double-vote defense:</span>
              <span className="text-emerald-400 font-mono">Redis SAdd Atomic Set</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
