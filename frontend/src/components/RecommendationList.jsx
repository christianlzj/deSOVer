import React from 'react';
import RecommendationCard from './RecommendationCard';

export default function RecommendationList({ recommendations }) {
  if (!recommendations || recommendations.length === 0) {
    return <div className="text-center text-gray-500 py-8">No recommendations yet.</div>;
  }
  return (
    <div className="mt-4">
      <h2 className="text-lg font-bold mb-2">Move Match</h2>
      {recommendations.map((rec) => (
        <RecommendationCard key={rec.id} rec={rec} />
      ))}
    </div>
  );
}