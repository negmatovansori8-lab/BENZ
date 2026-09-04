import type { SVGProps } from 'react';
import { cn } from '../utils/format';

type P = SVGProps<SVGSVGElement>;

function Svg({ className, children, ...rest }: P) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden className={cn('h-8 w-8', className)} {...rest}>
      {children}
    </svg>
  );
}

const s = {
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function CatSedan(props: P) {
  return (
    <Svg {...props}>
      <path d="M7 37.2h34" stroke="currentColor" strokeOpacity=".22" strokeWidth="1.6" />
      <path
        d="M5.5 30.4h4l2.5-7.1A3.4 3.4 0 0 1 15.2 21h7.4l4-5.1A2.8 2.8 0 0 1 28.9 14.5h6.4a2.8 2.8 0 0 1 2.55 1.6L41.2 23H42.5v8.4h-3.2a4.5 4.5 0 0 1-8.9 0H18.2a4.5 4.5 0 0 1-8.9 0H5.5V30.4z"
        fill="currentColor"
        fillOpacity=".16"
        {...s}
      />
      <path d="M16.8 21.2h9.2l3.5-4.4h-6.4" {...s} />
      <circle cx="13.8" cy="34.8" r="3.35" fill="currentColor" fillOpacity=".12" {...s} />
      <circle cx="33.8" cy="34.8" r="3.35" fill="currentColor" fillOpacity=".12" {...s} />
    </Svg>
  );
}

export function CatTruck(props: P) {
  return (
    <Svg {...props}>
      <path d="M6.5 37.4h35" stroke="currentColor" strokeOpacity=".22" strokeWidth="1.6" />
      <path d="M5.8 22.2h20.8v12.2H5.8z" fill="currentColor" fillOpacity=".16" {...s} />
      <path d="M26.6 26.4h8.4l4.4 5.2v2.8H26.6V26.4z" fill="currentColor" fillOpacity=".16" {...s} />
      <path d="M29.4 26.4v-3.4h4.6" {...s} />
      <circle cx="13.2" cy="35.4" r="3.2" fill="currentColor" fillOpacity=".12" {...s} />
      <circle cx="23.4" cy="35.4" r="3.2" fill="currentColor" fillOpacity=".12" {...s} />
      <circle cx="35.8" cy="35.4" r="3.2" fill="currentColor" fillOpacity=".12" {...s} />
    </Svg>
  );
}

export function CatKamaz(props: P) {
  return (
    <Svg {...props}>
      <path d="M5.8 37.6h36.4" stroke="currentColor" strokeOpacity=".22" strokeWidth="1.6" />
      <path d="M6.2 16.4h12.2v17.8H6.2z" fill="currentColor" fillOpacity=".16" {...s} />
      <path d="M18.4 22.6h20.6l2.6 5.4v6.2H18.4V22.6z" fill="currentColor" fillOpacity=".16" {...s} />
      <path d="M8.4 19.2h7.8v4.2H8.4z" {...s} />
      <path d="M9.2 16.4V13.8h6.2V16.4" {...s} />
      <path d="M22 22.6v-3.2h9.6l2.2 3.2" {...s} />
      <circle cx="12.4" cy="35.6" r="3.15" fill="currentColor" fillOpacity=".12" {...s} />
      <circle cx="26.2" cy="35.6" r="3.15" fill="currentColor" fillOpacity=".12" {...s} />
      <circle cx="36.6" cy="35.6" r="3.15" fill="currentColor" fillOpacity=".12" {...s} />
    </Svg>
  );
}

export function CatExcavator(props: P) {
  return (
    <Svg {...props}>
      <path d="M6 38h24" stroke="currentColor" strokeOpacity=".22" strokeWidth="1.6" />
      <rect x="7.2" y="27.4" width="20.4" height="7.2" rx="2.2" fill="currentColor" fillOpacity=".16" {...s} />
      <path d="M12.4 27.4v-6.6h8.6v6.6" fill="currentColor" fillOpacity=".16" {...s} />
      <path d="M21 21.2 32.6 12.4" {...s} />
      <path d="M32.6 12.4 39.2 22" {...s} />
      <path d="M36.4 21.4 41.6 20.2 40.2 26.6 35.4 24.8z" fill="currentColor" fillOpacity=".2" {...s} />
      <path d="M9.4 34.6h16.2" {...s} />
    </Svg>
  );
}

export function CatPiston(props: P) {
  return (
    <Svg {...props}>
      <rect x="16.4" y="6.4" width="15.2" height="14.4" rx="2.4" fill="currentColor" fillOpacity=".16" {...s} />
      <path d="M16.4 11.2h15.2M16.4 14.4h15.2" {...s} />
      <path d="M21.2 20.8h5.6v6.2h-5.6z" fill="currentColor" fillOpacity=".16" {...s} />
      <path d="M24 27v7.4" {...s} />
      <path d="M18.6 36.6 24 34.4l5.4 2.2v3.2L24 42.2 18.6 39.8v-3.2z" fill="currentColor" fillOpacity=".16" {...s} />
    </Svg>
  );
}

export function CatHouse(props: P) {
  return (
    <Svg {...props}>
      <path d="M8.4 37.6h31.2" stroke="currentColor" strokeOpacity=".22" strokeWidth="1.6" />
      <path d="M8.8 24.2 24 10.6 39.2 24.2" fill="currentColor" fillOpacity=".1" {...s} />
      <path d="M12.6 23.4V37.2h22.8V23.4" fill="currentColor" fillOpacity=".16" {...s} />
      <path d="M32.4 12.8v6.2" {...s} />
      <rect x="20.6" y="27.4" width="6.8" height="9.8" rx="1" {...s} />
      <rect x="14.4" y="26.8" width="4.4" height="4.4" rx=".8" {...s} />
      <rect x="29.2" y="26.8" width="4.4" height="4.4" rx=".8" {...s} />
    </Svg>
  );
}
