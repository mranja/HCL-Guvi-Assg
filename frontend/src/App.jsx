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
  // If user is authenticated, default to dashboard. If not logged in, enforce landing page only.
  const [currentPage, setCurrentPage] = useState(getStoredUser() ? 'dashboard' : 'landing');
  const [activePollId, setActivePollId] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const me = await apiRequest('/api/auth/me');
        setUser(me);
        setCurrentPage((prev) => (prev === 'landing' ? 'dashboard' : prev));
      } catch (err) {
        setUser(null);
        removeAuthToken();
        setCurrentPage('landing');
      }
    };
    if (localStorage.getItem('pulsepoll_token')) {
      checkAuth();
    } else {
      // Without login, strictly enforce landing page
      setCurrentPage('landing');
      setActivePollId(null);
    }
  }, []);

  // Check URL parameters: if direct ?poll=link is opened, allow audience voting if desired, or require login
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pollParam = params.get('poll');
    if (pollParam) {
      setActivePollId(pollParam);
      setCurrentPage('detail');
    }
  }, []);

  const handleNavigate = (page) => {
    // STRICT AUTH GATE: Unauthenticated users CANNOT visit any page other than landing (or detail if responding via direct link)
    if (!user) {
      if (page === 'auth') {
        setShowAuthModal(true);
        return;
      }
      // Any attempt to navigate to dashboard, create, or internal pages triggers the login modal
      setShowAuthModal(true);
      return;
    }

    // Authenticated users
    if (page === 'landing') {
      page = 'dashboard';
    }

    if (page === 'dashboard') {
      setActivePollId(null);
      window.history.pushState({}, '', window.location.pathname);
      setCurrentPage('dashboard');
    } else if (page === 'how-it-works') {
      setActivePollId(null);
      setCurrentPage('how-it-works');
    } else if (page === 'create') {
      setShowCreateModal(true);
    }
  };

  const handleSelectPoll = (pollId) => {
    // If not logged in and not responding via a direct poll share, prompt login
    if (!user && !pollId) {
      setShowAuthModal(true);
      return;
    }
    setActivePollId(pollId);
    window.history.pushState({}, '', `?poll=${pollId}`);
    setCurrentPage('detail');
  };

  const handleJoinByCode = (code) => {
    if (code) {
      handleSelectPoll(code);
    }
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    setActivePollId(null);
    window.history.pushState({}, '', window.location.pathname);
    setCurrentPage('landing');
  };

  const handleAuthSuccess = (u) => {
    setUser(u);
    setShowAuthModal(false);
    // Upon login, transition directly from landing to dashboard
    setCurrentPage('dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#faf9f6] text-[#1c1917] font-sans selection:bg-[#c84b31] selection:text-white">
      <Navbar
        user={user}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        onJoinCode={handleJoinByCode}
      />

      <main className="flex-1">
        {/* Strictly show LandingPage when user is not logged in */}
        {!user && currentPage !== 'detail' && (
          <LandingPage
            user={user}
            onExplore={() => setShowAuthModal(true)}
            onCreate={() => setShowAuthModal(true)}
            onJoinCode={handleJoinByCode}
          />
        )}

        {/* Protected Dashboard Page (Only visible when user is logged in) */}
        {user && currentPage === 'dashboard' && (
          <PollList
            user={user}
            onSelectPoll={handleSelectPoll}
            onCreateClick={() => handleNavigate('create')}
          />
        )}

        {/* Protected How It Works Page (Only visible when user is logged in) */}
        {user && currentPage === 'how-it-works' && (
          <HowItWorks
            onGetStarted={() => handleNavigate('dashboard')}
            onCreatePoll={() => handleNavigate('create')}
          />
        )}

        {/* Poll Detail View */}
        {currentPage === 'detail' && activePollId && (
          <PollDetail
            pollId={activePollId}
            currentUser={user}
            onBack={() => handleNavigate(user ? 'dashboard' : 'landing')}
          />
        )}
      </main>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          onAuthSuccess={handleAuthSuccess}
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

      {/* Editorial Footer */}
      <footer className="border-t border-stone-200 bg-white py-12 text-xs text-stone-500 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="PulsePoll" className="w-7 h-7 rounded-xl" />
            <span className="font-editorial font-bold tracking-tight text-stone-900 text-sm">
              Pulse<span className="text-[#c84b31]">Poll</span>
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-500">Live audience polling &amp; consensus engine</span>
          </div>

          <div className="flex items-center gap-6 font-semibold text-stone-600">
            {user ? (
              <>
                <button
                  onClick={() => handleNavigate('dashboard')}
                  className="hover:text-stone-900 transition"
                >
                  Polls Dashboard
                </button>
                <button
                  onClick={() => handleNavigate('how-it-works')}
                  className="hover:text-stone-900 transition"
                >
                  How it works
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-[#c84b31] font-bold hover:underline"
              >
                Sign In to Host
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
