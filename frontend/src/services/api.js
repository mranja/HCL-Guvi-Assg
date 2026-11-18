// Centralized API client helper for PulsePoll
const API_BASE = import.meta.env.VITE_API_URL || '';

export const getAuthToken = () => localStorage.getItem('pulsepoll_token');
export const setAuthToken = (token) => localStorage.setItem('pulsepoll_token', token);
export const removeAuthToken = () => {
  localStorage.removeItem('pulsepoll_token');
  localStorage.removeItem('pulsepoll_user');
};

export const getStoredUser = () => {
  const u = localStorage.getItem('pulsepoll_user');
  try {
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  localStorage.setItem('pulsepoll_user', JSON.stringify(user));
};

export async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP error: ${response.status}`);
  }

  return data;
}

// Generate or retrieve persistent anonymous voter UUID for double-voting defense
export function getVoterFingerprint() {
  let fid = localStorage.getItem('pulsepoll_voter_id');
  if (!fid) {
    fid = 'voter_' + Math.random().toString(36).substring(2, 12) + '_' + Date.now();
    localStorage.setItem('pulsepoll_voter_id', fid);
  }
  return fid;
}

// WebSocket connection creator
export function createPollWebSocket(pollId, onMessage, onError) {
  let wsUrl;
  if (API_BASE.startsWith('http')) {
    wsUrl = API_BASE.replace(/^http/, 'ws') + `/ws/${pollId}`;
  } else {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    wsUrl = `${protocol}//${window.location.host}/ws/${pollId}`;
  }

  const socket = new WebSocket(wsUrl);

  socket.onopen = () => {
    console.log(`[WebSocket] Connected to poll ${pollId}`);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (err) {
      console.warn('Failed parsing ws payload', err);
    }
  };

  socket.onerror = (err) => {
    console.error('[WebSocket Error]', err);
    if (onError) onError(err);
  };

  return socket;
}
