import React, { useMemo } from 'react';
import { getRandomEquivalences, formatValue } from '../constants/co2Equivalences';

export default function Insights({ co2Lbs }) {
  // Memoize the selected equivalences so they don't change on every render
  // In a real app, you might want to change these based on time/date for consistency
  const selectedEquivalences = useMemo(() => {
    return getRandomEquivalences(3);
  }, []);

  const insights = selectedEquivalences.map((equiv) => ({
    ...equiv,
    value: equiv.calculate(co2Lbs),
  }));

  return (
    <div
      style={{
        backgroundColor: '#2D4A3E',
        borderRadius: '16px',
        padding: '24px 16px',
        marginTop: '16px',
      }}
    >
      {/* Header */}
      <div
        style={{
          fontSize: '13px',
          fontWeight: '600',
          color: '#B8E06A',
          letterSpacing: '1px',
          marginBottom: '20px',
          fontFamily: 'DM Sans',
        }}
      >
        {formatValue(co2Lbs)} LBS CO₂ IS LIKE…
      </div>

      {/* Insights Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '12px',
        }}
      >
        {insights.map((insight) => (
          <InsightCard
            key={insight.id}
            icon={insight.icon}
            value={insight.value}
            label={insight.value === 1 ? insight.singular : insight.plural}
            description={insight.description}
          />
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          fontSize: '11px',
          color: '#A4C9A0',
          marginTop: '16px',
          textAlign: 'center',
          fontFamily: 'DM Sans',
        }}
      >
        = {(co2Lbs * 0.453592).toFixed(2)} kg · {(co2Lbs * 0.453592 * 1000).toFixed(0)} metric tons CO₂
      </div>
    </div>
  );
}

function InsightCard({ icon, value, label, description }) {
  return (
    <div
      style={{
        backgroundColor: 'rgba(74, 124, 89, 0.4)',
        borderRadius: '12px',
        padding: '12px 8px',
        textAlign: 'center',
        border: '1px solid rgba(124, 184, 122, 0.2)',
      }}
    >
      {/* Icon */}
      <div
        style={{
          fontSize: '32px',
          marginBottom: '8px',
        }}
      >
        {icon}
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#B8E06A',
          marginBottom: '4px',
          fontFamily: 'DM Serif Display',
        }}
      >
        {formatValue(value)}
      </div>

      {/* Label + Description */}
      <div
        style={{
          fontSize: '10px',
          color: '#D4E8D4',
          lineHeight: '1.2',
          fontFamily: 'DM Sans',
        }}
      >
        <div>{label}</div>
        <div style={{ fontSize: '9px', color: '#A4C9A0', marginTop: '2px' }}>
          {description}
        </div>
      </div>
    </div>
  );
}
