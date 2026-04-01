import React from 'react';
import { GiSprout } from 'react-icons/gi';

export default function Sprout({ data }) {
  if (!data) return null;
  const { score, message } = data;

  let iconColor = '';
  let rotateClass = '';
  if (score >= 80) {
    iconColor = 'text-green-600';
    rotateClass = '';           // upright
  } else if (score >= 50) {
    iconColor = 'text-green-500';
    rotateClass = '';           // still upright, but lighter green
  } else if (score >= 25) {
    iconColor = 'text-yellow-600';
    rotateClass = 'rotate-6';    // slight tilt (wilt)
  } else {
    iconColor = 'text-gray-500';
    rotateClass = '-rotate-12';  // more wilted
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mt-4">
      <div className="flex items-center gap-3">
        <GiSprout className={`text-4xl transition-all ${iconColor} ${rotateClass}`} />
        <div>
          <div className="text-lg font-semibold">Sprout</div>
          <div className="text-sm text-gray-600">{message}</div>
        </div>
      </div>
    </div>
  );
}