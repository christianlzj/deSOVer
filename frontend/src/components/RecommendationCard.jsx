import React from 'react';

const formatDays = (daysArray) => {
  if (!daysArray || daysArray.length === 0) return '';
  const shortDays = daysArray.map(d => d.slice(0, 3));
  return shortDays.join(' · ');
};

const getSeededRandom = (seedStr) => {
  let h = 0;
  const str = String(seedStr);
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return function() {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
};

const FakeMap = ({ seed }) => {
  const rand = getSeededRandom(seed || 'default');
  
  const roads = Array.from({ length: 4 }).map((_, i) => (
    <line 
      key={`v-${i}`}
      x1={rand() * 200} y1="0" 
      x2={rand() * 200} y2="100" 
      stroke="white" strokeWidth="4" opacity="0.7" 
    />
  )).concat(
    Array.from({ length: 3 }).map((_, i) => (
      <line 
        key={`h-${i}`}
        x1="0" y1={rand() * 100} 
        x2="200" y2={rand() * 100} 
        stroke="white" strokeWidth="4" opacity="0.7" 
      />
    ))
  );

  const startX = 20 + rand() * 40;
  const startY = 60 + rand() * 20;

  const midX = 80 + rand() * 40;
  const midY = 20 + rand() * 60;

  const endX = 140 + rand() * 40;
  const endY = 20 + rand() * 40;

  return (
    <div style={{
      width: '100%',
      height: '110px',
      background: '#E8ECE9',
      borderRadius: '12px',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '16px',
      border: '1px solid rgba(45,74,62,0.08)'
    }}>
      <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none">
        {roads}
        <path
          d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
          fill="none"
          stroke="#B8E06A"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d={`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`}
          fill="none"
          stroke="#2D4A3E"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="6,6"
        />
        <circle cx={startX} cy={startY} r="5" fill="#4A7C59" stroke="white" strokeWidth="2" />
        <circle cx={endX} cy={endY} r="5" fill="#C45C3A" stroke="white" strokeWidth="2" />
      </svg>
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        background: 'white',
        padding: '3px 8px',
        borderRadius: '8px',
        fontSize: '10px',
        fontWeight: 'bold',
        color: '#2D4A3E',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <span>📍</span> Route Overview
      </div>
    </div>
  );
};

export default function RecommendationCard({ rec, isAccepted, processingId, onAccept, onMessage, nested }) {
  const isCarpool = rec.type === 'carpool';

  // Carpool group card — shows trip info + friend list
  if (isCarpool && rec.matches && rec.matches.length > 0) {
    // Accepted friends move to Active tab — only render non-accepted friends here.
    // If the group has an accepted match, remaining friends are blocked until it's ended.
    const hasActiveMatch = rec.matches.some(m => m.status === 'accepted');
    const visibleMatches = rec.matches.filter(m => m.status !== 'accepted');

    return (
      <div style={{
        background: 'white',
        borderRadius: '18px',
        padding: '16px',
        boxShadow: '0 2px 10px rgba(45,74,62,0.06)',
        border: '1px solid rgba(45,74,62,0.06)'
      }}>
        {/* Trip info header */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '16px' }}>🚗</span>
            <span style={{
              fontWeight: '600',
              fontSize: '14px',
              color: '#1A2B24'
            }}>Carpool</span>
            <span style={{
              fontSize: '12px',
              color: '#8A9A8E'
            }}>
              {formatDays(rec.days)}
            </span>
          </div>
        </div>

        {/* Trip stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
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

        {/* Fake Map */}
        <FakeMap seed={rec.id} />

        {/* Divider + label */}
        <div style={{
          fontSize: '10px',
          fontWeight: '600',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#8A9A8E',
          marginBottom: '10px',
          paddingBottom: '8px',
          borderTop: '1px solid rgba(45,74,62,0.08)',
          paddingTop: '12px'
        }}>
          Choose a carpool partner
        </div>

        {/* Friend list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {visibleMatches.map((match) => {
            const isProcessing = processingId === match.recommendation_id;
            // Another friend in this trip is already active — block this one
            const isBlocked = hasActiveMatch;

            return (
              <div key={match.friend_id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '12px',
                background: '#F8FAF8',
                border: '1px solid transparent',
                opacity: isBlocked ? 0.55 : 1,
                transition: 'all 0.2s'
              }}>
                {/* Avatar */}
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: '700', color: 'white',
                  fontFamily: "'DM Serif Display', serif", flexShrink: 0,
                  background: 'linear-gradient(135deg, #4A7C59, #2D4A3E)',
                  border: '2px solid white', boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
                }}>
                  {match.friend_name?.charAt(0) || '?'}
                </div>

                {/* Name + score */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: '600', fontSize: '13px', color: '#1A2B24', marginBottom: '2px' }}>
                    {match.friend_name}
                  </p>
                  <div style={{
                    background: 'rgba(184,224,106,0.2)', color: '#4A7C59',
                    display: 'inline-block', padding: '2px 6px', borderRadius: '20px',
                    fontSize: '10px', fontWeight: '600'
                  }}>
                    {Math.round(match.score * 100)}% Match
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  {isBlocked ? (
                    <span style={{
                      fontSize: '10px', color: '#C45C3A', fontWeight: '500',
                      fontFamily: "'DM Sans', sans-serif", maxWidth: '90px',
                      textAlign: 'right', lineHeight: '1.3'
                    }}>
                      Active carpool,<br />end it first
                    </span>
                  ) : (
                    <button
                      onClick={() => !isProcessing && onAccept(match.recommendation_id)}
                      disabled={isProcessing}
                      style={{
                        borderRadius: '10px', padding: '8px 12px', fontSize: '11px',
                        fontWeight: '600', cursor: isProcessing ? 'not-allowed' : 'pointer',
                        border: 'none', fontFamily: "'DM Sans', sans-serif",
                        background: isProcessing ? '#ccc' : '#2D4A3E',
                        color: isProcessing ? '#888' : '#B8E06A',
                        transition: 'all 0.2s', minWidth: '58px', textAlign: 'center'
                      }}
                    >
                      {isProcessing ? '...' : 'Accept'}
                    </button>
                  )}
                  <button
                    onClick={() => match.friend_id && onMessage && onMessage(match.friend_id, match.friend_name)}
                    style={{
                      borderRadius: '10px', padding: '8px 10px', fontSize: '11px',
                      fontWeight: '600', cursor: 'pointer',
                      border: '1.5px solid rgba(45,74,62,0.18)',
                      fontFamily: "'DM Sans', sans-serif",
                      background: 'white', color: '#2D4A3E'
                    }}
                  >💬</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Transit option
  if (!isCarpool && rec.transit_details) {
    const details = rec.transit_details;
    const isProcessing = processingId === rec.id;
    const routeName = details.route_short_name ? `${details.route_short_name} - ${details.route_long_name}` : details.route_long_name;
    const totalTime = Math.round(details.total_min || (details.walk_to_stop_min + details.ride_min + details.walk_from_stop_min));

    return (
      <div style={{
        background: nested ? '#FAFCFA' : 'white',
        borderRadius: nested ? '14px' : '20px',
        overflow: 'hidden',
        boxShadow: nested ? 'none' : '0 3px 16px rgba(45,74,62,0.09)',
        border: isAccepted ? '2px solid #B8E06A' : '1px solid rgba(45,74,62,0.06)',
        transition: 'all 0.2s'
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
            onClick={() => !isProcessing && onAccept()}
            disabled={isProcessing}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              fontSize: '13.5px',
              fontWeight: '600',
              border: 'none',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              background: isProcessing ? '#ccc' : isAccepted ? '#B8E06A' : '#2D4A3E',
              color: isProcessing ? '#888' : isAccepted ? '#2D4A3E' : '#B8E06A'
            }}
          >
            {isProcessing ? 'Processing...' : isAccepted ? '✓ Accepted' : 'Accept Option'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
