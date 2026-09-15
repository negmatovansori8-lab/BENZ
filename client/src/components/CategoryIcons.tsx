import type { SVGProps } from 'react';
import { cn } from '../utils/format';

type P = SVGProps<SVGSVGElement>;

function Svg({ className, children, ...rest }: P) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden className={cn('h-8 w-8', className)} {...rest}>
      {children}
    </svg>
  );
}

export function CatSedan(props: P) {
  return (
    <Svg {...props}>
      <defs>
        <linearGradient id="sedanBody" x1="12" y1="16" x2="54" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="currentColor" stopOpacity="1" />
          <stop offset="1" stopColor="currentColor" stopOpacity=".72" />
        </linearGradient>
        <linearGradient id="sedanGlass" x1="22" y1="18" x2="40" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity=".12" />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="51.5" rx="22" ry="3.2" fill="currentColor" opacity=".16" />
      <path fill="url(#sedanBody)" d="M10.5 38.5c.4-3.2 2-8.4 5.8-11.2 2.2-1.6 7.4-3.4 11.2-4.1 2.4-.4 4.6-3.8 8.4-5.6 3.2-1.5 8.1-1.6 11.6-.2 2.8 1.1 6.6 4.6 8.2 8.6 1.1 2.8 1.8 6.6 1.8 8.8 0 1.4-.6 2.7-2.4 3.1H13.2c-1.8-.2-2.9-1.6-2.7-3.4z" />
      <path fill="url(#sedanGlass)" d="M28.2 19.4c3.6-1.5 8.2-1.6 11.2-.4 1.6.6 3.5 2.2 4.4 3.6-3.8.2-9.2.6-13.8 1.8-1.6.4-3.2 1.2-4.6 1.8-.2-1.4.2-4.4 2.8-6.8z" />
      <path fill="url(#sedanGlass)" d="M18.6 25.6c2.8-.8 6.4-1.6 9.4-1.8.4 1.6.6 3.4.4 5.2H16.8c.2-1.4.8-2.6 1.8-3.4z" />
      <path fill="currentColor" opacity=".28" d="M48.8 27.4c1.4 2.2 2.4 4.8 2.8 7.2h3.2c-.4-2.8-1.6-6-3.4-8.4-.8.2-1.8.6-2.6 1.2z" />
      <ellipse cx="20.2" cy="43.4" rx="5.6" ry="5.6" fill="#121214" />
      <ellipse cx="20.2" cy="43.4" rx="2.4" ry="2.4" fill="currentColor" opacity=".55" />
      <ellipse cx="44.8" cy="43.4" rx="5.6" ry="5.6" fill="#121214" />
      <ellipse cx="44.8" cy="43.4" rx="2.4" ry="2.4" fill="currentColor" opacity=".55" />
      <path fill="#fff" opacity=".35" d="M14.2 34.2h7.4c.6 0 1 .5.9 1.1l-.3 1.4H13.8c-.5 0-.8-.5-.7-1l.4-1.3c.1-.1.4-.2.7-.2z" />
    </Svg>
  );
}

export function CatTruck(props: P) {
  return (
    <Svg {...props}>
      <defs>
        <linearGradient id="truckBody" x1="8" y1="14" x2="56" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity=".7" />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="52" rx="23" ry="3.1" fill="currentColor" opacity=".16" />
      <rect x="8.5" y="18.5" width="30" height="23.5" rx="3.4" fill="url(#truckBody)" />
      <path fill="url(#truckBody)" d="M38.5 28.2h12.6l5.4 7.6v7.6c0 1.2-1 2.2-2.2 2.2H38.5V28.2z" />
      <rect x="12.4" y="23" width="22.2" height="6.2" rx="1.4" fill="#fff" fillOpacity=".28" />
      <path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" d="M42.2 28.2V22.6h7.6" opacity=".9" />
      <ellipse cx="18.4" cy="46.4" rx="5.2" ry="5.2" fill="#121214" />
      <ellipse cx="18.4" cy="46.4" rx="2.2" ry="2.2" fill="currentColor" opacity=".55" />
      <ellipse cx="32.2" cy="46.4" rx="5.2" ry="5.2" fill="#121214" />
      <ellipse cx="32.2" cy="46.4" rx="2.2" ry="2.2" fill="currentColor" opacity=".55" />
      <ellipse cx="49.4" cy="46.4" rx="5.2" ry="5.2" fill="#121214" />
      <ellipse cx="49.4" cy="46.4" rx="2.2" ry="2.2" fill="currentColor" opacity=".55" />
    </Svg>
  );
}

