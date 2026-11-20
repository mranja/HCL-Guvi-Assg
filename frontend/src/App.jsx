import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import HowItWorks from './components/HowItWorks';
import PollList from './components/PollList';
import PollDetail from './components/PollDetail';
import CreatePollModal from './components/CreatePollModal';
import AuthModal from './components/AuthModal';
import { getStoredUser, removeAuthToken, apiRequest } from './services/api';

export default function App() {
  const [user, setUser] = useState(getStoredUser());
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'how-it-works', 'dashboard', 'detail'
  const [activePollId, setActivePollId] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const me = await apiRequest('/api/auth/me');
        setUser(me);
      } catch (err) {
        setUser(null);
        removeAuthToken();
      }
    };
    if (localStorage.getItem('pulsepoll_token')) {
      checkAuth();
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pollParam = params.get('poll');
    if (pollParam) {
      setActivePollId(pollParam);
      setCurrentPage('detail');
    }
  }, []);

  const handleNavigate = (page) => {
    if (page === 'landing') {
      setActivePollId(null);
      window.history.pushState({}, '', window.location.pathname);
      setCurrentPage('landing');
    } else if (page === 'dashboard') {
      setActivePollId(null);
      setCurrentPage('dashboard');
    } else if (page === 'how-it-works') {
      setActivePollId(null);
      setCurrentPage('how-it-works');
    } else if (page === 'create') {
      if (!user) {
        setShowAuthModal(true);
      } else {
        setShowCreateModal(true);
      }
    } else if (page === 'auth') {
      setShowAuthModal(true);
    }
  };

  const handleSelectPoll = (pollId) => {
    setActivePollId(pollId);
    window.history.pushState({}, '', `?poll=${pollId}`);
    setCurrentPage('detail');
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbfd] text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      <Navbar
        user={user}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {currentPage === 'landing' && (
          <LandingPage
            user={user}
            onExplore={() => handleNavigate('dashboard')}
            onCreate={() => handleNavigate('create')}
          />
        )}

        {currentPage === 'how-it-works' && (
          <HowItWorks
            onGetStarted={() => handleNavigate('dashboard')}
            onCreatePoll={() => handleNavigate('create')}
          />
        )}

        {currentPage === 'dashboard' && (
          <PollList
            user={user}
            onSelectPoll={handleSelectPoll}
            onCreateClick={() => handleNavigate('create')}
          />
        )}

        {currentPage === 'detail' && activePollId && (
          <PollDetail
            pollId={activePollId}
            currentUser={user}
            onBack={() => handleNavigate('dashboard')}
          />
        )}
      </main>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          onAuthSuccess={(u) => {
            setUser(u);
            setShowAuthModal(false);
          }}
          onCancel={() => setShowAuthModal(false)}
        />
      )}

      {showCreateModal && (
        <CreatePollModal
          onPollCreated={(newPoll) => {
            setShowCreateModal(false);
            handleSelectPoll(newPoll.id);
          }}
          onCancel={() => setShowCreateModal(false)}
        />
      )}

      {/* Clean, Elegant Footer without tech clutter */}
      <footer className="border-t border-slate-200/80 bg-white py-12 text-xs text-slate-500 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="PulsePoll" className="w-7 h-7 rounded-lg" />
            <span className="font-mono font-bold tracking-tight text-slate-900 uppercase">
              Pulse<span className="text-indigo-600">Poll</span>
            </span>
            <span className="text-slate-300">•</span>
            <span>Real-time audience interaction and live polling</span>
          </div>

          <div className="flex items-center gap-6 font-semibold text-slate-600">
            <button
              onClick={() => handleNavigate('landing')}
              className="hover:text-slate-900 transition"
            >
              Overview
            </button>
            <button
              onClick={() => handleNavigate('how-it-works')}
              className="hover:text-slate-900 transition"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavigate('dashboard')}
              className="hover:text-slate-900 transition"
            >
              Live Polls
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
