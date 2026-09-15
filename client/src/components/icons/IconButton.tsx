import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/format';
import { Icon, type IconSize } from './Icon';

type Tone = 'default' | 'ghost' | 'danger' | 'onMedia' | 'gold';

const toneClass: Record<Tone, string> = {
  default:
    'bg-[var(--ah-surface)] text-[var(--ah-text)] ring-1 ring-[var(--ah-line)] hover:bg-[var(--ah-muted)]/10',
  ghost: 'bg-transparent text-[var(--ah-muted)] hover:bg-[var(--ah-muted)]/10 hover:text-[var(--ah-text)]',
  danger: 'bg-transparent text-red-500 hover:bg-red-500/10',
  onMedia: 'bg-black/55 text-white backdrop-blur-md hover:bg-black/75',
  gold: 'bg-gold-500/15 text-gold-600 hover:bg-gold-500/25 dark:text-gold-400',
};

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: LucideIcon;
  label: string;
  size?: IconSize;
  tone?: Tone;
  active?: boolean;
  tooltip?: string;
  children?: ReactNode;
};

/** Icon-only (or icon+text) control with hover / focus / disabled / tooltip. */
export function IconButton({
  icon,
  label,
  size = 'sm',
  tone = 'ghost',
  active,
  tooltip,
  className,
  disabled,
  children,
  type = 'button',
  ...rest
}: IconButtonProps) {
  const tip = tooltip || label;
  return (
    <button
      type={type}
      aria-label={label}
      title={tip}
      disabled={disabled}
      className={cn(
        'ah-icon-btn inline-flex items-center justify-center gap-2 rounded-full transition duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--ah-bg)]',
        'disabled:pointer-events-none disabled:opacity-40',
        children ? 'px-3 py-2 text-sm font-medium' : 'p-2',
        toneClass[tone],
        active && 'text-gold-500',
        className
      )}
      {...rest}
    >
      <Icon icon={icon} size={size} decorative />
      {children}
    </button>
  );
}
