import React, { useState } from 'react';

export default function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState('landing'); // landing | login | signup | signupSuccess
  const [loginId, setLoginId] = useState('');
  const [loginName, setLoginName] = useState('');
  const [signupName, setSignupName] = useState('');
  const [newUserId, setNewUserId] = useState(null);
  const [homeLat, setHomeLat] = useState('');
  const [homeLon, setHomeLon] = useState('');
  const [workLat, setWorkLat] = useState('');
  const [workLon, setWorkLon] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/users/${loginId}`);
      if (!response.ok) throw new Error('User not found');
      
      const user = await response.json();
      if (user.user_name.toLowerCase() !== loginName.toLowerCase()) {
        throw new Error('Name does not match');
      }

      // Login successful
      onAuthSuccess({ user_id: user.user_id, user_name: user.user_name });
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!signupName.trim() || !homeLat || !homeLon || !workLat || !workLon) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_name: signupName.trim(),
          home_lat: parseFloat(homeLat),
          home_lon: parseFloat(homeLon),
          work_lat: parseFloat(workLat),
          work_lon: parseFloat(workLon),
        }),
      });

      if (!response.ok) throw new Error('Signup failed');

      const newUser = await response.json();

      // Show the assigned ID before entering the app
      setNewUserId(newUser.user_id);
      setMode('signupSuccess');
    } catch (err) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-earth via-cream to-mist flex items-center justify-center p-4">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.6s ease-out; }
      `}</style>

      {/* Landing Screen */}
      {mode === 'landing' && (
        <div className="w-full max-w-md fade-in">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>🌱</div>
            <h1 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '42px',
              color: '#2D4A3E',
              marginBottom: '8px'
            }}>deSOVer</h1>
            <p style={{
              fontSize: '14px',
              color: '#4A7C59',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              fontWeight: '600'
            }}>Community Mobility Platform</p>
          </div>

          <p style={{
            fontSize: '16px',
            color: '#1A2B24',
            lineHeight: '1.6',
            marginBottom: '32px',
            textAlign: 'center'
          }}>
            Share rides, reduce carbon, connect with your community. Start your sustainable commute today.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => setMode('login')}
              style={{
                padding: '14px',
                borderRadius: '12px',
                border: 'none',
                background: '#2D4A3E',
                color: '#B8E06A',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Login
            </button>
            <button
              onClick={() => setMode('signup')}
              style={{
                padding: '14px',
                borderRadius: '12px',
                border: '2px solid #2D4A3E',
                background: 'transparent',
                color: '#2D4A3E',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#2D4A3E';
                e.target.style.color = '#B8E06A';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#2D4A3E';
              }}
            >
              Create Account
            </button>
          </div>
        </div>
      )}

      {/* Login Screen */}
      {mode === 'login' && (
        <div className="w-full max-w-md fade-in">
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '28px',
              color: '#2D4A3E',
              marginBottom: '8px'
            }}>Welcome Back</h2>
            <p style={{ fontSize: '14px', color: '#4A7C59' }}>Enter your ID and name to continue</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#2D4A3E',
                marginBottom: '6px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>User ID</label>
              <input
                type="number"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                placeholder="Enter your user ID"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #D4E8D4',
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#2D4A3E',
                marginBottom: '6px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>Name</label>
              <input
                type="text"
                value={loginName}
                onChange={(e) => setLoginName(e.target.value)}
                placeholder="Enter your name"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #D4E8D4',
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                background: '#FFE8E8',
                color: '#C45C3A',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                background: loading ? '#C0D0C5' : '#2D4A3E',
                color: '#B8E06A',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                marginTop: '8px'
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <button
              type="button"
              onClick={() => { setMode('landing'); setError(''); }}
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: 'transparent',
                color: '#4A7C59',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif"
              }}
            >
              ← Back
            </button>
          </form>
        </div>
      )}

      {/* Signup Success Screen */}
      {mode === 'signupSuccess' && (
        <div className="w-full max-w-md fade-in" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: '28px',
            color: '#2D4A3E',
            marginBottom: '8px'
          }}>Account Created!</h2>
          <p style={{ fontSize: '14px', color: '#4A7C59', marginBottom: '32px' }}>
            Save your User ID — you'll need it to log in.
          </p>

          <div style={{
            background: '#F2F6F3',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px'
          }}>
            <p style={{ fontSize: '12px', fontWeight: '600', color: '#8A9A8E', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Your User ID
            </p>
            <p style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '48px',
              color: '#2D4A3E',
              fontWeight: 'bold',
              lineHeight: 1
            }}>
              {newUserId}
            </p>
          </div>

          <button
            onClick={() => onAuthSuccess({ user_id: newUserId, user_name: signupName.trim() })}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: '#2D4A3E',
              color: '#B8E06A',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif"
            }}
          >
            Continue to App →
          </button>
        </div>
      )}

      {/* Signup Screen */}
      {mode === 'signup' && (
        <div className="w-full max-w-md fade-in">
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '28px',
              color: '#2D4A3E',
              marginBottom: '8px'
            }}>Create Account</h2>
            <p style={{ fontSize: '14px', color: '#4A7C59' }}>Tell us about your commute</p>
          </div>

          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '8px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#2D4A3E',
                marginBottom: '6px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>Full Name</label>
              <input
                type="text"
                value={signupName}
                onChange={(e) => setSignupName(e.target.value)}
                placeholder="Your name"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #D4E8D4',
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#2D4A3E',
                marginBottom: '6px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>Home Latitude</label>
              <input
                type="number"
                step="0.000001"
                value={homeLat}
                onChange={(e) => setHomeLat(e.target.value)}
                placeholder="e.g., 33.8955"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #D4E8D4',
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#2D4A3E',
                marginBottom: '6px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>Home Longitude</label>
              <input
                type="number"
                step="0.000001"
                value={homeLon}
                onChange={(e) => setHomeLon(e.target.value)}
                placeholder="e.g., -84.4635"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #D4E8D4',
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#2D4A3E',
                marginBottom: '6px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>Work Latitude</label>
              <input
                type="number"
                step="0.000001"
                value={workLat}
                onChange={(e) => setWorkLat(e.target.value)}
                placeholder="e.g., 33.7865"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #D4E8D4',
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#2D4A3E',
                marginBottom: '6px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>Work Longitude</label>
              <input
                type="number"
                step="0.000001"
                value={workLon}
                onChange={(e) => setWorkLon(e.target.value)}
                placeholder="e.g., -84.3886"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #D4E8D4',
                  fontSize: '14px',
                  fontFamily: "'DM Sans', sans-serif",
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {error && (
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                background: '#FFE8E8',
                color: '#C45C3A',
                fontSize: '13px',
                fontWeight: '500'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                background: loading ? '#C0D0C5' : '#2D4A3E',
                color: '#B8E06A',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                marginTop: '8px'
              }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>

            <button
              type="button"
              onClick={() => { setMode('landing'); setError(''); }}
              style={{
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                background: 'transparent',
                color: '#4A7C59',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif"
              }}
            >
              ← Back
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
