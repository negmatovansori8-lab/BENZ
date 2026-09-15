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
  strokeWidth: 1.65,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function Wheel({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <circle cx={cx} cy={cy} r="4.15" fill="currentColor" fillOpacity=".14" {...s} />
      <circle cx={cx} cy={cy} r="1.55" fill="currentColor" />
    </>
  );
}

export function CatSedan(props: P) {
  return (
    <Svg {...props}>
      <path d="M6 39.2h36" stroke="currentColor" strokeOpacity=".2" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M7.2 29.6h3.1l2.2-6.4A3.2 3.2 0 0 1 15.5 21h6.6l3.6-5.2A2.6 2.6 0 0 1 27.8 14.4h6.2a2.7 2.7 0 0 1 2.45 1.55L39.4 22.8H41.2v7.6h-2.6a4.35 4.35 0 0 1-8.5 0H18.3a4.35 4.35 0 0 1-8.5 0H7.2V29.6z"
        fill="currentColor"
        fillOpacity=".18"
        {...s}
      />
      <path d="M16.4 21.2h8.8l3.2-4.5h-5.6" {...s} />
      <path d="M8.4 29.6h31.2" stroke="currentColor" strokeOpacity=".28" strokeWidth="1.3" />
      <Wheel cx={13.9} cy={34.8} />
      <Wheel cx={33.8} cy={34.8} />
    </Svg>
  );
}

export function CatTruck(props: P) {
  return (
    <Svg {...props}>
      <path d="M5.5 39.4h37" stroke="currentColor" strokeOpacity=".2" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="6" y="16.8" width="21.6" height="15.8" rx="2.2" fill="currentColor" fillOpacity=".18" {...s} />
      <path d="M27.6 23.2h8.8l4.8 5.6v3.8H27.6V23.2z" fill="currentColor" fillOpacity=".18" {...s} />
      <path d="M30.2 23.2v-3.8h5.2" {...s} />
      <path d="M9.2 20.4h15.2" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.3" />
      <Wheel cx={13.4} cy={35.6} />
      <Wheel cx={24} cy={35.6} />
      <Wheel cx={36.4} cy={35.6} />
    </Svg>
  );
}

export function CatKamaz(props: P) {
  return (
    <Svg {...props}>
      <path d="M5.4 39.6h37.2" stroke="currentColor" strokeOpacity=".2" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6.4 14.8h12.6v18.4H6.4z" fill="currentColor" fillOpacity=".18" {...s} />
      <path d="M19 21.6h20.2l3 5.2v6.4H19V21.6z" fill="currentColor" fillOpacity=".18" {...s} />
      <path d="M8.8 17.6h7.8v4.4H8.8z" fill="currentColor" fillOpacity=".08" {...s} />
      <path d="M9.4 14.8V12h6.4v2.8" {...s} />
      <path d="M22.4 21.6v-3.4h10.2l2.4 3.4" {...s} />
      <Wheel cx={12.6} cy={35.8} />
      <Wheel cx={26.4} cy={35.8} />
      <Wheel cx={36.8} cy={35.8} />
    </Svg>
  );
}

export function CatExcavator(props: P) {
  return (
    <Svg {...props}>
      <path d="M5.8 39.2h24.4" stroke="currentColor" strokeOpacity=".2" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="7.2" y="26.6" width="20.8" height="8" rx="2.4" fill="currentColor" fillOpacity=".18" {...s} />
      <path d="M12.2 26.6v-7h9.2v7" fill="currentColor" fillOpacity=".14" {...s} />
      <path d="M21.2 20.2 33.4 10.8" {...s} />
      <path d="M33.4 10.8 40.2 21.4" {...s} />
      <path d="M36.6 20.6 42.6 19.2 41 26.4 35.4 24.4z" fill="currentColor" fillOpacity=".22" {...s} />
      <path d="M10 34.6h15.4" stroke="currentColor" strokeOpacity=".4" strokeWidth="1.4" />
    </Svg>
  );
}

export function CatPiston(props: P) {
  return (
    <Svg {...props}>
      <rect x="16.2" y="5.8" width="15.6" height="15" rx="2.6" fill="currentColor" fillOpacity=".18" {...s} />
      <path d="M16.2 10.8h15.6M16.2 14.2h15.6" {...s} />
      <path d="M21 20.8h6v6.4h-6z" fill="currentColor" fillOpacity=".16" {...s} />
      <path d="M24 27.2v6.8" {...s} />
      <path d="M18.4 36.2 24 33.8l5.6 2.4v3.4L24 42 18.4 39.6v-3.4z" fill="currentColor" fillOpacity=".18" {...s} />
    </Svg>
  );
}

export function CatHouse(props: P) {
  return (
    <Svg {...props}>
      <path d="M8 39.4h32" stroke="currentColor" strokeOpacity=".2" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8.6 23.6 24 10 39.4 23.6" fill="currentColor" fillOpacity=".1" {...s} />
      <path d="M12.8 22.8V37.4h22.4V22.8" fill="currentColor" fillOpacity=".18" {...s} />
      <path d="M32.6 12.2v6.4" {...s} />
      <rect x="20.6" y="27.2" width="6.8" height="10.2" rx="1.1" fill="currentColor" fillOpacity=".08" {...s} />
      <rect x="14.6" y="26.4" width="4.2" height="4.2" rx=".8" {...s} />
      <rect x="29.2" y="26.4" width="4.2" height="4.2" rx=".8" {...s} />
    </Svg>
  );
}
