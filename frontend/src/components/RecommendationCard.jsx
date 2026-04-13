import React from 'react';

const formatDays = (daysArray) => {
  if (!daysArray || daysArray.length === 0) return '';
  const shortDays = daysArray.map(d => d.slice(0, 3));
  return shortDays.join(' · ');
};

export default function RecommendationCard({ rec, isAccepted, acceptedIds, onAccept, onMessage, nested }) {
  const isCarpool = rec.type === 'carpool';

  // Carpool group card — shows trip info + friend list
  if (isCarpool && rec.matches && rec.matches.length > 0) {
    const acceptedFriendId = acceptedIds?.[rec.id];

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
          {rec.matches.map((match) => {
            const isFriendAccepted = acceptedFriendId === match.friend_id;
            return (
              <div key={match.friend_id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '12px',
                background: isFriendAccepted ? 'rgba(184,224,106,0.15)' : '#F8FAF8',
                border: isFriendAccepted ? '1.5px solid rgba(184,224,106,0.5)' : '1px solid transparent',
                transition: 'all 0.2s'
              }}>
                {/* Avatar */}
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'white',
                  fontFamily: "'DM Serif Display', serif",
                  flexShrink: 0,
                  background: 'linear-gradient(135deg, #4A7C59, #2D4A3E)',
                  border: '2px solid white',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
                }}>
                  {match.friend_name?.charAt(0) || '?'}
                </div>

                {/* Name + score */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontWeight: '600',
                    fontSize: '13px',
                    color: '#1A2B24',
                    marginBottom: '2px'
                  }}>
                    {match.friend_name}
                  </p>
                  <div style={{
                    background: 'rgba(184,224,106,0.2)',
                    color: '#4A7C59',
                    display: 'inline-block',
                    padding: '2px 6px',
                    borderRadius: '20px',
                    fontSize: '10px',
                    fontWeight: '600'
                  }}>
                    {Math.round(match.score * 100)}% Match
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={() => onAccept(rec.id, match.friend_id)}
                    style={{
                      borderRadius: '10px',
                      padding: '8px 12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      border: 'none',
                      fontFamily: "'DM Sans', sans-serif",
                      background: isFriendAccepted ? '#B8E06A' : '#2D4A3E',
                      color: isFriendAccepted ? '#2D4A3E' : '#B8E06A',
                      transition: 'all 0.2s'
                    }}
                  >
                    {isFriendAccepted ? '✓' : 'Accept'}
                  </button>
                  <button
                    onClick={() => {
                      if (match.friend_id && onMessage) {
                        onMessage(match.friend_id, match.friend_name);
                      }
                    }}
                    style={{
                      borderRadius: '10px',
                      padding: '8px 10px',
                      fontSize: '11px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      border: '1.5px solid rgba(45,74,62,0.18)',
                      fontFamily: "'DM Sans', sans-serif",
                      background: 'white',
                      color: '#2D4A3E'
                    }}
                  >
                    💬
                  </button>
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