export function CatKamaz(props: P) {
  return (
    <Svg {...props}>
      <defs>
        <linearGradient id="kamazBody" x1="8" y1="12" x2="58" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity=".68" />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="52.2" rx="24" ry="3.1" fill="currentColor" opacity=".16" />
      <path fill="url(#kamazBody)" d="M8.4 16.4h18.2v26.4H8.4z" />
      <path fill="url(#kamazBody)" d="M26.6 27.8H54l4 7.6v8.4H26.6V27.8z" />
      <rect x="11.6" y="20.6" width="12" height="7.2" rx="1.4" fill="#fff" fillOpacity=".3" />
      <path fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" d="M12.6 16.4V12.4h10" />
      <path fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" d="M31.2 27.8v-5.4h15.2l3.6 5.4" />
      <ellipse cx="17.4" cy="46.8" rx="5.1" ry="5.1" fill="#121214" />
      <ellipse cx="17.4" cy="46.8" rx="2.1" ry="2.1" fill="currentColor" opacity=".55" />
      <ellipse cx="35.8" cy="46.8" rx="5.1" ry="5.1" fill="#121214" />
      <ellipse cx="35.8" cy="46.8" rx="2.1" ry="2.1" fill="currentColor" opacity=".55" />
      <ellipse cx="50.2" cy="46.8" rx="5.1" ry="5.1" fill="#121214" />
      <ellipse cx="50.2" cy="46.8" rx="2.1" ry="2.1" fill="currentColor" opacity=".55" />
    </Svg>
  );
}

export function CatExcavator(props: P) {
  return (
    <Svg {...props}>
      <defs>
        <linearGradient id="exoBody" x1="10" y1="18" x2="40" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity=".7" />
        </linearGradient>
      </defs>
      <ellipse cx="26" cy="52" rx="20" ry="3" fill="currentColor" opacity=".16" />
      <rect x="9.2" y="34" width="30.4" height="12.2" rx="3.4" fill="url(#exoBody)" />
      <path fill="url(#exoBody)" d="M16.8 34V23.2h14.2V34" />
      <rect x="19.2" y="25.2" width="9.4" height="5.8" rx="1.3" fill="#fff" fillOpacity=".3" />
      <path fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" d="M30.4 25.6 47.2 12.4" />
      <path fill="none" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" d="M47.2 12.4 56.6 28.2" />
      <path fill="currentColor" d="M51 26.6 59.8 24.2 57 36.4 48.6 32.8z" />
      <rect x="13.4" y="45.4" width="22.4" height="3.6" rx="1.6" fill="#121214" />
    </Svg>
  );
}

export function CatPiston(props: P) {
  return (
    <Svg {...props}>
      <defs>
        <linearGradient id="pistonBody" x1="20" y1="8" x2="44" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity=".68" />
        </linearGradient>
      </defs>
      <rect x="20.2" y="7.2" width="23.6" height="22" rx="4.2" fill="url(#pistonBody)" />
      <path fill="none" stroke="#fff" strokeOpacity=".28" strokeWidth="2.2" d="M20.2 14.6h23.6M20.2 20.2h23.6" />
      <rect x="27.2" y="28.6" width="9.6" height="9.4" rx="1.8" fill="url(#pistonBody)" />
      <path fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" d="M32 38v10.6" />
      <path fill="url(#pistonBody)" d="M23.4 50.2 32 46.6l8.6 3.6v5.4L32 59.2l-8.6-3.6v-5.4z" />
    </Svg>
  );
}

export function CatHouse(props: P) {
  return (
    <Svg {...props}>
      <defs>
        <linearGradient id="houseBody" x1="14" y1="12" x2="50" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity=".7" />
        </linearGradient>
      </defs>
      <ellipse cx="32" cy="52.6" rx="22" ry="3" fill="currentColor" opacity=".16" />
      <path fill="url(#houseBody)" d="M10.4 31.2 32 12.2 53.6 31.2 48.2 31.2 48.2 50.8 15.8 50.8 15.8 31.2z" />
      <path fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" d="M44.6 16.2v8.8" />
      <rect x="27.2" y="36.2" width="9.6" height="14.6" rx="1.5" fill="#121214" fillOpacity=".4" />
      <rect x="19.2" y="35" width="6" height="6" rx="1.1" fill="#fff" fillOpacity=".32" />
      <rect x="38.8" y="35" width="6" height="6" rx="1.1" fill="#fff" fillOpacity=".32" />
    </Svg>
  );
}
