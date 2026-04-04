import React from 'react';
import RecommendationCard from './RecommendationCard';

export default function RecommendationList({ recommendations, type, acceptedId, onAccept }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
        <p className="text-sm text-gray-500">No recommendations yet.</p>
        <p className="text-xs text-gray-400 mt-2">Check back soon for personalized carpool and transit matches!</p>
      </div>
    );
  }

  // If no type specified, show all (from home view)
  if (!type) {
    // Expand carpool recommendations to show one card per match
    const expandedRecommendations = [];
    recommendations.forEach((rec) => {
      if (rec.type === 'carpool' && rec.matches && rec.matches.length > 0) {
        // Create a separate recommendation for each match
        rec.matches.forEach((match, idx) => {
          expandedRecommendations.push({
            ...rec,
            id: `${rec.id}-${match.friend_id}`,
            singleMatch: match,
            matchIndex: idx
          });
        });
      } else {
        expandedRecommendations.push(rec);
      }
    });

    return (
      <div>
        <div className="px-1 mb-4">
          <h2 className="text-xs font-bold tracking-widest text-moss uppercase">Recommendations</h2>
        </div>
        <div className="space-y-4">
          {expandedRecommendations.map((rec) => (
            <RecommendationCard key={rec.id} rec={rec} />
          ))}
        </div>
      </div>
    );
  }

  // Filter by type and expand if carpool
  let filteredRecs = recommendations.filter((rec) => rec.type === type);

  if (type === 'carpool') {
    const expandedRecommendations = [];
    filteredRecs.forEach((rec) => {
      if (rec.matches && rec.matches.length > 0) {
        rec.matches.forEach((match, idx) => {
          expandedRecommendations.push({
            ...rec,
            id: `${rec.id}-${match.friend_id}`,
            singleMatch: match,
            matchIndex: idx
          });
        });
      }
    });
    filteredRecs = expandedRecommendations;
  }

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

  return (
    <div>
      {type && (
        <div className="px-1 mb-4">
          <h2 className="text-xs font-bold tracking-widest text-moss uppercase">{headers[type]}</h2>
        </div>
      )}
      <div className="space-y-4">
        {filteredRecs.map((rec) => (
          <RecommendationCard
            key={rec.id}
            rec={rec}
            isAccepted={acceptedId === rec.id}
            onAccept={() => onAccept(rec.id)}
          />
        ))}
      </div>
    </div>
  );
}