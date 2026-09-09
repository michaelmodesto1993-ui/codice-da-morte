import React from 'react';
import { MarkerColor } from '../types/game';
import { useCustomCardArt, markCardArtFailed } from '../utils/customCardArt';

interface GothicWaxSealProps {
  color: MarkerColor;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  className?: string;
  glow?: boolean;
  pulse?: boolean;
}

export const GothicWaxSeal: React.FC<GothicWaxSealProps> = ({
  color,
  size = 'md',
  className = '',
  glow = true,
  pulse = false,
}) => {
  // Size classes
  const sizeMap: Record<string, string> = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
    custom: 'w-full h-full',
  };

  const sizeClass = sizeMap[size] || sizeMap.md;

  // Check if custom seal image was uploaded by user
  const lookupIds = [
    `seal_${color}`,
    `marcador_${color}`,
    `cera_${color}`,
    `wax_${color}`,
    `selo_${color}`,
    `seal_${color.toLowerCase()}`,
  ];
  const customSealImg = useCustomCardArt(lookupIds);

  // Glow filters based on wax seal color
  const glowShadow = glow
    ? color === 'vermelho'
      ? 'drop-shadow-[0_0_8px_rgba(220,38,38,0.75)]'
      : color === 'azul'
      ? 'drop-shadow-[0_0_8px_rgba(37,99,235,0.75)]'
      : color === 'dourado'
      ? 'drop-shadow-[0_0_8px_rgba(234,179,8,0.75)]'
      : color === 'cinza'
      ? 'drop-shadow-[0_0_6px_rgba(156,163,175,0.6)]'
      : 'drop-shadow-[0_0_8px_rgba(82,82,91,0.7)]'
    : '';

  if (customSealImg) {
    return (
      <div
        className={`relative select-none flex items-center justify-center shrink-0 ${sizeClass} ${glowShadow} ${
          pulse ? 'animate-pulse' : ''
        } ${className}`}
      >
        <img
          src={customSealImg}
          alt={`Selo ${color}`}
          onError={() => {
            markCardArtFailed(`seal_${color}`);
            markCardArtFailed(customSealImg);
          }}
          className="w-full h-full object-contain pointer-events-none drop-shadow-md"
        />
      </div>
    );
  }

  // Organic wax seal SVG path representing the hand-pressed wax edge
  const waxBorderPath =
    'M50 4 C64 4, 76 9, 85 18 C94 27, 98 40, 96 54 C94 68, 88 80, 77 89 C66 98, 52 98, 38 95 C24 92, 12 83, 6 70 C0 57, 2 42, 9 30 C16 18, 32 4, 50 4 Z';

  return (
    <div
      className={`relative select-none flex items-center justify-center shrink-0 ${sizeClass} ${glowShadow} ${
        pulse ? 'animate-pulse' : ''
      } ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full overflow-visible"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* ================= RED WAX (SKULL) ================= */}
          <radialGradient id="red_wax_bg" cx="42%" cy="38%" r="58%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="35%" stopColor="#b91c1c" />
            <stop offset="75%" stopColor="#7f1d1d" />
            <stop offset="100%" stopColor="#450a0a" />
          </radialGradient>
          <linearGradient id="red_wax_rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fca5a5" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#991b1b" />
            <stop offset="100%" stopColor="#2e0505" />
          </linearGradient>

          {/* ================= BLUE WAX (PENTAGRAM) ================= */}
          <radialGradient id="blue_wax_bg" cx="42%" cy="38%" r="58%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="35%" stopColor="#1d4ed8" />
            <stop offset="75%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#08142c" />
          </radialGradient>
          <linearGradient id="blue_wax_rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#030712" />
          </linearGradient>

          {/* ================= BLACK/CHARCOAL WAX (LUPA) ================= */}
          <radialGradient id="black_wax_bg" cx="42%" cy="38%" r="58%">
            <stop offset="0%" stopColor="#52525b" />
            <stop offset="35%" stopColor="#27272a" />
            <stop offset="75%" stopColor="#18181b" />
            <stop offset="100%" stopColor="#09090b" />
          </radialGradient>
          <linearGradient id="black_wax_rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a1a1aa" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#3f3f46" />
            <stop offset="100%" stopColor="#000000" />
          </linearGradient>

          {/* ================= GOLD WAX (EYE) ================= */}
          <radialGradient id="gold_wax_bg" cx="42%" cy="38%" r="58%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#eab308" />
            <stop offset="75%" stopColor="#a16207" />
            <stop offset="100%" stopColor="#451a03" />
          </radialGradient>
          <linearGradient id="gold_wax_rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#291205" />
          </linearGradient>

          {/* ================= SILVER/GRAY WAX (QUESTION MARK) ================= */}
          <radialGradient id="silver_wax_bg" cx="42%" cy="38%" r="58%">
            <stop offset="0%" stopColor="#f3f4f6" />
            <stop offset="35%" stopColor="#9ca3af" />
            <stop offset="75%" stopColor="#4b5563" />
            <stop offset="100%" stopColor="#1f2937" />
          </radialGradient>
          <linearGradient id="silver_wax_rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#6b7280" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>

          {/* Common Embossed Shading Filter */}
          <filter id="wax_emboss" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="-1" dy="-1" stdDeviation="0.8" floodColor="#ffffff" floodOpacity="0.35" />
            <feDropShadow dx="1.5" dy="2" stdDeviation="1.2" floodColor="#000000" floodOpacity="0.85" />
          </filter>
        </defs>

        {/* 1. Outer Wax Drop / Irregular Pressed Outer Edge */}
        <path
          d={waxBorderPath}
          fill={
            color === 'vermelho'
              ? 'url(#red_wax_bg)'
              : color === 'azul'
              ? 'url(#blue_wax_bg)'
              : color === 'dourado'
              ? 'url(#gold_wax_bg)'
              : color === 'cinza'
              ? 'url(#silver_wax_bg)'
              : 'url(#black_wax_bg)'
          }
          stroke={
            color === 'vermelho'
              ? 'url(#red_wax_rim)'
              : color === 'azul'
              ? 'url(#blue_wax_rim)'
              : color === 'dourado'
              ? 'url(#gold_wax_rim)'
              : color === 'cinza'
              ? 'url(#silver_wax_rim)'
              : 'url(#black_wax_rim)'
          }
          strokeWidth="3.5"
          filter="drop-shadow(0 3px 6px rgba(0,0,0,0.85))"
        />

        {/* 2. Inner Circular Pressed Bevel Cavity */}
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="none"
          stroke="#000000"
          strokeWidth="2.5"
          opacity="0.55"
        />
        <circle
          cx="49"
          cy="49"
          r="35"
          fill="none"
          stroke="#ffffff"
          strokeWidth="1.2"
          opacity="0.25"
        />

        {/* 3. Deep Center Well */}
        <circle
          cx="50"
          cy="50"
          r="33"
          fill={
            color === 'vermelho'
              ? '#5b0e0e'
              : color === 'azul'
              ? '#0f244a'
              : color === 'dourado'
              ? '#593206'
              : color === 'cinza'
              ? '#374151'
              : '#111113'
          }
          opacity="0.5"
        />

        {/* 4. EMBOSSED ICON / SYMBOL ACCORDING TO COLOR */}
        {/* ================= RED WAX: HIGH-DETAIL SKULL ================= */}
        {color === 'vermelho' && (
          <g filter="url(#wax_emboss)">
            {/* Upper Cranium */}
            <path
              d="M32 46 C32 30, 40 22, 50 22 C60 22, 68 30, 68 46 C68 54, 64 58, 62 60 L62 68 C62 72, 60 74, 56 74 L44 74 C40 74, 38 72, 38 68 L38 60 C36 58, 32 54, 32 46 Z"
              fill="#7b0a0a"
              stroke="#ef4444"
              strokeWidth="2"
            />
            {/* Eye Sockets - Hollowed Out */}
            <path d="M38 46 C38 40, 46 40, 46 46 C46 52, 38 52, 38 46 Z" fill="#2d0505" />
            <path d="M54 46 C54 40, 62 40, 62 46 C62 52, 54 52, 54 46 Z" fill="#2d0505" />
            {/* Nasal Cavity - Triangular */}
            <path d="M47 56 L50 50 L53 56 Z" fill="#2d0505" />
            {/* Jaw / Teeth detail */}
            <rect x="42" y="66" width="16" height="6" rx="1" fill="#5b0e0e" opacity="0.6" />
            <line x1="46" y1="66" x2="46" y2="74" stroke="#2d0505" strokeWidth="1.2" />
            <line x1="50" y1="66" x2="50" y2="74" stroke="#2d0505" strokeWidth="1.2" />
            <line x1="54" y1="66" x2="54" y2="74" stroke="#2d0505" strokeWidth="1.2" />
          </g>
        )}

        {/* ================= BLUE WAX: 8-POINTED COMPASS STAR ================= */}
        {color === 'azul' && (
          <g filter="url(#wax_emboss)">
            <circle cx="50" cy="50" r="28" fill="none" stroke="#60a5fa" strokeWidth="1.5" opacity="0.4" />
            {/* Main Compass Points */}
            <path d="M50 20 L54 46 L80 50 L54 54 L50 80 L46 54 L20 50 L46 46 Z" fill="#1e40af" stroke="#93c5fd" strokeWidth="2" />
            {/* Sub-Points */}
            <path d="M50 32 L52 48 L68 50 L52 52 L50 68 L48 52 L32 50 L48 48 Z" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="1.2" transform="rotate(45 50 50)" />
            {/* Center Hub */}
            <circle cx="50" cy="50" r="5" fill="#1e3a8a" stroke="#93c5fd" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="2" fill="#bfdbfe" />
          </g>
        )}

        {/* ================= BLACK WAX: MAGNIFYING GLASS ================= */}
        {color === 'preto' && (
          <g filter="url(#wax_emboss)">
            {/* Magnifying Glass Lens Outer Ring */}
            <circle
              cx="45"
              cy="43"
              r="17"
              fill="#18181b"
              stroke="#d4d4d8"
              strokeWidth="2.8"
            />
            <circle
              cx="45"
              cy="43"
              r="13"
              fill="#09090b"
              stroke="#71717a"
              strokeWidth="1"
            />
            {/* Glass Glint Reflection Arc */}
            <path
              d="M37 36 A 11 11 0 0 1 52 35"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.6"
              strokeLinecap="round"
              opacity="0.85"
            />
            {/* Metal Handle with Grip Bevel */}
            <line
              x1="57"
              y1="55"
              x2="73"
              y2="71"
              stroke="#e4e4e7"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <line
              x1="57"
              y1="55"
              x2="73"
              y2="71"
              stroke="#27272a"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* ================= GOLD WAX: ALL-SEEING EYE ================= */}
        {color === 'dourado' && (
          <g filter="url(#wax_emboss)">
            {/* Eyelids / Almond Shape */}
            <path
              d="M24 50 Q50 30 76 50 Q50 70 24 50 Z"
              fill="#854d0e"
              stroke="#fef08a"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Iris Outer Circle */}
            <circle cx="50" cy="50" r="11" fill="#ca8a04" stroke="#fef9c3" strokeWidth="1.5" />
            {/* Pupil */}
            <circle cx="50" cy="50" r="5.5" fill="#291205" />
            {/* Specular Highlight on Pupil */}
            <circle cx="48" cy="48" r="2" fill="#ffffff" />
            {/* Arcane Ray Accents Above and Below */}
            <line x1="50" y1="28" x2="50" y2="24" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="38" y1="31" x2="36" y2="27" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="62" y1="31" x2="64" y2="27" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        )}

        {/* ================= SILVER/GRAY WAX: QUESTION MARK ================= */}
        {color === 'cinza' && (
          <g filter="url(#wax_emboss)">
            {/* Question Mark Hook and Stem */}
            <path
              d="M39 39 C39 31, 44 26, 50 26 C57 26, 62 31, 62 38 C62 44, 57 48, 52 51 L52 57"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M39 39 C39 31, 44 26, 50 26 C57 26, 62 31, 62 38 C62 44, 57 48, 52 51 L52 57"
              fill="none"
              stroke="#1f2937"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            {/* Question Mark Dot */}
            <circle cx="52" cy="67" r="3.2" fill="#f3f4f6" stroke="#1f2937" strokeWidth="1" />
            <circle cx="51" cy="66" r="1" fill="#ffffff" />
          </g>
        )}
      </svg>
    </div>
  );
};
