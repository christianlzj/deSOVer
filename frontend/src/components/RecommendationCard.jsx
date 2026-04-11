import React from 'react';

const formatDays = (daysArray) => {
  if (!daysArray || daysArray.length === 0) return '';
  const shortDays = daysArray.map(d => d.slice(0, 3));
  return shortDays.join(' · ');
};

// Add pulse animation to document head if not already there
if (typeof window !== 'undefined' && !document.querySelector('style[data-pulse-animation]')) {
  const style = document.createElement('style');
  style.setAttribute('data-pulse-animation', 'true');
  style.textContent = '@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }';
  document.head.appendChild(style);
}

export default function RecommendationCard({ rec, isAccepted, onAccept, onMessage }) {
  const isCarpool = rec.type === 'carpool';

  // Get the friend ID and name from the match
  const getFriendId = () => {
    if (rec.singleMatch) {
      return rec.singleMatch.friend_id;
    }
    return null;
  };

  const getFriendName = () => {
    if (rec.singleMatch) {
      return rec.singleMatch.friend_name;
    }
    return null;
  };

  // Single carpool match (expanded from RecommendationList)
  if (isCarpool && rec.singleMatch) {
    const match = rec.singleMatch;
    return (
      <div style={{
        background: 'white',
        borderRadius: '18px',
        padding: '14px 16px',
        boxShadow: '0 2px 10px rgba(45,74,62,0.06)',
        border: '1px solid rgba(45,74,62,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
          {/* Avatar */}
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: '700',
              color: 'white',
              fontFamily: "'DM Serif Display', serif",
              flexShrink: 0,
              background: 'linear-gradient(135deg, #4A7C59, #2D4A3E)',
              border: '2px solid white',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)'
            }}
          >
            {match.friend_name?.charAt(0) || '?'}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{
              fontWeight: '600',
              fontSize: '14px',
              color: '#1A2B24',
              marginBottom: '2px'
            }}>
              {match.friend_name}
            </p>
            <p style={{
              fontSize: '11px',
              color: '#8A9A8E',
              marginBottom: '4px'
            }}>
              {formatDays(rec.days)} · Recurring
            </p>
            <div style={{
              background: 'rgba(184,224,106,0.2)',
              color: '#4A7C59',
              display: 'inline-block',
              padding: '3px 8px',
              borderRadius: '20px',
              fontSize: '10px',
              fontWeight: '600'
            }}>
              {Math.round(match.score * 100)}% Match
            </div>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
          <div style={{
            background: '#F2F6F3',
            borderRadius: '12px',
            padding: '10px 8px',
            textAlign: 'center'
          }}>
            <div style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '16px',
              color: '#2D4A3E',
              fontWeight: 'bold',
              lineHeight: 1
            }}>
              {rec.suggested_departure}
            </div>
            <div style={{ fontSize: '9px', fontWeight: '400', color: '#4A7C59', marginTop: '3px' }}>Departure</div>
          </div>
          <div style={{
            background: '#F2F6F3',
            borderRadius: '12px',
            padding: '10px 8px',
            textAlign: 'center'
          }}>
            <div style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '16px',
              color: '#2D4A3E',
              fontWeight: 'bold',
              lineHeight: 1
            }}>
              {rec.co2_saved_lbs}
            </div>
            <div style={{ fontSize: '9px', fontWeight: '400', color: '#4A7C59', marginTop: '3px' }}>lbs CO₂</div>
          </div>
          <div style={{
            background: '#F2F6F3',
            borderRadius: '12px',
            padding: '10px 8px',
            textAlign: 'center'
          }}>
            <div style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '16px',
              color: '#2D4A3E',
              fontWeight: 'bold',
              lineHeight: 1
            }}>
              ${rec.fuel_saved_dollars || 0}
            </div>
            <div style={{ fontSize: '9px', fontWeight: '400', color: '#4A7C59', marginTop: '3px' }}>Fuel</div>
          </div>
        </div>

        {/* CTA buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button
            onClick={onAccept}
            style={{
              borderRadius: '12px',
              padding: '12px 10px',
              fontSize: '12.5px',
              fontWeight: '600',
              textAlign: 'center',
              cursor: 'pointer',
              border: 'none',
              letterSpacing: '0.01em',
              fontFamily: "'DM Sans', sans-serif",
              background: isAccepted ? '#B8E06A' : '#2D4A3E',
              color: isAccepted ? '#2D4A3E' : '#B8E06A'
            }}
          >
            {isAccepted ? '✓ Accepted' : 'Accept'}
          </button>
          <button
            onClick={() => {
              const friendId = getFriendId();
              const friendName = getFriendName();
              if (friendId && onMessage) {
                onMessage(friendId, friendName);
              }
            }}
            style={{
              borderRadius: '12px',
              padding: '12px 10px',
              fontSize: '12.5px',
              fontWeight: '600',
              textAlign: 'center',
              cursor: 'pointer',
              border: '1.5px solid rgba(45,74,62,0.18)',
              letterSpacing: '0.01em',
              fontFamily: "'DM Sans', sans-serif",
              background: 'white',
              color: '#2D4A3E'
            }}
          >
            💬 Message
          </button>
        </div>
      </div>
    );
  }

  // Transit option
  if (!isCarpool && rec.transit_details) {
    const details = rec.transit_details;
    const routeName = details.route_short_name ? `${details.route_short_name} - ${details.route_long_name}` : details.route_long_name;
    const totalTime = Math.round(details.total_min || (details.walk_to_stop_min + details.ride_min + details.walk_from_stop_min));
    
    return (
      <div style={{
        background: 'white',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 3px 16px rgba(45,74,62,0.09)',
        border: '1px solid rgba(45,74,62,0.06)'
      }}>
        {/* Header with route and times */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(45,74,62,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '18px' }}>🚌</span>
            <span style={{ fontWeight: '600', fontSize: '14px', color: '#1A2B24' }}>
              {routeName}
            </span>
          </div>
          <div style={{
            background: 'rgba(184,224,106,0.15)',
            color: '#4A7C59',
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: '16px',
            fontSize: '11px',
            fontWeight: '600'
          }}>
            {details.departure_time} → {details.arrival_time} · {totalTime}m
          </div>
        </div>

        {/* Stops info */}
        <div style={{ padding: '14px 16px' }}>
          <div style={{ marginBottom: '12px' }}>
            <p style={{
              fontSize: '10px',
              fontWeight: '600',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#8A9A8E',
              marginBottom: '4px'
            }}>Board At</p>
            <p style={{ fontSize: '13px', color: '#1A2B24', fontWeight: '500' }}>{details.board_stop}</p>
          </div>
          <div style={{ marginBottom: '14px' }}>
            <p style={{
              fontSize: '10px',
              fontWeight: '600',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#8A9A8E',
              marginBottom: '4px'
            }}>Alight At</p>
            <p style={{ fontSize: '13px', color: '#1A2B24', fontWeight: '500' }}>{details.alight_stop}</p>
          </div>

          {/* Journey breakdown */}
          <div style={{
            background: '#F2F6F3',
            borderRadius: '14px',
            padding: '12px 14px',
            fontSize: '12px',
            color: '#1A2B24',
            marginBottom: '14px',
            textAlign: 'center',
            fontWeight: '500'
          }}>
            🚶 {Math.round(details.walk_to_stop_min)}m walk → 🚌 {details.ride_min}m ride → 🚶 {Math.round(details.walk_from_stop_min)}m walk
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div style={{
              background: '#F2F6F3',
              borderRadius: '12px',
              padding: '12px 10px',
              textAlign: 'center'
            }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '18px', color: '#2D4A3E', fontWeight: 'bold' }}>
                {rec.co2_saved_lbs}
              </div>
              <div style={{ fontSize: '9px', color: '#4A7C59', marginTop: '4px' }}>lbs CO₂</div>
            </div>
            <div style={{
              background: '#F2F6F3',
              borderRadius: '12px',
              padding: '12px 10px',
              textAlign: 'center'
            }}>
              <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '18px', color: '#2D4A3E', fontWeight: 'bold' }}>
                ${rec.fuel_saved_dollars || 0}
              </div>
              <div style={{ fontSize: '9px', color: '#4A7C59', marginTop: '4px' }}>Saved</div>
            </div>
          </div>

          {/* Accept button */}
          <button
            onClick={onAccept}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              fontSize: '13.5px',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              background: isAccepted ? '#B8E06A' : '#2D4A3E',
              color: isAccepted ? '#2D4A3E' : '#B8E06A'
            }}
          >
            {isAccepted ? '✓ Accepted' : 'Accept Option'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}