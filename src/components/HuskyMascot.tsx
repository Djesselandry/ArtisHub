import React from 'react';

export type HuskyState = 'idle' | 'typing' | 'eyes-covered' | 'peeking' | 'processing' | 'success';

interface HuskyMascotProps {
  state: HuskyState;
  lookX?: number; // 0 to 100 representing email input progress
  className?: string;
}

export const HuskyMascot: React.FC<HuskyMascotProps> = ({
  state = 'idle',
  lookX = 0,
  className = 'w-32 h-32 mx-auto mb-4',
}) => {
  // Calculate pupil offset based on lookX (between -5 and +5 px)
  const pupilOffsetX = Math.max(-5, Math.min(5, (lookX - 25) * 0.2));
  const pupilOffsetY = state === 'typing' ? 2 : 0;

  // Left & Right eye coverage/visibility
  const leftEyeCovered = state === 'eyes-covered';
  // Peeking: Right eye opens slightly while left remains covered or vice versa
  const rightEyeCovered = state === 'eyes-covered' || (state === 'peeking' && false);
  const leftEyePeeking = state === 'peeking';

  return (
    <div className={`relative select-none transition-transform duration-500 hover:scale-105 ${className}`}>
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-[0_10px_25px_rgba(221,183,255,0.2)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="huskyFaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3d3d42" />
            <stop offset="100%" stopColor="#252528" />
          </linearGradient>
          <linearGradient id="huskyWhiteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#d5d5dc" />
          </linearGradient>
          <linearGradient id="pupilGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5de6ff" />
            <stop offset="100%" stopColor="#007799" />
          </linearGradient>
          <radialGradient id="earInnerGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffafd3" />
            <stop offset="100%" stopColor="#c76d99" />
          </radialGradient>
        </defs>

        {/* Ambient Glow behind Husky */}
        <circle cx="100" cy="100" r="75" fill="rgba(221,183,255,0.08)" filter="blur(10px)" />

        {/* Body / Shoulders */}
        <path
          d="M50 155 Q100 175 150 155 L160 195 Q100 205 40 195 Z"
          fill="url(#huskyFaceGrad)"
          stroke="#4d4354"
          strokeWidth="1.5"
        />
        {/* Chest Fur */}
        <path
          d="M75 160 Q100 185 125 160 L120 195 Q100 200 80 195 Z"
          fill="url(#huskyWhiteGrad)"
        />

        {/* Ears */}
        <g className="transition-transform duration-300 origin-[100px_100px]">
          {/* Left Ear */}
          <path
            d="M55 70 L30 18 L80 48 Z"
            fill="url(#huskyFaceGrad)"
            stroke="#1b1b1d"
            strokeWidth="2"
            className={`transition-all duration-300 origin-[55px_70px] ${
              state === 'processing' ? '-rotate-6' : state === 'success' ? 'rotate-3' : ''
            }`}
          />
          <path
            d="M52 64 L38 28 L72 50 Z"
            fill="url(#earInnerGrad)"
            opacity="0.85"
          />

          {/* Right Ear */}
          <path
            d="M145 70 L170 18 L120 48 Z"
            fill="url(#huskyFaceGrad)"
            stroke="#1b1b1d"
            strokeWidth="2"
            className={`transition-all duration-300 origin-[145px_70px] ${
              state === 'processing' ? 'rotate-6' : state === 'success' ? '-rotate-3' : ''
            }`}
          />
          <path
            d="M148 64 L162 28 L128 50 Z"
            fill="url(#earInnerGrad)"
            opacity="0.85"
          />
        </g>

        {/* Head Main Shape */}
        <circle cx="100" cy="102" r="58" fill="url(#huskyFaceGrad)" stroke="#4d4354" strokeWidth="1.5" />

        {/* White Face Markings (Mask) */}
        <path
          d="M100 48 Q142 48 148 94 Q148 142 100 150 Q52 142 52 94 Q58 48 100 48"
          fill="url(#huskyWhiteGrad)"
        />
        {/* Dark Forehead Stripe */}
        <path
          d="M93 48 L107 48 L103 82 L97 82 Z"
          fill="url(#huskyFaceGrad)"
          opacity="0.9"
        />

        {/* Eyes Container */}
        <g className="eyes">
          {/* Left Eye Sclera */}
          <circle cx="74" cy="94" r="13" fill="#ffffff" stroke="#2a2a2c" strokeWidth="1.5" />
          {/* Left Pupil */}
          {state !== 'success' ? (
            <g
              style={{
                transform: `translate(${pupilOffsetX}px, ${pupilOffsetY}px)`,
                transition: 'transform 0.15s ease-out',
              }}
            >
              <circle cx="74" cy="94" r="6.5" fill="url(#pupilGrad)" />
              <circle cx="72" cy="92" r="2.2" fill="#ffffff" />
              <circle cx="76" cy="96" r="1" fill="#ffffff" opacity="0.8" />
            </g>
          ) : (
            /* Happy Closed Arc Eye on Success */
            <path d="M64 94 Q74 84 84 94" fill="none" stroke="#201f21" strokeWidth="3.5" strokeLinecap="round" />
          )}

          {/* Right Eye Sclera */}
          <circle cx="126" cy="94" r="13" fill="#ffffff" stroke="#2a2a2c" strokeWidth="1.5" />
          {/* Right Pupil */}
          {state !== 'success' ? (
            <g
              style={{
                transform: `translate(${pupilOffsetX}px, ${pupilOffsetY}px)`,
                transition: 'transform 0.15s ease-out',
              }}
            >
              <circle cx="126" cy="94" r="6.5" fill="url(#pupilGrad)" />
              <circle cx="124" cy="92" r="2.2" fill="#ffffff" />
              <circle cx="128" cy="96" r="1" fill="#ffffff" opacity="0.8" />
            </g>
          ) : (
            /* Happy Closed Arc Eye on Success */
            <path d="M116 94 Q126 84 136 94" fill="none" stroke="#201f21" strokeWidth="3.5" strokeLinecap="round" />
          )}

          {/* Eyelids / Coverage */}
          {/* Left Eyelid */}
          <path
            d="M60 80 Q74 80 88 80 L88 108 Q74 108 60 108 Z"
            fill="#323136"
            className="transition-all duration-300 origin-top"
            style={{
              transform: leftEyeCovered ? 'scaleY(1)' : leftEyePeeking ? 'scaleY(0.4)' : 'scaleY(0)',
              opacity: leftEyeCovered || leftEyePeeking ? 1 : 0,
            }}
          />
          {/* Right Eyelid */}
          <path
            d="M112 80 Q126 80 140 80 L140 108 Q126 108 112 108 Z"
            fill="#323136"
            className="transition-all duration-300 origin-top"
            style={{
              transform: rightEyeCovered && !leftEyePeeking ? 'scaleY(1)' : leftEyePeeking ? 'scaleY(0)' : 'scaleY(0)',
              opacity: rightEyeCovered && !leftEyePeeking ? 1 : 0,
            }}
          />

          {/* Eyebrows */}
          <path
            d="M64 76 Q74 72 84 76"
            fill="none"
            stroke="#201f21"
            strokeWidth="3"
            strokeLinecap="round"
            className={`transition-all duration-300 ${
              state === 'processing' ? 'translate-y-1 rotate-6' : state === 'eyes-covered' ? 'translate-y-2' : ''
            }`}
          />
          <path
            d="M116 76 Q126 72 136 76"
            fill="none"
            stroke="#201f21"
            strokeWidth="3"
            strokeLinecap="round"
            className={`transition-all duration-300 ${
              state === 'processing' ? 'translate-y-1 -rotate-6' : state === 'eyes-covered' ? 'translate-y-2' : ''
            }`}
          />
        </g>

        {/* Husky Muzzle / Snout */}
        <ellipse cx="100" cy="126" rx="22" ry="16" fill="#f8f8fb" />
        
        {/* Cute Nose */}
        <path
          d="M93 118 Q100 115 107 118 Q107 125 100 128 Q93 125 93 118 Z"
          fill="#1c1b1f"
        />
        <ellipse cx="98" cy="118" rx="2.5" ry="1.2" fill="#ffffff" opacity="0.6" />

        {/* Mouth & Tongue */}
        {state === 'success' ? (
          <g>
            <path d="M88 127 Q100 144 112 127" fill="#620040" stroke="#1c1b1f" strokeWidth="2" />
            <path d="M94 133 Q100 144 106 133" fill="#ffafd3" />
          </g>
        ) : (
          <path
            d="M88 126 Q100 134 112 126"
            fill="none"
            stroke="#2a2a2c"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}

        {/* Blush Cheeks */}
        <circle cx="58" cy="116" r="6" fill="#ffafd3" opacity={state === 'success' ? '0.6' : '0.2'} />
        <circle cx="142" cy="116" r="6" fill="#ffafd3" opacity={state === 'success' ? '0.6' : '0.2'} />

        {/* Animated Paws covering eyes when password is focused! */}
        <g
          className="transition-all duration-300"
          style={{
            transform: state === 'eyes-covered' ? 'translateY(0px)' : 'translateY(70px)',
            opacity: state === 'eyes-covered' ? 1 : 0,
          }}
        >
          {/* Left Paw */}
          <g transform="translate(48, 72) rotate(15)">
            <ellipse cx="20" cy="20" rx="16" ry="13" fill="#e0e0e8" stroke="#353437" strokeWidth="2" />
            <circle cx="14" cy="13" r="3.5" fill="#353437" />
            <circle cx="20" cy="11" r="3.5" fill="#353437" />
            <circle cx="26" cy="13" r="3.5" fill="#353437" />
            <ellipse cx="20" cy="23" rx="7" ry="5" fill="#353437" />
          </g>

          {/* Right Paw */}
          <g transform="translate(112, 72) rotate(-15)">
            <ellipse cx="20" cy="20" rx="16" ry="13" fill="#e0e0e8" stroke="#353437" strokeWidth="2" />
            <circle cx="14" cy="13" r="3.5" fill="#353437" />
            <circle cx="20" cy="11" r="3.5" fill="#353437" />
            <circle cx="26" cy="13" r="3.5" fill="#353437" />
            <ellipse cx="20" cy="23" rx="7" ry="5" fill="#353437" />
          </g>
        </g>
      </svg>
    </div>
  );
};
