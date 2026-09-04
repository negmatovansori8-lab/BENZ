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

const stroke = {
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IconOdo(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="13" r="7.2" {...stroke} />
      <path d="M8.2 8.2A7.2 7.2 0 0 1 15.8 8.2" {...stroke} />
      <path d="M12 13l4.2-3.4" {...stroke} />
      <circle cx="12" cy="13" r="1.15" fill="currentColor" />
      <path d="M12 6.2V5M18.2 10.2l.9-.5M5.8 10.2l-.9-.5" {...stroke} />
    </Svg>
  );
}

export function IconFuel(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4.2" y="4.5" width="9.2" height="15" rx="1.6" {...stroke} />
      <path d="M6.4 7.2h4.8M6.4 10.2h4.8" {...stroke} />
      <path d="M13.4 8.5h1.8a2.4 2.4 0 0 1 2.4 2.4v5.2a1.6 1.6 0 0 0 1.6 1.6" {...stroke} />
      <path d="M17.6 11.2v2.2" {...stroke} />
      <path d="M8.8 19.5v1" {...stroke} />
    </Svg>
  );
}

export function IconGear(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="6.2" y="4.2" width="11.6" height="15.6" rx="2" {...stroke} />
      <circle cx="12" cy="9.2" r="1.7" {...stroke} />
      <path d="M12 10.9v2.4" {...stroke} />
      <path d="M9.2 16.4h5.6M9.2 14.4h5.6" {...stroke} />
    </Svg>
  );
}

export function IconEngine(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M4 11.2h2.2l1.2-2.4h4.2l.8-1.6h3.4v1.6h1.8v3.2h1.4v4.4H16v1.6H8.6L6.2 15.6H4V11.2z"
        {...stroke}
      />
      <path d="M8.4 11.5h5.2" {...stroke} />
    </Svg>
  );
}

export function IconPower(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M13.2 3.8 7.4 13.2h4.2l-.8 7 5.8-9.4h-4.2l.8-7z" {...stroke} />
    </Svg>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="5.5" width="16" height="14.2" rx="2" {...stroke} />
      <path d="M8 3.8v3.4M16 3.8v3.4M4 10h16" {...stroke} />
    </Svg>
  );
}

export function IconBody(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M3.8 14.2h16.4l-.8-3.4c-.3-1.2-1.2-2.2-2.4-2.6L14.2 7H9.4L6.6 8.2c-1.2.4-2.1 1.4-2.4 2.6l-.4 3.4z"
        {...stroke}
      />
      <circle cx="7.4" cy="16.4" r="1.5" {...stroke} />
      <circle cx="16.6" cy="16.4" r="1.5" {...stroke} />
      <path d="M9.2 16.4h5.6" {...stroke} />
    </Svg>
  );
}

export function IconPalette(props: IconProps) {
  return (
    <Svg {...props}>
      <path
        d="M12 4.2a7.8 7.8 0 1 0 0 15.6c.9 0 1.5-.7 1.5-1.5 0-.4-.1-.8-.4-1.1-.3-.3-.4-.7-.4-1.1a1.6 1.6 0 0 1 1.6-1.6H16a3.8 3.8 0 0 0 3.8-3.8A7.8 7.8 0 0 0 12 4.2z"
        {...stroke}
      />
      <circle cx="8.2" cy="10" r=".9" fill="currentColor" />
      <circle cx="10.4" cy="7.4" r=".9" fill="currentColor" />
      <circle cx="13.8" cy="7.6" r=".9" fill="currentColor" />
    </Svg>
  );
}

export function IconVin(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3.6" y="6.2" width="16.8" height="11.6" rx="2" {...stroke} />
      <path d="M6.2 9.2v5.6M8.1 9.2v5.6M9.4 9.2v5.6M11.8 9.2v5.6M13.2 9.2v5.6M15.4 9.2v5.6M17.4 9.2v5.6" {...stroke} />
    </Svg>
  );
}

export function IconDrive(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="6.4" cy="12" r="2.4" {...stroke} />
      <circle cx="17.6" cy="12" r="2.4" {...stroke} />
      <path d="M8.8 12h6.4M12 12V8.4h2.2" {...stroke} />
    </Svg>
  );
}

export function IconPin(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 21s6.4-6.1 6.4-10.4A6.4 6.4 0 0 0 5.6 10.6C5.6 14.9 12 21 12 21z" {...stroke} />
      <circle cx="12" cy="10.6" r="1.8" {...stroke} />
    </Svg>
  );
}

export function IconEye(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.6 12s3.2-5.4 8.4-5.4S20.4 12 20.4 12s-3.2 5.4-8.4 5.4S3.6 12 3.6 12z" {...stroke} />
      <circle cx="12" cy="12" r="2.1" {...stroke} />
    </Svg>
  );
}

export function IconClock(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="7.4" {...stroke} />
      <path d="M12 8.2v4.2l2.8 1.6" {...stroke} />
    </Svg>
  );
}

export function IconCondition(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 4.2 19.4 7v5.2c0 4.4-3 6.8-7.4 8.2-4.4-1.4-7.4-3.8-7.4-8.2V7L12 4.2z" {...stroke} />
      <path d="M8.8 12.1 11 14.3l4.4-4.6" {...stroke} />
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
        'grid shrink-0 place-items-center rounded-xl bg-gold-500/12 text-gold-600 dark:text-gold-400',
        size === 'sm' ? 'h-8 w-8' : 'h-11 w-11 rounded-2xl [&_svg]:h-5 [&_svg]:w-5',
        className
      )}
    >
      {children}
    </span>
  );
}
