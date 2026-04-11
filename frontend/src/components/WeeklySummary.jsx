import React from 'react';

export default function WeeklySummary({ data }) {
  if (!data) return null;

  const { mode_share, total_trips, total_co2_lbs, potential_co2_reduction_lbs } = data;
  
  // Get mode share percentages from data
  const sov = mode_share?.sov || 0;
  const carpool = mode_share?.carpool || 0;
  const transit = mode_share?.transit || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Mode Share Card */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '16px 18px',
        boxShadow: '0 2px 12px rgba(45,74,62,0.07)',
        border: '1px solid rgba(45,74,62,0.06)'
      }}>
        <p style={{
          fontSize: '10px',
          fontWeight: '600',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#4A7C59',
          marginBottom: '10px'
        }}>Mode Share</p>
        
        {/* Mode segments bar */}
        <div style={{
          display: 'flex',
          height: '10px',
          borderRadius: '8px',
          overflow: 'hidden',
          marginBottom: '10px',
          gap: '2px'
        }}>
          <div style={{ background: '#C45C3A', width: `${sov}%`, borderRadius: '6px' }}></div>
          <div style={{ background: '#E8C547', width: `${carpool}%`, borderRadius: '6px' }}></div>
          <div style={{ background: '#5B8FA8', width: `${transit}%`, borderRadius: '6px' }}></div>
        </div>

        {/* Mode legend */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#1A2B24' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#C45C3A', flexShrink: 0 }}></div>
            <span style={{ fontWeight: '700', fontSize: '13px' }}>{sov}%</span>
            <span style={{ color: '#8A9A8E' }}>SOV</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#1A2B24' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#E8C547', flexShrink: 0 }}></div>
            <span style={{ fontWeight: '700', fontSize: '13px' }}>{carpool}%</span>
            <span style={{ color: '#8A9A8E' }}>Carpool</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#1A2B24' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#5B8FA8', flexShrink: 0 }}></div>
            <span style={{ fontWeight: '700', fontSize: '13px' }}>{transit}%</span>
            <span style={{ color: '#8A9A8E' }}>Transit</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '13px 14px',
          border: '1px solid rgba(45,74,62,0.06)',
          boxShadow: '0 2px 8px rgba(45,74,62,0.05)'
        }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '24px', color: '#2D4A3E', fontWeight: 'bold', lineHeight: 1 }}>
            {total_trips}
          </div>
          <div style={{ fontSize: '11px', fontWeight: '400', color: '#4A7C59', marginTop: '3px' }}>trips</div>
          <div style={{ fontSize: '10.5px', color: '#8A9A8E', marginTop: '3px' }}>Total this week</div>
        </div>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '13px 14px',
          border: '1px solid rgba(45,74,62,0.06)',
          boxShadow: '0 2px 8px rgba(45,74,62,0.05)'
        }}>
          <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '24px', color: '#2D4A3E', fontWeight: 'bold', lineHeight: 1 }}>
            {total_co2_lbs}
          </div>
          <div style={{ fontSize: '11px', fontWeight: '400', color: '#4A7C59', marginTop: '3px' }}>lbs</div>
          <div style={{ fontSize: '10.5px', color: '#8A9A8E', marginTop: '3px' }}>CO₂ this week</div>
        </div>
      </div>

      {/* CO2 Equivalents */}
      <div style={{
        background: 'linear-gradient(135deg, #1A2B24 0%, #2D4A3E 100%)',
        borderRadius: '20px',
        padding: '13px 15px',
        border: '1px solid rgba(184,224,106,0.15)'
      }}>
        <p style={{
          fontSize: '10px',
          fontWeight: '600',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(184,224,106,0.7)',
          marginBottom: '9px'
        }}>
          {total_co2_lbs} lbs CO₂ is like…
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{
            flex: 1,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
            padding: '9px 6px',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ fontSize: '16px' }}>🌳</div>
            <div style={{ fontSize: '9.5px', color: 'rgba(245,240,232,0.7)', marginTop: '4px' }}>Seedlings</div>
          </div>
          <div style={{
            flex: 1,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
            padding: '9px 6px',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ fontSize: '16px' }}>🌲</div>
            <div style={{ fontSize: '9.5px', color: 'rgba(245,240,232,0.7)', marginTop: '4px' }}>Trees</div>
          </div>
          <div style={{
            flex: 1,
            background: 'rgba(255,255,255,0.06)',
            borderRadius: '12px',
            padding: '9px 6px',
            textAlign: 'center',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ fontSize: '16px' }}>⚡</div>
            <div style={{ fontSize: '9.5px', color: 'rgba(245,240,232,0.7)', marginTop: '4px' }}>Energy</div>
          </div>
        </div>
        <div style={{
          marginTop: '9px',
          fontSize: '9.5px',
          color: 'rgba(245,240,232,0.3)',
          textAlign: 'center',
          letterSpacing: '0.03em'
        }}>
          = {(total_co2_lbs / 2.205).toFixed(1)} kg · {(total_co2_lbs / 2.205 / 1000).toFixed(4)} metric tons CO₂
        </div>
      </div>

      {/* Tip Section */}
      <div style={{
        background: 'linear-gradient(135deg, #2D4A3E 0%, #3D6352 100%)',
        borderRadius: '18px',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px'
      }}>
        <div style={{ fontSize: '20px', flexShrink: 0, marginTop: '1px' }}>💡</div>
        <div>
          <p style={{
            fontSize: '12.5px',
            color: 'rgba(245,240,232,0.9)',
            lineHeight: '1.5'
          }}>
            You could reduce <span style={{ color: '#B8E06A', fontWeight: '600' }}>{potential_co2_reduction_lbs} lbs CO₂</span> by carpooling with <span style={{ color: '#B8E06A', fontWeight: '600' }}>friends on recurring routes</span>
          </p>
        </div>
      </div>
    </div>
  );
}