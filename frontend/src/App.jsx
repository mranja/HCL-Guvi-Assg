import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PollList from './components/PollList';
import PollDetail from './components/PollDetail';
import CreatePollModal from './components/CreatePollModal';
import AuthModal from './components/AuthModal';
import { getStoredUser, removeAuthToken, apiRequest } from './services/api';

export default function App() {
  const [user, setUser] = useState(getStoredUser());
  const [currentPage, setCurrentPage] = useState('home');
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
    if (page === 'home') {
      setActivePollId(null);
      window.history.pushState({}, '', window.location.pathname);
      setCurrentPage('home');
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
    <div className="min-h-screen flex flex-col bg-[#fafafc] text-slate-900 font-sans selection:bg-indigo-600 selection:text-white">
      <Navbar
        user={user}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        {currentPage === 'detail' && activePollId ? (
          <PollDetail
            pollId={activePollId}
            currentUser={user}
            onBack={() => handleNavigate('home')}
          />
        ) : (
          <PollList
            user={user}
            onSelectPoll={handleSelectPoll}
            onCreateClick={() => handleNavigate('create')}
          />
        )}
      </main>

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

      {/* Elegant Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-10 text-xs text-slate-500 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold tracking-tight text-slate-900 uppercase">
              PulsePoll
            </span>
            <span>— Zero-latency live audience polling</span>
          </div>

          <div className="flex items-center gap-5 font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-600" /> React 18
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-900" /> Go Gin
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> Redis Engine
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" /> MongoDB
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
