import type { SVGProps } from 'react';
import { cn } from '../utils/format';

type P = SVGProps<SVGSVGElement>;

function Svg({ className, children, ...rest }: P) {
  return (
    <svg viewBox="0 0 64 64" fill="currentColor" aria-hidden className={cn('h-8 w-8', className)} {...rest}>
      {children}
    </svg>
  );
}

export function CatSedan(props: P) {
  return (
    <Svg {...props}>
      <path d="M8 52.5h48" opacity=".22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M9.5 38.2h4.2l3.1-8.4A4.4 4.4 0 0 1 21 26.8h9.2l5.1-6.8A3.6 3.6 0 0 1 38.2 18.2h8.4a3.7 3.7 0 0 1 3.4 2.1L54.2 29.4H57v10.2h-3.4a6.2 6.2 0 0 1-12.1 0H23.5a6.2 6.2 0 0 1-12.1 0H9.5V38.2z" />
      <path d="M22.4 27.2h12.6l4.4-5.8H31.2z" fill="#09090b" fillOpacity=".38" />
      <circle cx="18.2" cy="46.2" r="5.4" />
      <circle cx="18.2" cy="46.2" r="2.1" fill="#09090b" fillOpacity=".45" />
      <circle cx="45.6" cy="46.2" r="5.4" />
      <circle cx="45.6" cy="46.2" r="2.1" fill="#09090b" fillOpacity=".45" />
    </Svg>
  );
}

export function CatTruck(props: P) {
  return (
    <Svg {...props}>
      <path d="M7 53h50" opacity=".22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <rect x="8" y="20" width="29.5" height="22.5" rx="3.2" />
      <path d="M37.5 29.5H50l6.8 8v6.5H37.5V29.5z" />
      <path d="M41 29.5v-5.4h7.2" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="12.2" y="24.6" width="21" height="5.2" rx="1.2" fill="#09090b" fillOpacity=".32" />
      <circle cx="18" cy="47.2" r="5.1" />
      <circle cx="18" cy="47.2" r="2" fill="#09090b" fillOpacity=".45" />
      <circle cx="31.6" cy="47.2" r="5.1" />
      <circle cx="31.6" cy="47.2" r="2" fill="#09090b" fillOpacity=".45" />
      <circle cx="49.2" cy="47.2" r="5.1" />
      <circle cx="49.2" cy="47.2" r="2" fill="#09090b" fillOpacity=".45" />
    </Svg>
  );
}

export function CatKamaz(props: P) {
  return (
    <Svg {...props}>
      <path d="M6.5 53.2h51" opacity=".22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M8.2 17.2h17.4v26.2H8.2z" />
      <path d="M25.6 28.4h27.2l4.2 7.4v7.6H25.6V28.4z" />
      <rect x="11.4" y="21.2" width="11" height="6.2" rx="1.2" fill="#09090b" fillOpacity=".32" />
      <path d="M12.4 17.2V13.4h9v3.8" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" />
      <path d="M30.4 28.4v-4.8h14.2l3.4 4.8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16.8" cy="47.6" r="5.1" />
      <circle cx="16.8" cy="47.6" r="2" fill="#09090b" fillOpacity=".45" />
      <circle cx="35.4" cy="47.6" r="5.1" />
      <circle cx="35.4" cy="47.6" r="2" fill="#09090b" fillOpacity=".45" />
      <circle cx="49.6" cy="47.6" r="5.1" />
      <circle cx="49.6" cy="47.6" r="2" fill="#09090b" fillOpacity=".45" />
    </Svg>
  );
}

export function CatExcavator(props: P) {
  return (
    <Svg {...props}>
      <path d="M7 53h33" opacity=".22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <rect x="9" y="34.4" width="28.4" height="11.2" rx="3.2" />
      <path d="M16.2 34.4V24.6h12.8v9.8" />
      <rect x="18.4" y="26.2" width="8.4" height="5.2" rx="1" fill="#09090b" fillOpacity=".32" />
      <path d="M28.6 26.4 45.2 13.2" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M45.2 13.2 54.6 28" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M49.2 26.8 57.6 24.6 55.2 35.4 47.2 32.4z" />
      <rect x="12.6" y="45.2" width="21.6" height="3.2" rx="1.4" />
    </Svg>
  );
}

export function CatPiston(props: P) {
  return (
    <Svg {...props}>
      <rect x="20.4" y="6.4" width="23.2" height="21.2" rx="4" />
      <path d="M20.4 13.6h23.2M20.4 18.6h23.2" fill="none" stroke="#09090b" strokeOpacity=".35" strokeWidth="2.2" />
      <rect x="27.2" y="27.2" width="9.6" height="9.2" rx="1.6" />
      <path d="M32 36.4v10.2" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M23.6 48.2 32 44.8l8.4 3.4v5.2L32 57.2 23.6 53.4v-5.2z" />
    </Svg>
  );
}

export function CatHouse(props: P) {
  return (
    <Svg {...props}>
      <path d="M10 52.8h44" opacity=".22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M10.8 30.4 32 11.6 53.2 30.4" />
      <path d="M16.6 29.2V50.4h30.8V29.2" />
      <path d="M44.2 15.4v8.6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <rect x="27.4" y="35.6" width="9.2" height="14.8" rx="1.4" fill="#09090b" fillOpacity=".38" />
      <rect x="19.4" y="34.6" width="5.8" height="5.8" rx="1" fill="#09090b" fillOpacity=".32" />
      <rect x="38.8" y="34.6" width="5.8" height="5.8" rx="1" fill="#09090b" fillOpacity=".32" />
    </Svg>
  );
}
