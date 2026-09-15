import { useEffect, useState } from 'react';
import { carImage } from '../utils/format';

function placeholder(seed?: string | number | null, label = 'BENZ') {
  const n = Math.abs(Number(seed) || 0);
  const hue = (n * 47) % 360;
  const text = String(label || 'BENZ').replace(/[<>&"']/g, '').slice(0, 22);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="600" viewBox="0 0 900 600">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue} 22% 22%)"/>
      <stop offset="100%" stop-color="hsl(${(hue + 40) % 360} 28% 12%)"/>
    </linearGradient></defs>
    <rect width="900" height="600" fill="url(#g)"/>
    <text x="450" y="305" text-anchor="middle" fill="#e8c547" font-family="Segoe UI,Arial" font-size="40" font-weight="700">${text}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function SafeImg({
  src,
  seed,
  index = 0,
  alt,
  className,
}: {
  src?: string | null;
  seed?: string | number | null;
  index?: number;
  alt: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const resolved = failed ? placeholder(seed, alt) : carImage(src, seed, index);

  useEffect(() => {
    setFailed(false);
  }, [src, seed, index]);

  return (
    <img
      key={`${resolved}-${failed ? 'fb' : 'ok'}`}
      src={resolved}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
