import React from 'react';
import RecommendationCard from './RecommendationCard';

function getRouteKey(rec) {
  const r = rec.route;
  if (!r) return rec.id;
  return `${r.origin?.lat},${r.origin?.lon},${r.destination?.lat},${r.destination?.lon}`;
}

export default function RecommendationList({ recommendations, type, acceptedIds, onAccept, onMessage }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <p className="text-sm text-gray-500">No recommendations yet.</p>
        <p className="text-xs text-gray-400 mt-2">Check back soon for personalized carpool and transit matches!</p>
      </div>
    );
  }

  // Home view (no type specified) — show all as grouped cards
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

  // Filter by type
  const filteredRecs = recommendations.filter((rec) => rec.type === type);

  if (filteredRecs.length === 0) {
    const typeLabel = type === 'carpool' ? 'Carpool' : 'Transit';
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <p className="text-sm text-gray-500">No {typeLabel} options available.</p>
        <p className="text-xs text-gray-400 mt-2">Check back soon for new options!</p>
      </div>
    );
  }

  const headers = {
    carpool: 'Potential carpools detected',
    transit: 'Transit alternatives'
  };

  if (type === 'transit') {
    // Group transit options by route so user can accept one per route/trip
    const groups = {};
    filteredRecs.forEach((rec) => {
      const key = getRouteKey(rec);
      if (!groups[key]) groups[key] = { groupKey: key, options: [] };
      groups[key].options.push(rec);
    });
    const transitGroups = Object.values(groups);

    return (
      <div>
        <div className="px-1 mb-4">
          <h2 className="text-xs font-bold tracking-widest text-moss uppercase">{headers[type]}</h2>
        </div>
        <div className="space-y-4">
          {transitGroups.map((group) => (
            group.options.length === 1 ? (
              <RecommendationCard
                key={group.options[0].id}
                rec={group.options[0]}
                isAccepted={acceptedIds?.[group.groupKey] === group.options[0].id}
                onAccept={() => onAccept(group.groupKey, group.options[0].id)}
                onMessage={onMessage}
              />
            ) : (
              <div key={group.groupKey} style={{
                background: 'white',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 3px 16px rgba(45,74,62,0.09)',
                border: '1px solid rgba(45,74,62,0.06)',
                padding: '16px'
              }}>
                <p style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#8A9A8E',
                  marginBottom: '12px'
                }}>Choose one option for this trip</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {group.options.map((rec) => (
                    <RecommendationCard
                      key={rec.id}
                      rec={rec}
                      isAccepted={acceptedIds?.[group.groupKey] === rec.id}
                      onAccept={() => onAccept(group.groupKey, rec.id)}
                      onMessage={onMessage}
                      nested
                    />
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      </div>
    );
  }

  // Carpool — render each group card directly (don't expand into individual friend cards)
  return (
    <div>
      <div className="px-1 mb-4">
        <h2 className="text-xs font-bold tracking-widest text-moss uppercase">{headers[type]}</h2>
      </div>
      <div className="space-y-4">
        {filteredRecs.map((rec) => (
          <RecommendationCard
            key={rec.id}
            rec={rec}
            acceptedIds={acceptedIds}
            onAccept={onAccept}
            onMessage={onMessage}
          />
        ))}
      </div>
    </div>
  );
}
