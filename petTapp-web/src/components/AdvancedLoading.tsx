import React from 'react';

const AdvancedLoading: React.FC = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background backdrop-blur-sm z-50">
      <svg
        width="300"
        height="100"
        viewBox="0 0 300 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6">
              <animate
                attributeName="stop-color"
                values="#3b82f6; #8b5cf6; #ec4899; #3b82f6"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" stopColor="#8b5cf6">
              <animate
                attributeName="stop-color"
                values="#8b5cf6; #ec4899; #3b82f6; #8b5cf6"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#ec4899">
              <animate
                attributeName="stop-color"
                values="#ec4899; #3b82f6; #8b5cf6; #ec4899"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
        </defs>

        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fill="url(#gradient)"
          fillOpacity="0"
          stroke="url(#gradient)"
          strokeWidth="2"
          fontSize="48"
          fontWeight="700"
          fontFamily="Outfit, system-ui, -apple-system, sans-serif"
          letterSpacing="-0.02em"
          strokeDasharray="500"
          strokeDashoffset="500"
        >
          PetTapp
          <animate
            attributeName="stroke-dashoffset"
            values="500;0;0;500"
            keyTimes="0;0.2;0.5;1"
            dur="5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fill-opacity"
            values="0;0;1;1;0;0"
            keyTimes="0;0.15;0.25;0.45;0.55;1"
            dur="5s"
            repeatCount="indefinite"
          />
        </text>
      </svg>
    </div>
  );
};

export default AdvancedLoading;
