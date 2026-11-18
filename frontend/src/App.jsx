import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import PollList from './components/PollList';
import PollDetail from './components/PollDetail';
import CreatePollModal from './components/CreatePollModal';
import AuthModal from './components/AuthModal';
import { getStoredUser, removeAuthToken, apiRequest } from './services/api';

export default function App() {
  const [user, setUser] = useState(getStoredUser());
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'detail'
  const [activePollId, setActivePollId] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Sync logged in status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const me = await apiRequest('/api/auth/me');
        setUser(me);
      } catch (err) {
        // Token expired or invalid
        setUser(null);
        removeAuthToken();
      }
    };
    if (localStorage.getItem('pulsepoll_token')) {
      checkAuth();
    }
  }, []);

  // Listen for query parameter ?poll=<id> on load for shareable links
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
      // clean url query
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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
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

      {/* Modern Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 PulsePoll — Live Real-Time Polling Engine</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> React
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Go Gin
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" /> Redis
            </span>
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> MongoDB
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
