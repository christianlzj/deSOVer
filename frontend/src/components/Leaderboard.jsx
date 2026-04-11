import React from 'react';

const MEDAL_EMOJIS = ['🥇', '🥈', '🥉'];

function getScoreColor(score) {
  if (score >= 80) return '#7DB87A';
  if (score >= 50) return '#B8E06A';
  if (score >= 25) return '#E8C547';
  return '#C45C3A';
}

function getScoreLabel(score) {
  if (score >= 80) return 'Champion';
  if (score >= 50) return 'Great';
  if (score >= 25) return 'Growing';
  return 'Seedling';
}

export default function Leaderboard({ data, loading, error, onBack, onSocialBoard }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8A9A8E', fontSize: '14px' }}>
        Loading leaderboard...
      </div>
    );
  }

  if (error || !data?.leaderboard || data.leaderboard.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            color: '#2D4A3E',
            padding: '4px 0',
            fontFamily: "'DM Sans', sans-serif"
          }}
        >
          ← Back to Friends
        </button>
        <div style={{ textAlign: 'center', padding: '20px', color: '#8A9A8E', fontSize: '14px' }}>
          No leaderboard data available yet.
        </div>
      </div>
    );
  }

  const leaderboard = data.leaderboard;
  const currentUserId = data.user_id;

  // Top 3 podium entries
  const podium = leaderboard.slice(0, 3);
  // Remaining entries
  const rest = leaderboard.slice(3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '13px',
          fontWeight: '600',
          color: '#2D4A3E',
          padding: '4px 0',
          fontFamily: "'DM Sans', sans-serif"
        }}
      >
        ← Back to Friends
      </button>

      {/* Title card */}
      <div style={{
        background: 'linear-gradient(135deg, #1A2B24 0%, #2D4A3E 100%)',
        borderRadius: '20px',
        padding: '18px 20px',
        border: '1px solid rgba(184,224,106,0.15)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '28px', marginBottom: '6px' }}>🏆</div>
        <h2 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '20px',
          color: '#F5F0E8',
          fontWeight: 'bold',
          marginBottom: '4px'
        }}>
          Sustainability Leaderboard
        </h2>
        <p style={{
          fontSize: '11px',
          color: 'rgba(184,224,106,0.7)',
          letterSpacing: '0.08em'
        }}>
          Ranked by non-SOV trip percentage
        </p>
      </div>

      {/* Podium section */}
      {podium.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          gap: '8px',
          padding: '8px 0 4px'
        }}>
          {/* Reorder for visual podium: 2nd, 1st, 3rd */}
          {[podium[1], podium[0], podium[2]].filter(Boolean).map((entry, visualIndex) => {
            const actualRank = entry ? leaderboard.indexOf(entry) : -1;
            if (!entry) return null;
            const isFirst = actualRank === 0;
            const isCurrentUser = entry.user_id === currentUserId;
            const podiumHeight = isFirst ? '90px' : actualRank === 1 ? '70px' : '56px';
            const avatarSize = isFirst ? '48px' : '40px';
            const fontSize = isFirst ? '14px' : '12px';

            const colors = ['#4A7C59', '#5B8FA8', '#C45C3A', '#E8C547', '#7DB87A'];
            const hashCode = (str) => {
              let hash = 0;
              for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(i);
                hash = hash & hash;
              }
              return Math.abs(hash);
            };
            const bgColor = colors[hashCode(entry.user_name) % colors.length];

            return (
              <div key={entry.user_id} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '6px',
                flex: 1,
                maxWidth: isFirst ? '110px' : '90px'
              }}>
                {/* Medal */}
                <div style={{ fontSize: isFirst ? '22px' : '18px' }}>
                  {MEDAL_EMOJIS[actualRank]}
                </div>
                {/* Avatar */}
                <div style={{
                  width: avatarSize,
                  height: avatarSize,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: isFirst ? '20px' : '16px',
                  fontWeight: '700',
                  color: 'white',
                  fontFamily: "'DM Serif Display', serif",
                  background: bgColor,
                  border: isCurrentUser ? '3px solid #B8E06A' : '2px solid white',
                  boxShadow: isFirst
                    ? '0 4px 12px rgba(45,74,62,0.25)'
                    : '0 2px 6px rgba(0,0,0,0.15)'
                }}>
                  {entry.user_name?.charAt(0).toUpperCase() || '?'}
                </div>
                {/* Name */}
                <span style={{
                  fontSize: fontSize,
                  fontWeight: isCurrentUser ? '700' : '600',
                  color: '#1A2B24',
                  textAlign: 'center',
                  lineHeight: '1.2',
                  maxWidth: '80px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {isCurrentUser ? 'You' : entry.user_name}
                </span>
                {/* Podium bar */}
                <div style={{
                  width: '100%',
                  height: podiumHeight,
                  borderRadius: '12px 12px 0 0',
                  background: isFirst
                    ? 'linear-gradient(180deg, #B8E06A 0%, #7DB87A 100%)'
                    : actualRank === 1
                      ? 'linear-gradient(180deg, #D4E8D4 0%, #A8CFA8 100%)'
                      : 'linear-gradient(180deg, #E8E4DC 0%, #D4D0C8 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)'
                }}>
                  <span style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: isFirst ? '20px' : '16px',
                    fontWeight: 'bold',
                    color: '#2D4A3E'
                  }}>
                    {entry.score}%
                  </span>
                  <span style={{
                    fontSize: '9px',
                    color: '#4A7C59',
                    fontWeight: '500'
                  }}>
                    sustainable
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Remaining rankings */}
      {rest.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rest.map((entry, index) => {
            const rank = index + 4;
            const isCurrentUser = entry.user_id === currentUserId;
            const scoreColor = getScoreColor(entry.score);
            const scoreLabel = getScoreLabel(entry.score);

            const colors = ['#4A7C59', '#5B8FA8', '#C45C3A', '#E8C547', '#7DB87A'];
            const hashCode = (str) => {
              let hash = 0;
              for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(i);
                hash = hash & hash;
              }
              return Math.abs(hash);
            };
            const bgColor = colors[hashCode(entry.user_name) % colors.length];

            return (
              <div
                key={entry.user_id}
                style={{
                  background: isCurrentUser
                    ? 'linear-gradient(135deg, rgba(184,224,106,0.12) 0%, rgba(212,232,212,0.3) 100%)'
                    : 'white',
                  borderRadius: '16px',
                  padding: '12px 14px',
                  boxShadow: '0 2px 10px rgba(45,74,62,0.06)',
                  border: isCurrentUser
                    ? '1.5px solid rgba(184,224,106,0.4)'
                    : '1px solid rgba(45,74,62,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                {/* Rank number */}
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: '#F2F6F3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#4A7C59',
                  flexShrink: 0
                }}>
                  {rank}
                </div>

                {/* Avatar */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: '700',
                  color: 'white',
                  fontFamily: "'DM Serif Display', serif",
                  flexShrink: 0,
                  background: bgColor,
                  border: '2px solid white',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}>
                  {entry.user_name?.charAt(0).toUpperCase() || '?'}
                </div>

                {/* Name and label */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontWeight: isCurrentUser ? '700' : '600',
                    fontSize: '13px',
                    color: '#1A2B24',
                    marginBottom: '2px'
                  }}>
                    {isCurrentUser ? `${entry.user_name} (You)` : entry.user_name}
                  </p>
                  <p style={{
                    fontSize: '10.5px',
                    color: '#8A9A8E'
                  }}>
                    {scoreLabel} · {entry.total_trips} trips
                  </p>
                </div>

                {/* Score badge */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px'
                }}>
                  <div style={{
                    fontFamily: "'DM Serif Display', serif",
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#2D4A3E',
                    lineHeight: 1
                  }}>
                    {entry.score}%
                  </div>
                  {/* Mini progress bar */}
                  <div style={{
                    width: '40px',
                    height: '4px',
                    background: 'rgba(45,74,62,0.1)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${entry.score}%`,
                      background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}dd)`,
                      borderRadius: '2px',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Social Board button */}
      <button
        onClick={onSocialBoard}
        style={{
          width: '100%',
          padding: '14px 18px',
          borderRadius: '16px',
          border: '1px solid rgba(91,143,168,0.3)',
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
          boxShadow: '0 4px 14px rgba(45,74,62,0.2)',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease'
        }}
        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        <span style={{ fontSize: '18px' }}>💬</span>
        <span>Social Board</span>
        <span style={{ marginLeft: 'auto', fontSize: '13px', opacity: 0.6 }}>→</span>
      </button>

      {/* Tip card */}
      <div style={{
        background: 'linear-gradient(135deg, #2D4A3E 0%, #3D6352 100%)',
        borderRadius: '18px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px'
      }}>
        <div style={{ fontSize: '20px', flexShrink: 0, marginTop: '1px' }}>🌱</div>
        <div>
          <p style={{
            fontSize: '12.5px',
            color: 'rgba(245,240,232,0.9)',
            lineHeight: '1.5'
          }}>
            Climb the rankings by choosing <span style={{ color: '#B8E06A', fontWeight: '600' }}>carpool or transit</span> over driving alone. Every green trip counts!
          </p>
        </div>
      </div>
    </div>
  );
}
