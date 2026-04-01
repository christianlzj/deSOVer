import React from 'react';

export default function WeeklySummary({ data }) {
  if (!data) return null;
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <h2 className="text-gray-500 text-sm font-semibold mb-1">WEEK OF {data.week_start} – {data.week_end}</h2>
      <h1 className="text-xl font-bold mb-3">Your Mobility This Week</h1>
      <div className="flex justify-between text-center mb-4">
        <div>
          <div className="text-2xl font-bold">{data.mode_share.sov}%</div>
          <div className="text-xs text-gray-500">SOV</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{data.mode_share.carpool}%</div>
          <div className="text-xs text-gray-500">Carpool</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{data.mode_share.transit}%</div>
          <div className="text-xs text-gray-500">Transit</div>
        </div>
      </div>
      <div className="mt-3">
        <span className="text-3xl font-bold mr-2">{data.total_trips}</span>
        <span className="text-gray-500 text-sm">trips total this week</span>
      </div>
      <div className="text-lg font-semibold mt-1">{data.total_co2_lbs} lbs CO₂ this week</div>
      <div className="text-green-600 text-sm mt-3">
        You could reduce {data.potential_co2_reduction_lbs} lbs CO₂ by
      </div>
    </div>
  );
}