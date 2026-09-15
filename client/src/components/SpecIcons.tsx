import type { ReactNode, SVGProps } from 'react';
import { cn } from '../utils/format';

type IconProps = SVGProps<SVGSVGElement>;

function Svg({ className, children, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn('h-4 w-4', className)}
      {...rest}
    >
      {children}
    </svg>
  );
}

const s = {
  stroke: 'currentColor',
  strokeWidth: 1.55,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IconOdo(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="13.2" r="7" fill="currentColor" fillOpacity=".1" {...s} />
      <path d="M8.1 8.2A7 7 0 0 1 15.9 8.2" {...s} />
      <path d="M12 13.2 16 10" {...s} />
      <circle cx="12" cy="13.2" r="1.2" fill="currentColor" />
    </Svg>
  );
}

export function IconFuel(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.4" y="4.4" width="9" height="15.2" rx="1.8" fill="currentColor" fillOpacity=".1" {...s} />
      <path d="M6.6 7.4h4.6M6.6 10.4h4.6" {...s} />
      <path d="M13.4 8.6h1.7a2.3 2.3 0 0 1 2.3 2.3v5.4a1.5 1.5 0 0 0 1.5 1.5" {...s} />
      <path d="M17.4 11.4v2" {...s} />
    </Svg>
  );
}

export function IconGear(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="6.4" y="4.2" width="11.2" height="15.6" rx="2.2" fill="currentColor" fillOpacity=".1" {...s} />
      <circle cx="12" cy="9.1" r="1.7" fill="currentColor" fillOpacity=".18" {...s} />
      <path d="M12 10.8v2.2" {...s} />
      <path d="M9.4 16.2h5.2M9.4 14.4h5.2" {...s} />
    </Svg>
  );
}

export function IconEngine(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M4.2 11h2l1.2-2.3h4.1l.8-1.6h3.4v1.6h1.8v3.1h1.4v4.4h-2.2v1.6H8.8L6.4 15.4H4.2V11z"
        fill="currentColor"
        fillOpacity=".1"
        {...s}
      />
      <path d="M8.6 11.4h5" {...s} />
    </Svg>
  );
}

export function IconPower(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M13.1 3.8 7.4 13h4.1l-.8 7.2 5.8-9.4h-4.1l.7-7z"
        fill="currentColor"
        fillOpacity=".12"
        {...s}
      />
    </Svg>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="5.6" width="16" height="14" rx="2.2" fill="currentColor" fillOpacity=".1" {...s} />
      <path d="M8 3.8v3.4M16 3.8v3.4M4 10.2h16" {...s} />
    </Svg>
  );
}

export function IconBody(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M3.8 14.1h16.4l-.8-3.3c-.3-1.2-1.2-2.2-2.4-2.6L14.2 7H9.4L6.6 8.2c-1.2.4-2.1 1.4-2.4 2.6l-.4 3.3z"
        fill="currentColor"
        fillOpacity=".1"
        {...s}
      />
      <circle cx="7.4" cy="16.4" r="1.45" {...s} />
      <circle cx="16.6" cy="16.4" r="1.45" {...s} />
      <path d="M9.1 16.4h5.8" {...s} />
    </Svg>
  );
}

export function IconPalette(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M12 4.2a7.8 7.8 0 1 0 0 15.6c.9 0 1.5-.7 1.5-1.5 0-.4-.1-.8-.4-1.1-.3-.3-.4-.7-.4-1.1a1.6 1.6 0 0 1 1.6-1.6H16a3.8 3.8 0 0 0 3.8-3.8A7.8 7.8 0 0 0 12 4.2z"
        fill="currentColor"
        fillOpacity=".1"
        {...s}
      />
      <circle cx="8.2" cy="10" r=".85" fill="currentColor" />
      <circle cx="10.4" cy="7.4" r=".85" fill="currentColor" />
      <circle cx="13.8" cy="7.6" r=".85" fill="currentColor" />
    </Svg>
  );
}

export function IconVin(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.6" y="6.2" width="16.8" height="11.6" rx="2.2" fill="currentColor" fillOpacity=".1" {...s} />
      <path d="M6.4 9.2v5.6M8.4 9.2v5.6M9.8 9.2v5.6M12.2 9.2v5.6M13.6 9.2v5.6M15.8 9.2v5.6M17.6 9.2v5.6" {...s} />
    </Svg>
  );
}

export function IconDrive(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="6.4" cy="12" r="2.35" fill="currentColor" fillOpacity=".1" {...s} />
      <circle cx="17.6" cy="12" r="2.35" fill="currentColor" fillOpacity=".1" {...s} />
      <path d="M8.8 12h6.4M12 12V8.4h2.2" {...s} />
    </Svg>
  );
}

export function IconPin(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M12 21s6.3-6 6.3-10.3A6.3 6.3 0 0 0 5.7 10.7C5.7 15 12 21 12 21z"
        fill="currentColor"
        fillOpacity=".12"
        {...s}
      />
      <circle cx="12" cy="10.7" r="1.7" fill="currentColor" fillOpacity=".2" {...s} />
    </Svg>
  );
}

export function IconEye(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M3.6 12s3.2-5.3 8.4-5.3S20.4 12 20.4 12s-3.2 5.3-8.4 5.3S3.6 12 3.6 12z"
        fill="currentColor"
        fillOpacity=".1"
        {...s}
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" fillOpacity=".18" {...s} />
    </Svg>
  );
}

export function IconClock(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="7.3" fill="currentColor" fillOpacity=".1" {...s} />
      <path d="M12 8.3v4.1l2.7 1.55" {...s} />
    </Svg>
  );
}

export function IconCondition(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M12 4.2 19.3 7v5.1c0 4.3-3 6.7-7.3 8.1-4.3-1.4-7.3-3.8-7.3-8.1V7L12 4.2z"
        fill="currentColor"
        fillOpacity=".1"
        {...s}
      />
      <path d="M8.8 12 11 14.2l4.3-4.5" {...s} />
    </Svg>
  );
}

export function IconTile({
  children,
  className,
  size = 'sm',
}: {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}) {
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-xl text-gold-600 shadow-[inset_0_1px_0_rgba(255,255,255,.35)] ring-1 ring-gold-500/15 dark:text-gold-400',
        'bg-[linear-gradient(180deg,rgba(201,162,39,.18),rgba(201,162,39,.08))]',
        size === 'sm' ? 'h-8 w-8' : 'h-11 w-11 rounded-2xl [&_svg]:h-5 [&_svg]:w-5',
        className
      )}
    >
      {children}
    </span>
  );
}
