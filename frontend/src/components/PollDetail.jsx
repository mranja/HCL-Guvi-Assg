import React, { useState, useEffect } from 'react';
import { apiRequest, createPollWebSocket, getVoterFingerprint } from '../services/api';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
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
  Zap,
  Maximize2,
  Minimize2,
  QrCode,
  Tv
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

const NEON_PALETTE = [
  '#06b6d4', // Neon Cyan
  '#8b5cf6', // Electric Violet
  '#ec4899', // Hot Pink
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#3b82f6', // Vivid Blue
  '#14b8a6', // Teal
  '#f43f5e', // Rose
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
  const [isPresenterMode, setIsPresenterMode] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

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
          particleCount: 70,
          spread: 80,
          origin: { y: 0.75 },
          colors: ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981'],
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

  const shareableUrl = `${window.location.origin}?poll=${pollId}`;

  const handleCopyLink = () => {
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
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-xs font-mono uppercase tracking-wider">
          Connecting to Redis Pub/Sub...
        </p>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="max-w-xl mx-auto my-14 p-10 bg-slate-900 border border-white/10 rounded-3xl text-center shadow-2xl">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">Poll Not Found</h3>
        <p className="text-xs text-slate-400 mb-6">{error}</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition"
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
    <div className={`max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-300 ${isPresenterMode ? 'fixed inset-0 z-50 bg-[#0b0f19] max-w-none p-8 overflow-y-auto' : ''}`}>
      
      {/* Top Header Controls */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={isPresenterMode ? () => setIsPresenterMode(false) : onBack}
          className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isPresenterMode ? 'Exit Presenter Mode' : 'Back to Dashboard'}</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Presenter Mode Button (LivePoll Feature) */}
          <button
            onClick={() => setIsPresenterMode(!isPresenterMode)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition ${
              isPresenterMode
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40 shadow-lg shadow-cyan-500/10'
                : 'bg-slate-900/90 text-slate-300 border-white/10 hover:border-white/20'
            }`}
          >
            <Tv className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isPresenterMode ? 'Projecting' : 'Presenter View'}</span>
          </button>

          {/* QR Code trigger */}
          <button
            onClick={() => setShowQRModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider transition"
            title="Show QR Code"
          >
            <QrCode className="w-3.5 h-3.5 text-violet-400" />
            <span>QR</span>
          </button>

          {isCreator && (
            <button
              onClick={handleToggleStatus}
              disabled={toggling}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition ${
                poll.is_active
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                  : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
              }`}
            >
              {poll.is_active ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{poll.is_active ? 'Close Poll' : 'Reopen Poll'}</span>
            </button>
          )}

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-wider transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Share Link'}</span>
          </button>
        </div>
      </div>

      {/* Main Poll Screen Card */}
      <div className="bg-gradient-to-b from-[#111827] to-[#0f172a] border border-white/10 rounded-[2.5rem] p-8 sm:p-12 shadow-2xl mb-8 relative overflow-hidden cyber-grid glow-cyan">
        
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              poll.is_active
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                poll.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
              }`}
            />
            <span>{poll.is_active ? 'LIVE & RECEIVING VOTES' : 'CLOSED'}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-slate-800/80 px-3 py-1 rounded-full border border-white/10">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>{poll.total_votes} {poll.total_votes === 1 ? 'vote' : 'votes'} total</span>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-300 bg-violet-950/50 px-3 py-1 rounded-full border border-violet-500/30">
            <Zap className="w-3.5 h-3.5 text-violet-400" />
            <span>Sub-Second Redis Stream</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-snug mb-3">
          {poll.title}
        </h1>

        {poll.description && (
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6 max-w-2xl">
            {poll.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-slate-500 pt-4 border-t border-white/5 font-mono">
          <span>Author: <strong className="text-slate-300 font-bold">{poll.creator_name || 'Anonymous'}</strong></span>
          <span>•</span>
          <span>Room Code: <span className="text-cyan-400 font-bold">{poll.id}</span></span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-400 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Interactive Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Voting or Live Progress Bars */}
        <div className="lg:col-span-7 bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-7 sm:p-8 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{hasVoted ? 'Audience Consensus' : 'Choose an Option'}</span>
            </h2>

            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setViewMode('bars')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'bars' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Progress Bars"
              >
                <BarChart2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'chart' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
                title="Analytics Chart"
              >
                <PieIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!hasVoted && poll.is_active ? (
            /* Voting Interface with Thumb-Friendly Hit Targets (livepoll.io) */
            <div className="space-y-3">
              {poll.options.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setSelectedOption(opt.id)}
                  className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedOption === opt.id
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-lg shadow-cyan-500/10'
                      : 'border-white/5 bg-slate-900/60 hover:border-white/20 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                        selectedOption === opt.id
                          ? 'border-cyan-400 bg-cyan-500'
                          : 'border-slate-700 bg-slate-950'
                      }`}
                    >
                      {selectedOption === opt.id && (
                        <div className="w-2 h-2 rounded-full bg-slate-950" />
                      )}
                    </div>
                    <span className="text-sm sm:text-base font-bold text-slate-200">
                      {opt.text}
                    </span>
                  </div>
                </div>
              ))}

              <button
                onClick={handleVote}
                disabled={!selectedOption || voting}
                className="w-full mt-6 py-4 px-6 bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 hover:opacity-90 active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-cyan-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {voting ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Submit Live Vote</span>
                    <CheckCircle2 className="w-4 h-4 text-cyan-200" />
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Animated Progress Bars with Neon Color Coding */
            <div className="space-y-4">
              {poll.options.map((opt, idx) => {
                const percentage =
                  poll.total_votes > 0
                    ? Math.round((opt.votes / poll.total_votes) * 100)
                    : 0;
                const isSelectedByUser = userVotedOptionId === opt.id;
                const color = NEON_PALETTE[idx % NEON_PALETTE.length];

                return (
                  <div
                    key={opt.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSelectedByUser
                        ? 'border-cyan-500/60 bg-cyan-950/30'
                        : 'border-white/5 bg-slate-900/60'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          {opt.text}
                        </span>
                        {isSelectedByUser && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            Your Vote
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black font-mono text-cyan-400">
                          {percentage}%
                        </span>
                        <span className="text-xs text-slate-500 font-mono ml-1.5">
                          ({opt.votes})
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out shadow-sm"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="pt-3 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  WebSocket Stream Live
                </span>
                <span>Instant Redis Sync</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Recharts Visualization & QR Code Card */}
        <div className="lg:col-span-5 bg-[#111827]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-7 sm:p-8 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-1">
              Live Breakdown
            </h3>
            <p className="text-xs text-slate-400 mb-6 font-mono">
              Real-time response distribution
            </p>

            {poll.total_votes === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <BarChart2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-mono uppercase tracking-wider">Awaiting audience votes...</p>
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
                          fill={NEON_PALETTE[index % NEON_PALETTE.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0b0f19',
                        borderColor: '#1f2937',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#f8fafc',
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
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0b0f19',
                        borderColor: '#1f2937',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                    />
                    <Bar dataKey="votes" radius={[0, 6, 6, 0]}>
                      {chartData.map((_, index) => (
                        <Cell
                          key={`bar-${index}`}
                          fill={NEON_PALETTE[index % NEON_PALETTE.length]}
                        />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 text-[11px] text-slate-400 space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span>Streaming Engine:</span>
              <span className="text-cyan-400 font-bold">Redis Pub/Sub</span>
            </div>
            <div className="flex justify-between">
              <span>Persistence Layer:</span>
              <span className="text-violet-400 font-bold">MongoDB Atlas</span>
            </div>
            <div className="flex justify-between">
              <span>Anti-Duplication:</span>
              <span className="text-emerald-400 font-bold">Atomic Redis SAdd</span>
            </div>
          </div>
        </div>

      </div>

      {/* QR Code Presentation Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#111827] border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Scan to Join Poll</h3>
            <p className="text-xs text-slate-400 mb-6 font-mono">No apps or registration needed</p>
            <div className="p-4 bg-white rounded-2xl inline-block mb-4 shadow-xl">
              <QRCodeSVG value={shareableUrl} size={180} fgColor="#0b0f19" />
            </div>
            <p className="text-xs font-mono text-cyan-400 break-all">{shareableUrl}</p>
          </div>
        </div>
      )}

    </div>
  );
}
