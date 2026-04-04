import { useState } from 'react';
import { useFetch } from './hooks/useFetch';
import WeeklySummary from './components/WeeklySummary';
import Sprout from './components/Sprout';
import RecommendationList from './components/RecommendationList';

const USER_ID = 1;
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

function getCurrentWeekDates() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  const format = (date) => date.toISOString().split('T')[0];
  return { start: format(monday), end: format(sunday) };
}

function calculateEndDate(startDateStr) {
  const date = new Date(startDateStr);
  date.setDate(date.getDate() + 6);
  return date.toISOString().split('T')[0];
}

function App() {
  const [activeNav, setActiveNav] = useState('home');
  const [useCustomDates, setUseCustomDates] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('2025-01-01');
  const [acceptedCarpoolId, setAcceptedCarpoolId] = useState(null);
  const [acceptedTransitId, setAcceptedTransitId] = useState(null);

  let WEEK_START, WEEK_END;
  if (useCustomDates && customStartDate) {
    WEEK_START = customStartDate;
    WEEK_END = calculateEndDate(customStartDate);
  } else {
    const current = getCurrentWeekDates();
    WEEK_START = current.start;
    WEEK_END = current.end;
  }

  const { data: summary, loading: summaryLoading, error: summaryError } = useFetch(
    `${API_BASE}/users/${USER_ID}/weekly-summary?week_start=${WEEK_START}&week_end=${WEEK_END}`
  );
  const { data: recommendations, loading: recsLoading, error: recsError } = useFetch(
    `${API_BASE}/users/${USER_ID}/recommendations`
  );
  const { data: sprout, loading: sproutLoading, error: sproutError } = useFetch(
    `${API_BASE}/users/${USER_ID}/sprout`
  );
  const { data: friends, loading: friendsLoading, error: friendsError } = useFetch(
    `${API_BASE}/users/${USER_ID}/friends`
  );

  const handleAcceptCarpool = (recId) => {
    setAcceptedCarpoolId(acceptedCarpoolId === recId ? null : recId);
  };

  const handleAcceptTransit = (recId) => {
    setAcceptedTransitId(acceptedTransitId === recId ? null : recId);
  };

  if (summaryLoading || recsLoading || sproutLoading) {
    return <div className="flex items-center justify-center h-screen text-earth">Loading your mobility data...</div>;
  }
  if (summaryError || recsError || sproutError) {
    return <div className="flex items-center justify-center h-screen text-rust">Error loading data. Please try again later.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Phone container */}
      <div className="w-full max-w-sm bg-charcoal rounded-3xl shadow-2xl overflow-hidden border border-gray-800">
        {/* Phone "bezel" */}
        <div className="bg-charcoal px-3 pt-2 pb-0">
          {/* Notch */}
          <div className="flex justify-center mb-2">
            <div className="w-32 h-6 bg-charcoal rounded-b-2xl border-t border-x border-gray-700"></div>
          </div>
          
          {/* Status bar */}
          <div className="flex justify-between items-center px-6 py-3 text-cream text-xs font-medium">
            <span>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })}</span>
            <span>●●●●●</span>
          </div>
        </div>

        {/* Screen content */}
        <div className="bg-cream flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-earth text-cream pt-4 pb-8 px-6 rounded-b-3xl relative overflow-hidden flex-shrink-0">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-lime opacity-10"></div>
            <p className="text-xs font-semibold tracking-widest text-lime opacity-80 mb-2 relative z-10">
              Week of {WEEK_START} – {WEEK_END}
            </p>
            <h1 className="font-serif text-2xl leading-tight mb-1 relative z-10">
              Your Mobility<br />This Week
            </h1>
            <p className="text-xs text-cream opacity-60 relative z-10">
              {WEEK_START} – {WEEK_END} · Atlanta, GA
            </p>
          </div>

        {/* Content area - scrollable */}
          <div className="flex-1 overflow-y-auto px-5 pt-5 pb-24 space-y-4">
            {activeNav === 'home' && (
              <>                {/* Date picker for Home tab */}
                <div style={{
                  background: '#F5F0E8',
                  borderRadius: '14px',
                  padding: '12px 14px',
                  border: '1px solid rgba(45,74,62,0.1)',
                  marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <button
                      onClick={() => setUseCustomDates(false)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: '600',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                        background: !useCustomDates ? '#2D4A3E' : '#F2F6F3',
                        color: !useCustomDates ? '#B8E06A' : '#2D4A3E',
                        transition: 'all 0.2s'
                      }}
                    >
                      Current Week
                    </button>
                    <button
                      onClick={() => setUseCustomDates(true)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: '10px',
                        fontSize: '12px',
                        fontWeight: '600',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                        background: useCustomDates ? '#2D4A3E' : '#F2F6F3',
                        color: useCustomDates ? '#B8E06A' : '#2D4A3E',
                        transition: 'all 0.2s'
                      }}
                    >
                      Custom Date
                    </button>
                  </div>
                  {useCustomDates && (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          borderRadius: '8px',
                          border: '1px solid rgba(45,74,62,0.2)',
                          fontSize: '11px',
                          fontFamily: "'DM Sans', sans-serif"
                        }}
                      />
                      <span style={{ fontSize: '10px', color: '#8A9A8E', whiteSpace: 'nowrap' }}>
                        +7 days
                      </span>
                    </div>
                  )}
                </div>                <WeeklySummary data={summary} />
                <Sprout data={sprout} />
              </>
            )}
            {activeNav === 'carpool' && (
              <RecommendationList
                recommendations={recommendations?.recommendations || []}
                type="carpool"
                acceptedId={acceptedCarpoolId}
                onAccept={handleAcceptCarpool}
              />
            )}
            {activeNav === 'transit' && (
              <RecommendationList
                recommendations={recommendations?.recommendations || []}
                type="transit"
                acceptedId={acceptedTransitId}
                onAccept={handleAcceptTransit}
              />
            )}
            {activeNav === 'friends' && (
              <div>
                {friendsLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#8A9A8E', fontSize: '14px' }}>
                    Loading friends...
                  </div>
                ) : friendsError || !friends?.friends || friends.friends.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#8A9A8E', fontSize: '14px' }}>
                    No friends yet. Add some to get started!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {friends.friends.map((friend) => {
                      const colors = ['#4A7C59', '#5B8FA8', '#C45C3A', '#E8C547', '#7DB87A'];
                      const hashCode = (str) => {
                        let hash = 0;
                        for (let i = 0; i < str.length; i++) {
                          hash = ((hash << 5) - hash) + str.charCodeAt(i);
                          hash = hash & hash;
                        }
                        return Math.abs(hash);
                      };
                      const bgColor = colors[hashCode(friend.user_name) % colors.length];
                      return (
                        <div
                          key={friend.user_id}
                          style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '14px 16px',
                            boxShadow: '0 2px 10px rgba(45,74,62,0.06)',
                            border: '1px solid rgba(45,74,62,0.06)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}
                        >
                          {/* Avatar with colored background */}
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '18px',
                              fontWeight: '700',
                              color: 'white',
                              fontFamily: "'DM Serif Display', serif",
                              flexShrink: 0,
                              background: bgColor,
                              border: '2px solid white',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                            }}
                          >
                            {friend.user_name?.charAt(0).toUpperCase() || '👤'}
                          </div>
                          {/* Friend info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{
                              fontWeight: '600',
                              fontSize: '14px',
                              color: '#1A2B24',
                              marginBottom: '2px'
                            }}>
                              {friend.user_name}
                            </p>
                          </div>
                          {/* Status badge */}
                          <div
                            style={{
                              background: '#E8F5E9',
                              color: '#2D7A32',
                              padding: '6px 12px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: '600',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            ✓ Connected
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation bar */}
          <div className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto bg-white border-t border-gray-100 flex justify-around py-2 px-2 rounded-t-2xl z-50">
            <button
              onClick={() => setActiveNav('home')}
              className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition rounded-lg ${
                activeNav === 'home' ? 'text-earth' : 'text-gray-400'
              }`}
            >
              <span className="text-lg">🌿</span>
              <span className="truncate">Home</span>
            </button>
            <button
              onClick={() => setActiveNav('carpool')}
              className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition rounded-lg ${
                activeNav === 'carpool' ? 'text-earth' : 'text-gray-400'
              }`}
            >
              <span className="text-lg">🚗</span>
              <span className="truncate">Carpool</span>
            </button>
            <button
              onClick={() => setActiveNav('friends')}
              className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition rounded-lg ${
                activeNav === 'friends' ? 'text-earth' : 'text-gray-400'
              }`}
            >
              <span className="text-lg">👥</span>
              <span className="truncate">Friends</span>
            </button>
            <button
              onClick={() => setActiveNav('transit')}
              className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs font-medium transition rounded-lg ${
                activeNav === 'transit' ? 'text-earth' : 'text-gray-400'
              }`}
            >
              <span className="text-lg">🚌</span>
              <span className="truncate">Transit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;