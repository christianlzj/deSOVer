import { useState, useEffect } from 'react';
import { useFetch } from './hooks/useFetch';
import AuthScreen from './components/AuthScreen';
import Greeting from './components/Greeting';
import WeeklySummary from './components/WeeklySummary';
import Sprout from './components/Sprout';
import RecommendationList from './components/RecommendationList';
import Leaderboard from './components/Leaderboard';
import SocialBoard from './components/SocialBoard';
import Messages from './components/Messages';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

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
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Restore user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('desover_user');
    if (savedUser) {
      try {
        setLoggedInUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Failed to restore user from localStorage:', e);
      }
    }
    setIsHydrated(true);
  }, []);

  // Persist user to localStorage when it changes
  useEffect(() => {
    if (isHydrated) {
      if (loggedInUser) {
        localStorage.setItem('desover_user', JSON.stringify(loggedInUser));
      } else {
        localStorage.removeItem('desover_user');
      }
    }
  }, [loggedInUser, isHydrated]);

  if (!isHydrated) {
    return <div>Loading...</div>;
  }

  // If not logged in, show auth screen
  if (!loggedInUser) {
    return (
      <AuthScreen
        onAuthSuccess={(user) => {
          setLoggedInUser(user);
        }}
      />
    );
  }

  // Once logged in, render the dashboard
  return <Dashboard user={loggedInUser} onLogout={() => setLoggedInUser(null)} />;
}

