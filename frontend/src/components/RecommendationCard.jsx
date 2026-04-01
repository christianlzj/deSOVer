import React, { useState } from 'react';
import { FaCar, FaBus } from 'react-icons/fa';

const formatDays = (daysArray) => {
  if (!daysArray || daysArray.length === 0) return '';
  const shortDays = daysArray.map(d => d.slice(0, 3));
  return shortDays.join(' · ');
};

export default function RecommendationCard({ rec }) {
  const isCarpool = rec.type === 'carpool';
  const Icon = isCarpool ? FaCar : FaBus;
  const [acceptedFriendId, setAcceptedFriendId] = useState(null);
  const [acceptedTransit, setAcceptedTransit] = useState(false);

  const handleAcceptFriend = (friendId) => {
    setAcceptedFriendId(friendId);
    // TODO: POST to backend
  };

  const handleAcceptTransit = () => {
    setAcceptedTransit(true);
    // TODO: POST to backend
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="text-blue-500" />
        <span className="font-semibold capitalize">{rec.type}</span>
      </div>

      <div className="mb-2">
        <div className="text-sm text-gray-500">Suggested departure</div>
        <div className="font-bold text-lg">{rec.suggested_departure}</div>
        <div className="text-xs text-gray-500 mt-1">
          {formatDays(rec.days)} · Recurring
        </div>
      </div>

      {isCarpool && rec.matches && (
        <div className="mt-3">
          <div className="text-sm font-semibold mb-2">Also on this route</div>
          {rec.matches.map((match) => {
            const isAccepted = acceptedFriendId === match.friend_id;
            return (
              <div
                key={match.friend_id}
                className={`flex justify-between items-center py-2 px-2 rounded-lg mb-1 transition ${
                  isAccepted ? 'bg-green-100 border-l-4 border-green-500' : ''
                }`}
              >
                <div className="flex-1">
                  <div className="font-medium">{match.friend_name}</div>
                  <div className="text-xs text-gray-500">{formatDays(match.days)}</div>
                </div>
                <div className="text-right">
                  <div className="text-green-600 text-sm font-medium mb-1">
                    {Math.round(match.score * 100)}% match
                  </div>
                  <div className="flex gap-2">
                    {!isAccepted ? (
                      <button
                        onClick={() => handleAcceptFriend(match.friend_id)}
                        className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium hover:bg-green-700 transition"
                      >
                        Accept
                      </button>
                    ) : (
                      <span className="text-green-600 text-sm font-medium">✓ Accepted</span>
                    )}
                    <button
                      onClick={() => {/* TODO: implement messaging */}}
                      className="border border-gray-300 px-3 py-1 rounded-full text-xs font-medium hover:bg-gray-50"
                    >
                      Message
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isCarpool && rec.transit_details && (
        <div className="mt-2 text-sm text-gray-700">
          <div>🚏 Board: {rec.transit_details.board_stop}</div>
          <div>🚏 Alight: {rec.transit_details.alight_stop}</div>
          <div className="mt-1 text-gray-500">
            {rec.transit_details.walk_to_stop_min} min walk → {rec.transit_details.ride_min} min ride → {rec.transit_details.walk_from_stop_min} min walk
          </div>
          <div className="mt-3 flex justify-end">
            {!acceptedTransit ? (
              <button
                onClick={handleAcceptTransit}
                className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-700 transition"
              >
                Accept
              </button>
            ) : (
              <span className="text-green-600 text-sm font-medium">✓ Accepted</span>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 text-green-600 text-sm font-medium">
        Save {rec.co2_saved_lbs} lbs CO₂
        {isCarpool && rec.fuel_saved_dollars && ` · ≈${rec.fuel_saved_dollars}¢ fuel saved / trip`}
      </div>
    </div>
  );
}