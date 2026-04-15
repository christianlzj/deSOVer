import React, { useState } from 'react';
import RecommendationCard from './RecommendationCard';

const formatDays = (daysArray) => {
  if (!daysArray || daysArray.length === 0) return '';
  return daysArray.map(d => d.slice(0, 3)).join(' · ');
};

function SubTabs({ active, onChange, suggestions, activeItems }) {
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
      {[
        { key: 'suggestions', label: `Suggestions${suggestions > 0 ? ` (${suggestions})` : ''}` },
        { key: 'active', label: `Active${activeItems > 0 ? ` (${activeItems})` : ''}` },
      ].map(tab => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            background: active === tab.key ? '#2D4A3E' : '#F2F6F3',
            color: active === tab.key ? '#B8E06A' : '#4A7C59',
            transition: 'all 0.2s',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function ActiveCarpoolCard({ match, rec, onEnd, onMessage, processingId }) {
  const isEnding = processingId === match.recommendation_id;
  return (
    <div style={{
      background: 'white',
      borderRadius: '14px',
      padding: '14px 16px',
      boxShadow: '0 2px 8px rgba(45,74,62,0.07)',
      border: '1.5px solid rgba(184,224,106,0.4)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      opacity: isEnding ? 0.6 : 1,
      transition: 'opacity 0.2s',
    }}>
      <div style={{
        width: '38px', height: '38px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #4A7C59, #2D4A3E)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '15px', fontWeight: '700', color: 'white',
        fontFamily: "'DM Serif Display', serif", flexShrink: 0,
        border: '2px solid white', boxShadow: '0 1px 4px rgba(0,0,0,0.15)'
      }}>
        {match.friend_name?.charAt(0) || '?'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: '600', fontSize: '13px', color: '#1A2B24', marginBottom: '2px' }}>
          {match.friend_name}
        </p>
        <p style={{ fontSize: '11px', color: '#8A9A8E' }}>
          {formatDays(rec.days)} · {rec.suggested_departure} · {rec.co2_saved_lbs} lbs CO₂
        </p>
      </div>
      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
        <button
          onClick={() => onMessage && onMessage(match.friend_id, match.friend_name)}
          disabled={isEnding}
          style={{
            padding: '7px 10px', borderRadius: '10px', fontSize: '12px',
            border: '1.5px solid rgba(45,74,62,0.18)', background: 'white',
            color: '#2D4A3E', cursor: isEnding ? 'not-allowed' : 'pointer',
            fontFamily: "'DM Sans', sans-serif"
          }}
        >💬</button>
        <button
          onClick={() => !isEnding && onEnd(match.recommendation_id)}
          disabled={isEnding}
          style={{
            padding: '7px 10px', borderRadius: '10px', fontSize: '11px',
            fontWeight: '600', border: 'none',
            background: isEnding ? '#ccc' : '#FFE8E8',
            color: isEnding ? '#888' : '#C45C3A',
            cursor: isEnding ? 'not-allowed' : 'pointer',
            fontFamily: "'DM Sans', sans-serif"
          }}
        >{isEnding ? '...' : 'End'}</button>
      </div>
    </div>
  );
}

function ActiveTransitCard({ rec, onEnd, processingId }) {
  const isEnding = processingId === rec.id;
  const d = rec.transit_details;
  const routeName = d.route_short_name
    ? `${d.route_short_name} - ${d.route_long_name}`
    : d.route_long_name;
  return (
    <div style={{
      background: 'white',
      borderRadius: '14px',
      padding: '14px 16px',
      boxShadow: '0 2px 8px rgba(45,74,62,0.07)',
      border: '1.5px solid rgba(184,224,106,0.4)',
      opacity: isEnding ? 0.6 : 1,
      transition: 'opacity 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ fontSize: '14px' }}>🚌</span>
            <span style={{ fontWeight: '600', fontSize: '13px', color: '#1A2B24' }}>{routeName}</span>
          </div>
          <p style={{ fontSize: '11px', color: '#8A9A8E' }}>
            {d.departure_time} → {d.arrival_time} · {d.board_stop} → {d.alight_stop}
          </p>
          <p style={{ fontSize: '11px', color: '#8A9A8E', marginTop: '2px' }}>
            {rec.co2_saved_lbs} lbs CO₂ · ${rec.fuel_saved_dollars || 0} saved
          </p>
        </div>
        <button
          onClick={() => !isEnding && onEnd(rec.id)}
          disabled={isEnding}
          style={{
            padding: '7px 12px', borderRadius: '10px', fontSize: '11px',
            fontWeight: '600', border: 'none',
            background: isEnding ? '#ccc' : '#FFE8E8',
            color: isEnding ? '#888' : '#C45C3A',
            cursor: isEnding ? 'not-allowed' : 'pointer',
            fontFamily: "'DM Sans', sans-serif", flexShrink: 0
          }}
        >{isEnding ? '...' : 'End'}</button>
      </div>
    </div>
  );
}

export default function RecommendationList({ recommendations, type, processingId, onAccept, onEnd, onMessage }) {
  const [subTab, setSubTab] = useState('suggestions');

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <p className="text-sm text-gray-500">No recommendations yet.</p>
        <p className="text-xs text-gray-400 mt-2">Check back soon for personalized carpool and transit matches!</p>
      </div>
    );
  }

  if (!type) {
    return (
      <div>
        <div className="px-1 mb-4">
          <h2 className="text-xs font-bold tracking-widest text-moss uppercase">Recommendations</h2>
        </div>
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} onMessage={onMessage} />
          ))}
        </div>
      </div>
    );
  }

  const filteredRecs = recommendations.filter(rec => rec.type === type);

  if (filteredRecs.length === 0) {
    const typeLabel = type === 'carpool' ? 'Carpool' : 'Transit';
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <p className="text-sm text-gray-500">No {typeLabel} options available.</p>
        <p className="text-xs text-gray-400 mt-2">Check back soon for new options!</p>
      </div>
    );
  }

  const headers = { carpool: 'Potential carpools detected', transit: 'Transit alternatives' };

  // ── Carpool ──────────────────────────────────────────────
  if (type === 'carpool') {
    // Show a group in Suggestions as long as it has at least one non-accepted friend left.
    // The card itself hides accepted friends (they're in Active) and blocks others if trip is active.
    const suggestionGroups = filteredRecs.filter(rec =>
      rec.matches?.some(m => m.status !== 'accepted')
    );
    const activeMatches = [];
    filteredRecs.forEach(rec => {
      rec.matches?.forEach(m => {
        if (m.status === 'accepted') activeMatches.push({ match: m, rec });
      });
    });

    return (
      <div>
        <div className="px-1 mb-4">
          <h2 className="text-xs font-bold tracking-widest text-moss uppercase">{headers.carpool}</h2>
        </div>
        <SubTabs
          active={subTab}
          onChange={setSubTab}
          suggestions={suggestionGroups.length}
          activeItems={activeMatches.length}
        />

        {subTab === 'suggestions' && (
          suggestionGroups.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#8A9A8E', fontSize: '14px' }}>
              All carpools accepted!<br />
              <span style={{ fontSize: '12px' }}>Check the Active tab to manage them.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {suggestionGroups.map(rec => (
                <RecommendationCard
                  key={rec.id}
                  rec={rec}
                  processingId={processingId}
                  onAccept={onAccept}
                  onMessage={onMessage}
                />
              ))}
            </div>
          )
        )}

        {subTab === 'active' && (
          activeMatches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px', color: '#8A9A8E', fontSize: '14px' }}>
              No active carpools yet.<br />
              <span style={{ fontSize: '12px' }}>Accept a suggestion to start one.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {activeMatches.map(({ match, rec }) => (
                <ActiveCarpoolCard
                  key={match.recommendation_id}
                  match={match}
                  rec={rec}
                  processingId={processingId}
                  onEnd={onEnd}
                  onMessage={onMessage}
                />
              ))}
            </div>
          )
        )}
      </div>
    );
  }

  // ── Transit ──────────────────────────────────────────────
  const activeTransit = filteredRecs.filter(rec => rec.status === 'accepted');
  const suggestedTransit = filteredRecs.filter(rec => rec.status !== 'accepted');

  return (
    <div>
      <div className="px-1 mb-4">
        <h2 className="text-xs font-bold tracking-widest text-moss uppercase">{headers.transit}</h2>
      </div>
      <SubTabs
        active={subTab}
        onChange={setSubTab}
        suggestions={suggestedTransit.length}
        activeItems={activeTransit.length}
      />

      {subTab === 'suggestions' && (
        suggestedTransit.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#8A9A8E', fontSize: '14px' }}>
            All transit options accepted!<br />
            <span style={{ fontSize: '12px' }}>Check the Active tab to manage them.</span>
          </div>
        ) : (
          <div className="space-y-4">
            {suggestedTransit.map(rec => (
              <RecommendationCard
                key={rec.id}
                rec={rec}
                isAccepted={false}
                processingId={processingId}
                onAccept={() => onAccept(rec.id)}
                onMessage={onMessage}
              />
            ))}
          </div>
        )
      )}

      {subTab === 'active' && (
        activeTransit.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#8A9A8E', fontSize: '14px' }}>
            No active transit yet.<br />
            <span style={{ fontSize: '12px' }}>Accept a suggestion to start one.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {activeTransit.map(rec => (
              <ActiveTransitCard key={rec.id} rec={rec} processingId={processingId} onEnd={onEnd} />
            ))}
          </div>
        )
      )}
    </div>
  );
}
