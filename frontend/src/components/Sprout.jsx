import React from 'react';

export default function Sprout({ data }) {
  if (!data) return null;
  
  const { score, message } = data;
  const growthPercent = Math.min(score / 100 * 100, 100);

  let plantColor = '#8A9A8E';
  if (score >= 80) plantColor = '#7DB87A';
  else if (score >= 50) plantColor = '#B8E06A';
  else if (score >= 25) plantColor = '#E8C547';

  return (
    <div style={{
      background: 'linear-gradient(160deg, #EDF5E8 0%, #D4E8D4 100%)',
      borderRadius: '20px',
      padding: '16px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      border: '1px solid rgba(74,124,89,0.15)'
    }}>
      <div style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0 }}>
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '64px', height: '64px' }}>
          <g>
            {/* Stem */}
            <path d="M32 50 Q30 40 32 30 Q33 20 32 10" stroke={plantColor} strokeWidth="2.5" fill="none" strokeLinecap="round" />
            {/* Left leaf */}
            <path d="M32 25 Q20 23 16 15" stroke={plantColor} strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M16 15 Q18 22 20 28" stroke={plantColor} strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Right leaf */}
            <path d="M32 35 Q45 35 50 28" stroke={plantColor} strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M50 28 Q48 20 45 15" stroke={plantColor} strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Soil */}
            <ellipse cx="32" cy="52" rx="14" ry="6" fill={plantColor} opacity="0.2" />
          </g>
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <h3 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: '15px',
          color: '#2D4A3E',
          fontWeight: 'bold',
          marginBottom: '4px'
        }}>
          Sprout
        </h3>
        <p style={{
          fontSize: '11.5px',
          color: '#4A7C59',
          lineHeight: '1.4'
        }}>
          {message}
        </p>
        <div style={{
          height: '5px',
          background: 'rgba(74,124,89,0.15)',
          borderRadius: '4px',
          marginTop: '8px',
          overflow: 'hidden'
        }}>
          <div
            style={{
              height: '100%',
              width: `${growthPercent}%`,
              background: 'linear-gradient(90deg, #4A7C59, #B8E06A)',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}