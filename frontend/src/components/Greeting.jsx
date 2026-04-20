import React from 'react';

export default function Greeting({ userName }) {
  // Determine greeting based on time of day
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #2D4A3E 0%, #3D6352 100%)',
        borderRadius: '20px',
        padding: '20px 18px',
        marginBottom: '16px',
        border: '1px solid rgba(184, 224, 106, 0.2)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '6px',
        }}
      >
        <span
          style={{
            fontSize: '24px',
          }}
        >
          👋
        </span>
        <div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: '500',
              color: 'rgba(245, 240, 232, 0.7)',
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '0.3px',
            }}
          >
            {getTimeGreeting()}
          </div>
          <div
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: '28px',
              fontWeight: '700',
              color: '#B8E06A',
              lineHeight: '1.1',
              marginTop: '2px',
            }}
          >
            {userName || 'User'}
          </div>
        </div>
      </div>
      <div
        style={{
          fontSize: '11px',
          color: 'rgba(245, 240, 232, 0.5)',
          fontFamily: "'DM Sans', sans-serif",
          marginTop: '8px',
        }}
      >
        Let's make your commute greener ✨
      </div>
    </div>
  );
}
