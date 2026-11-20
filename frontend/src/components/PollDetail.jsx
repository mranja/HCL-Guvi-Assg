import React, { useState, useEffect } from 'react';
import { apiRequest, createPollWebSocket, getVoterFingerprint } from '../services/api';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import {
  Share2,
  Check,
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

const WARM_PALETTE = [
  '#c84b31', // Terracotta Rust
  '#1b4332', // Deep Forest Green
  '#d97706', // Warm Amber
  '#2d6a4f', // Forest Light
  '#e07a5f', // Coral Earth
  '#78350f', // Warm Brown
  '#52b788', // Sage Emerald
  '#991b1b', // Deep Crimson
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
          colors: ['#c84b31', '#1b4332', '#d97706', '#52b788'],
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
        <div className="w-8 h-8 border-2 border-[#c84b31] border-t-transparent rounded-full animate-spin" />
        <p className="text-stone-500 text-xs font-mono uppercase tracking-wider">
          Connecting to live session...
        </p>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="max-w-xl mx-auto my-14 p-10 bg-white border border-stone-200 rounded-3xl text-center shadow-sm">
        <AlertCircle className="w-12 h-12 text-[#c84b31] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-stone-900 mb-2 font-editorial">Poll Not Found</h3>
        <p className="text-xs text-stone-500 mb-6">{error}</p>
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition"
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
    <div className={`max-w-5xl mx-auto px-4 py-8 animate-in fade-in duration-300 ${isPresenterMode ? 'fixed inset-0 z-50 bg-[#faf9f6] max-w-none p-8 overflow-y-auto' : ''}`}>
      
      {/* Top Header Controls */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={isPresenterMode ? () => setIsPresenterMode(false) : onBack}
          className="text-xs font-bold uppercase tracking-wider text-stone-600 hover:text-stone-900 flex items-center gap-1.5 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isPresenterMode ? 'Exit Stage View' : 'Back to Polls'}</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Presenter Mode Button */}
          <button
            onClick={() => setIsPresenterMode(!isPresenterMode)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition ${
              isPresenterMode
                ? 'bg-[#1b4332] text-white border-[#1b4332]'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50 shadow-sm'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>{isPresenterMode ? 'Projecting Live' : 'Presenter View'}</span>
          </button>

          {/* QR Code trigger */}
          <button
            onClick={() => setShowQRModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm"
            title="Show QR Code"
          >
            <QrCode className="w-3.5 h-3.5 text-[#c84b31]" />
            <span>QR</span>
          </button>

          {isCreator && (
            <button
              onClick={handleToggleStatus}
              disabled={toggling}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition ${
                poll.is_active
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800'
              }`}
            >
              {poll.is_active ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              <span>{poll.is_active ? 'Close Poll' : 'Reopen Poll'}</span>
            </button>
          )}

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#c84b31] hover:bg-[#b03e26] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Share Link'}</span>
          </button>
        </div>
      </div>

      {/* Main Poll Card in Editorial Ivory & White */}
      <div className="bg-white border border-stone-200 rounded-[2.5rem] p-8 sm:p-12 shadow-sm mb-8 relative">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
              poll.is_active
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-stone-100 text-stone-500 border border-stone-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                poll.is_active ? 'bg-emerald-600 animate-pulse' : 'bg-stone-400'
              }`}
            />
            <span>{poll.is_active ? 'LIVE & RECEIVING VOTES' : 'CLOSED'}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1 rounded-full">
            <Users className="w-3.5 h-3.5 text-[#1b4332]" />
            <span>{poll.total_votes} {poll.total_votes === 1 ? 'vote' : 'votes'} total</span>
          </div>

          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c84b31] bg-[#fcedea] px-3 py-1 rounded-full border border-[#f5d0c8]">
            <Zap className="w-3.5 h-3.5 text-[#c84b31]" />
            <span>Live Sync</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-5xl font-normal text-[#1c1917] tracking-tight leading-snug mb-4 font-editorial">
          {poll.title}
        </h1>

        {poll.description && (
          <p className="text-stone-600 text-base sm:text-lg leading-relaxed mb-6 max-w-2xl">
            {poll.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-stone-400 pt-4 border-t border-stone-100 font-mono">
          <span>Author: <strong className="text-stone-700 font-bold">{poll.creator_name || 'Anonymous'}</strong></span>
          <span>•</span>
          <span>Room PIN: <span className="text-[#c84b31] font-bold">{poll.id}</span></span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-700 text-xs font-semibold">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Interactive Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Voting or Live Progress Bars */}
        <div className="lg:col-span-7 bg-white border border-stone-200 rounded-[2rem] p-7 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2 font-editorial">
              <Sparkles className="w-4 h-4 text-[#c84b31]" />
              <span>{hasVoted ? 'Audience Consensus' : 'Choose an Option'}</span>
            </h2>

            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('bars')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'bars' ? 'bg-white shadow-sm text-stone-900 font-bold' : 'text-stone-400 hover:text-stone-700'
                }`}
                title="Progress Bars"
              >
                <BarChart2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('chart')}
                className={`p-1.5 rounded-lg text-xs transition ${
                  viewMode === 'chart' ? 'bg-white shadow-sm text-stone-900 font-bold' : 'text-stone-400 hover:text-stone-700'
                }`}
                title="Analytics Chart"
              >
                <PieIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!hasVoted && poll.is_active ? (
            /* Voting Interface with Thumb-Friendly Hit Targets */
            <div className="space-y-3">
              {poll.options.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setSelectedOption(opt.id)}
                  className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedOption === opt.id
                      ? 'border-[#c84b31] bg-[#fcedea]/60 shadow-sm'
                      : 'border-stone-100 bg-[#faf9f6] hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                        selectedOption === opt.id
                          ? 'border-[#c84b31] bg-[#c84b31]'
                          : 'border-stone-300 bg-white'
                      }`}
                    >
                      {selectedOption === opt.id && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-sm sm:text-base font-bold text-stone-800">
                      {opt.text}
                    </span>
                  </div>
                </div>
              ))}

              <button
                onClick={handleVote}
                disabled={!selectedOption || voting}
                className="w-full mt-6 py-4 px-6 bg-[#c84b31] hover:bg-[#b03e26] active:scale-[0.99] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {voting ? (
                  <span className="inline-block w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Submit Live Vote</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Progress Bars in Forest & Terracotta */
            <div className="space-y-4">
              {poll.options.map((opt, idx) => {
                const percentage =
                  poll.total_votes > 0
                    ? Math.round((opt.votes / poll.total_votes) * 100)
                    : 0;
                const isSelectedByUser = userVotedOptionId === opt.id;
                const color = WARM_PALETTE[idx % WARM_PALETTE.length];

                return (
                  <div
                    key={opt.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSelectedByUser
                        ? 'border-[#c84b31]/40 bg-[#fcedea]/40'
                        : 'border-stone-100 bg-[#faf9f6]'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-stone-800">
                          {opt.text}
                        </span>
                        {isSelectedByUser && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#c84b31] text-white">
                            Your Vote
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black font-mono text-stone-900">
                          {percentage}%
                        </span>
                        <span className="text-xs text-stone-400 font-mono ml-1.5">
                          ({opt.votes})
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-stone-200/80 rounded-full h-3 overflow-hidden p-0.5">
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

              <div className="pt-3 flex items-center justify-between text-xs text-stone-400 font-mono">
                <span className="flex items-center gap-1.5 text-[#1b4332] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#1b4332] animate-ping" />
                  Live Sync Active
                </span>
                <span>Instant response updates</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Visualization Breakdown & QR Card */}
        <div className="lg:col-span-5 bg-white border border-stone-200 rounded-[2rem] p-7 sm:p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-1 font-editorial">
              Response Breakdown
            </h3>
            <p className="text-xs text-stone-500 mb-6 font-mono">
              Live audience telemetry
            </p>

            {poll.total_votes === 0 ? (
              <div className="py-16 text-center text-stone-400">
                <BarChart2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-mono uppercase tracking-wider">Awaiting first response...</p>
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
                          fill={WARM_PALETTE[index % WARM_PALETTE.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e7e5e4',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#1c1917',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
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
                      tick={{ fill: '#78716c', fontSize: 11, fontWeight: 600 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e7e5e4',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#1c1917',
                      }}
                    />
                    <Bar dataKey="votes" radius={[0, 6, 6, 0]}>
                      {chartData.map((_, index) => (
                        <Cell
                          key={`bar-${index}`}
                          fill={WARM_PALETTE[index % WARM_PALETTE.length]}
                        />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-stone-100 text-[11px] text-stone-500 space-y-1.5 font-mono">
            <div className="flex justify-between">
              <span>Sync Engine:</span>
              <span className="text-[#1b4332] font-bold">Redis In-Memory</span>
            </div>
            <div className="flex justify-between">
              <span>Database Layer:</span>
              <span className="text-stone-800 font-bold">MongoDB Atlas</span>
            </div>
            <div className="flex justify-between">
              <span>Spam Protection:</span>
              <span className="text-[#c84b31] font-bold">Client Fingerprint Set</span>
            </div>
          </div>
        </div>

      </div>

      {/* QR Code Presentation Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white border border-stone-200 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl relative">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-5 right-5 text-stone-400 hover:text-stone-800"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-stone-900 mb-1 font-editorial">Scan to Join Poll</h3>
            <p className="text-xs text-stone-500 mb-6 font-mono">No apps or registration needed</p>
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl inline-block mb-4 shadow-sm">
              <QRCodeSVG value={shareableUrl} size={180} fgColor="#1c1917" />
            </div>
            <p className="text-xs font-mono text-[#c84b31] break-all">{shareableUrl}</p>
          </div>
        </div>
      )}

    </div>
  );
}
