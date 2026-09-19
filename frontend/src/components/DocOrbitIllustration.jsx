export default function DocOrbitIllustration() {
  return (
    <svg viewBox="0 0 420 320" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="docGradA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#33291d" />
          <stop offset="100%" stopColor="#1c1712" />
        </linearGradient>
        <linearGradient id="docGradB" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e8cd9a" />
          <stop offset="100%" stopColor="#c9925a" />
        </linearGradient>
      </defs>

      <ellipse
        cx="210"
        cy="160"
        rx="185"
        ry="120"
        stroke="#c9925a"
        strokeOpacity="0.45"
        strokeWidth="1.2"
        transform="rotate(-18 210 160)"
      />
      <circle cx="368" cy="80" r="4.5" fill="#d4a574" transform="rotate(-18 210 160)" />
      <circle cx="60" cy="150" r="4.5" fill="#d4a574" />
      <circle cx="255" cy="290" r="4" fill="#d4a574" />

      {/* Back document */}
      <g transform="translate(120,55) rotate(-8)">
        <rect x="0" y="0" width="150" height="200" rx="14" fill="url(#docGradA)" stroke="#453a2c" strokeWidth="1" />
        {[40, 62, 84, 106, 128, 150].map((y, i) => (
          <rect key={i} x="24" y={y} width={i % 2 === 0 ? 100 : 76} height="6" rx="3" fill="#4a3d2c" />
        ))}
      </g>

      {/* Front document (highlighted) */}
      <g transform="translate(165,90) rotate(6)">
        <rect x="0" y="0" width="150" height="200" rx="14" fill="url(#docGradB)" />
        {[40, 62, 84, 106, 128, 150].map((y, i) => (
          <rect key={i} x="24" y={y} width={i % 2 === 0 ? 100 : 76} height="6" rx="3" fill="#8a6a3a" opacity="0.55" />
        ))}
      </g>
    </svg>
  );
}