function Dashboard({ user, onLogout }) {
  const [activeNav, setActiveNav] = useState('home');
  const [useCustomDates, setUseCustomDates] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('2025-01-01');
  const [acceptedCarpoolId, setAcceptedCarpoolId] = useState(null);
  const [acceptedTransitId, setAcceptedTransitId] = useState(null);
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [selectedFriendName, setSelectedFriendName] = useState(null);

  const USER_ID = user.user_id;

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

  const { data: userData, loading: userLoading, error: userError } = useFetch(
    `${API_BASE}/users/${USER_ID}`
  );

  const { data: leaderboard, loading: lbLoading, error: lbError } = useFetch(
    `${API_BASE}/users/${USER_ID}/leaderboard`
  );


  const handleAcceptCarpool = (recId) => {
    setAcceptedCarpoolId(acceptedCarpoolId === recId ? null : recId);
  };

  const handleAcceptTransit = (recId) => {
    setAcceptedTransitId(acceptedTransitId === recId ? null : recId);
  };

  const handleMessage = (friendId, friendName) => {
    setSelectedFriendId(friendId);
    setSelectedFriendName(friendName);
    setActiveNav('messages');
  };

  if (summaryLoading || recsLoading || sproutLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div style={{textAlign: 'center', maxWidth: '400px'}}>
          <div style={{fontSize: '20px', marginBottom: '20px', color: '#2D4A3E'}}>
            Loading your mobility data...
          </div>
          <div style={{fontSize: '12px', color: '#666', lineHeight: '1.8'}}>
            <div>Summary: {summaryLoading ? '⏳ loading' : summaryError ? '❌ error' : '✓ done'}</div>
            <div>Recommendations: {recsLoading ? '⏳ loading' : recsError ? '❌ error' : '✓ done'}</div>
            <div>Sprout: {sproutLoading ? '⏳ loading' : sproutError ? '❌ error' : '✓ done'}</div>
          </div>
        </div>
      </div>
    );
  }
  // Catch-all error check
  if (summaryError || recsError || sproutError) {
    const allErrors = [];
    if (summaryError) allErrors.push(`Summary: ${summaryError?.message || summaryError}`);
    if (recsError) allErrors.push(`Recommendations: ${recsError?.message || recsError}`);
    if (sproutError) allErrors.push(`Sprout: ${sproutError?.message || sproutError}`);
    
    console.error('Fetch errors:', allErrors);
  }
  // Note: We proceed to render even with errors - errors are just logged

  return (
    <div style={{minHeight: '100vh', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'}}>
      {/* Phone container */}
      <div style={{width: '100%', maxWidth: '320px', background: '#1A2B24', borderRadius: '32px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden', border: '1px solid rgba(107, 114, 128, 0.3)'}}>
        {/* Phone "bezel" */}
        <div style={{background: '#1A2B24', paddingLeft: '12px', paddingRight: '12px', paddingTop: '8px', paddingBottom: '0'}}>
          {/* Notch */}
          <div style={{display: 'flex', justifyContent: 'center', marginBottom: '8px'}}>
            <div style={{width: '128px', height: '24px', background: '#1A2B24', borderRadius: '0 0 16px 16px', borderTop: '1px solid rgba(107, 114, 128, 0.4)', borderLeft: '1px solid rgba(107, 114, 128, 0.4)', borderRight: '1px solid rgba(107, 114, 128, 0.4)'}}></div>
          </div>

          {/* Status bar */}
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '24px', paddingRight: '24px', paddingTop: '12px', paddingBottom: '12px', color: '#F5F0E8', fontSize: '12px', fontWeight: '500'}}>
            <span>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false })}</span>
            <span>●●●●●</span>
          </div>
        </div>

        {/* Screen content */}
        <div style={{background: '#F5F0E8', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
          {/* Header - Dynamic based on tab */}
          <div style={{background: '#2D4A3E', color: '#F5F0E8', paddingTop: '16px', paddingBottom: '32px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '0 0 24px 24px', position: 'relative', overflow: 'hidden', flexShrink: 0}}>
            <div style={{position: 'absolute', top: '-40px', right: '-40px', width: '128px', height: '128px', borderRadius: '50%', background: '#B8E06A', opacity: 0.1}}></div>
            
            {activeNav === 'home' && (
              <>
                <p style={{fontSize: '12px', fontWeight: '600', letterSpacing: '0.1em', color: '#B8E06A', opacity: 0.8, marginBottom: '8px', position: 'relative', zIndex: 10, textTransform: 'uppercase'}}>
                  Week of {WEEK_START} – {WEEK_END}
                </p>
                <h1 style={{fontFamily: "'DM Serif Display', serif", fontSize: '24px', lineHeight: 1.2, marginBottom: '8px', position: 'relative', zIndex: 10}}>
                  Your Mobility<br />This Week
                </h1>
                <p style={{fontSize: '12px', color: '#F5F0E8', opacity: 0.6, position: 'relative', zIndex: 10}}>
                  {WEEK_START} – {WEEK_END} · Atlanta, GA
                </p>
              </>
            )}
            
            {activeNav === 'carpool' && (
              <>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'rgba(184,224,106,0.18)',
                  border: '1px solid rgba(184,224,106,0.3)',
                  borderRadius: '20px',
                  padding: '4px 10px',
                  fontSize: '10px',
                  fontWeight: '600',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#B8E06A',
                  marginBottom: '8px',
                  fontFamily: "'DM Sans', sans-serif",
                  position: 'relative',
                  zIndex: 10
                }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#B8E06A',
                    animation: 'pulse 1.5s ease-in-out infinite'
                  }}></span>
                  Potential Overlaps Detected
                </div>
                <h1 style={{fontFamily: "'DM Serif Display', serif", fontSize: '24px', lineHeight: 1.2, marginBottom: '8px', position: 'relative', zIndex: 10}}>
                  Carpool<br />Matches
                </h1>
                <p style={{fontSize: '12px', color: '#F5F0E8', opacity: 0.6, position: 'relative', zIndex: 10}}>
                  {recommendations?.recommendations?.filter(r => r.type === 'carpool').length || 0} available routes
                </p>
              </>
            )}
            
            {activeNav === 'transit' && (
              <>
                <p style={{fontSize: '12px', fontWeight: '600', letterSpacing: '0.1em', color: '#B8E06A', opacity: 0.8, marginBottom: '8px', position: 'relative', zIndex: 10, textTransform: 'uppercase'}}>
                  Smart Suggestions
                </p>
                <h1 style={{fontFamily: "'DM Serif Display', serif", fontSize: '24px', lineHeight: 1.2, marginBottom: '8px', position: 'relative', zIndex: 10}}>
                  Transit<br />Options
                </h1>
                <p style={{fontSize: '12px', color: '#F5F0E8', opacity: 0.6, position: 'relative', zIndex: 10}}>
                  {recommendations?.recommendations?.filter(r => r.type === 'transit').length || 0} routes available
                </p>
              </>
            )}
            
            {activeNav === 'friends' && (
              <>
                <p style={{fontSize: '12px', fontWeight: '600', letterSpacing: '0.1em', color: '#B8E06A', opacity: 0.8, marginBottom: '8px', position: 'relative', zIndex: 10, textTransform: 'uppercase'}}>
                  Your Community
                </p>
                <h1 style={{fontFamily: "'DM Serif Display', serif", fontSize: '24px', lineHeight: 1.2, marginBottom: '8px', position: 'relative', zIndex: 10}}>
                  Friends &<br />Leaderboard
                </h1>
                <p style={{fontSize: '12px', color: '#F5F0E8', opacity: 0.6, position: 'relative', zIndex: 10}}>
                  {friends?.friends?.length || 0} friends connected
                </p>
              </>
            )}
            
            {activeNav === 'messages' && (
              <>
                <p style={{fontSize: '12px', fontWeight: '600', letterSpacing: '0.1em', color: '#B8E06A', opacity: 0.8, marginBottom: '8px', position: 'relative', zIndex: 10, textTransform: 'uppercase'}}>
                  Stay Connected
                </p>
                <h1 style={{fontFamily: "'DM Serif Display', serif", fontSize: '24px', lineHeight: 1.2, marginBottom: '8px', position: 'relative', zIndex: 10}}>
                  Messages
                </h1>
                <p style={{fontSize: '12px', color: '#F5F0E8', opacity: 0.6, position: 'relative', zIndex: 10}}>
                  Chat with your friends
                </p>
              </>
            )}
          </div>
          
          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.5; transform: scale(0.8); }
            }
          `}</style>

          {/* Content area - scrollable */}
          <div style={{flex: 1, overflowY: 'auto', paddingLeft: '20px', paddingRight: '20px', paddingTop: '20px', paddingBottom: '96px', display: 'flex', flexDirection: 'column', gap: '16px'}}>
            {activeNav === 'home' && (
              <>
                {/* Greeting message */}
                <Greeting userName={userData?.user_name} />

                {/* Date picker for Home tab */}
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
                onMessage={handleMessage}
              />
            )}
            {activeNav === 'transit' && (
              <RecommendationList
                recommendations={recommendations?.recommendations || []}
                type="transit"
                acceptedId={acceptedTransitId}
                onAccept={handleAcceptTransit}
                onMessage={handleMessage}
              />
            )}
            {activeNav === 'leaderboard' && (
              <Leaderboard
                data={leaderboard}
                loading={lbLoading}
                error={lbError}
                onBack={() => setActiveNav('friends')}
                onSocialBoard={() => setActiveNav('social')}
              />
            )}
            {activeNav === 'social' && (
              <SocialBoard
                onBack={() => setActiveNav('leaderboard')}
              />
            )}
            {activeNav === 'messages' && (
              <Messages userId={USER_ID} selectedFriendId={selectedFriendId} />
            )}
            {activeNav === 'friends' && (
              <div>
                {/* Leaderboard button */}
                <button
                  onClick={() => setActiveNav('leaderboard')}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    borderRadius: '16px',
                    border: '1px solid rgba(184,224,106,0.3)',
                    background: 'linear-gradient(135deg, #1A2B24 0%, #2D4A3E 100%)',
                    color: '#F5F0E8',
                    fontSize: '14px',
                    fontWeight: '600',
                    fontFamily: "'DM Sans', sans-serif",
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginBottom: '14px',
                    boxShadow: '0 4px 14px rgba(45,74,62,0.2)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                  }}
                  onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                  onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <span style={{ fontSize: '18px' }}>🏆</span>
                  <span>Leaderboard</span>
                  <span style={{ marginLeft: 'auto', fontSize: '13px', opacity: 0.6 }}>→</span>
                </button>
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
          <div style={{position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: '320px', marginLeft: 'auto', marginRight: 'auto', background: 'white', borderTop: '1px solid rgba(229, 231, 235, 1)', display: 'flex', justifyContent: 'space-around', paddingTop: '8px', paddingBottom: '8px', paddingLeft: '8px', paddingRight: '8px', borderRadius: '8px 8px 0 0', zIndex: 50}}>
            <button
              onClick={() => setActiveNav('home')}
              style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', paddingTop: '8px', paddingBottom: '8px', fontSize: '12px', fontWeight: '500', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '8px', color: activeNav === 'home' ? '#2D4A3E' : '#9ca3af', transition: 'color 0.15s'}}
            >
              <span style={{fontSize: '18px'}}>🌿</span>
              <span style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>Home</span>
            </button>
            <button
              onClick={() => setActiveNav('carpool')}
              style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', paddingTop: '8px', paddingBottom: '8px', fontSize: '12px', fontWeight: '500', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '8px', color: activeNav === 'carpool' ? '#2D4A3E' : '#9ca3af', transition: 'color 0.15s'}}
            >
              <span style={{fontSize: '18px'}}>🚗</span>
              <span style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>Carpool</span>
            </button>
            <button
              onClick={() => setActiveNav('friends')}
              style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', paddingTop: '8px', paddingBottom: '8px', fontSize: '12px', fontWeight: '500', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '8px', color: activeNav === 'friends' ? '#2D4A3E' : '#9ca3af', transition: 'color 0.15s'}}
            >
              <span style={{fontSize: '18px'}}>👥</span>
              <span style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>Friends</span>
            </button>
            <button
              onClick={() => setActiveNav('transit')}
              style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', paddingTop: '8px', paddingBottom: '8px', fontSize: '12px', fontWeight: '500', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '8px', color: activeNav === 'transit' ? '#2D4A3E' : '#9ca3af', transition: 'color 0.15s'}}
            >
              <span style={{fontSize: '18px'}}>🚌</span>
              <span style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>Transit</span>
            </button>
            <button
              onClick={() => setActiveNav('messages')}
              style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', paddingTop: '8px', paddingBottom: '8px', fontSize: '12px', fontWeight: '500', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '8px', color: activeNav === 'messages' ? '#2D4A3E' : '#9ca3af', transition: 'color 0.15s'}}
            >
              <span style={{fontSize: '18px'}}>💬</span>
              <span style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>Messages</span>
            </button>
            <button
              onClick={onLogout}
              style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', paddingTop: '8px', paddingBottom: '8px', fontSize: '12px', fontWeight: '500', border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: '8px', color: '#9ca3af', transition: 'color 0.15s'}}
              title="Logout"
            >
              <span style={{fontSize: '18px'}}>🚪</span>
              <span style={{overflow: 'hidden', textOverflow: 'ellipsis'}}>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;