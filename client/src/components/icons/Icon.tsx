import type { LucideIcon, LucideProps } from 'lucide-react';
import { cn } from '../../utils/format';

/** Unified icon scale — use these sizes everywhere. */
export const ICON_SIZE = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

export type IconSize = keyof typeof ICON_SIZE;

/** Apple/Google-like thin stroke for all UI icons. */
export const ICON_STROKE = 1.75;

export type AhIconProps = Omit<LucideProps, 'size' | 'strokeWidth'> & {
  icon: LucideIcon;
  size?: IconSize | number;
  label?: string;
  decorative?: boolean;
  className?: string;
};

/**
 * Single style wrapper for Lucide icons.
 * Use `label` for accessible name when icon is not paired with visible text.
 */
export function Icon({
  icon: Lucide,
  size = 'sm',
  label,
  decorative = !label,
  className,
  absoluteStrokeWidth,
  ...rest
}: AhIconProps) {
  const px = typeof size === 'number' ? size : ICON_SIZE[size];
  return (
    <Lucide
      size={px}
      strokeWidth={ICON_STROKE}
      absoluteStrokeWidth={absoluteStrokeWidth ?? true}
      className={cn('ah-icon shrink-0', className)}
      aria-hidden={decorative || undefined}
      aria-label={label}
      role={label ? 'img' : undefined}
      {...rest}
    />
  );
}
