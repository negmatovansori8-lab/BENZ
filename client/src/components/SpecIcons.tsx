import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Calendar,
  Car,
  Clock,
  Eye,
  Fuel,
  Gauge,
  Hash,
  MapPin,
  Palette,
  Settings2,
  ShieldCheck,
  Waypoints,
  Wrench,
  Zap,
} from 'lucide-react';
import { cn } from '../utils/format';
import { Icon, type IconSize } from './icons/Icon';

type SpecProps = {
  className?: string;
  size?: IconSize;
};

function Spec({ icon, className, size = 'sm' }: SpecProps & { icon: LucideIcon }) {
  return <Icon icon={icon} size={size} className={className} decorative />;
}

export function IconOdo(p: SpecProps) {
  return <Spec icon={Gauge} {...p} />;
}
export function IconFuel(p: SpecProps) {
  return <Spec icon={Fuel} {...p} />;
}
export function IconGear(p: SpecProps) {
  return <Spec icon={Settings2} {...p} />;
}
export function IconEngine(p: SpecProps) {
  return <Spec icon={Wrench} {...p} />;
}
export function IconPower(p: SpecProps) {
  return <Spec icon={Zap} {...p} />;
}
export function IconCalendar(p: SpecProps) {
  return <Spec icon={Calendar} {...p} />;
}
export function IconBody(p: SpecProps) {
  return <Spec icon={Car} {...p} />;
}
export function IconPalette(p: SpecProps) {
  return <Spec icon={Palette} {...p} />;
}
export function IconVin(p: SpecProps) {
  return <Spec icon={Hash} {...p} />;
}
export function IconDrive(p: SpecProps) {
  return <Spec icon={Waypoints} {...p} />;
}
export function IconPin(p: SpecProps) {
  return <Spec icon={MapPin} {...p} />;
}
export function IconEye(p: SpecProps) {
  return <Spec icon={Eye} {...p} />;
}
export function IconClock(p: SpecProps) {
  return <Spec icon={Clock} {...p} />;
}
export function IconCondition(p: SpecProps) {
  return <Spec icon={ShieldCheck} {...p} />;
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
        'ah-icon-tile grid shrink-0 place-items-center text-gold-600 dark:text-gold-400',
        'bg-[linear-gradient(180deg,rgba(201,162,39,.16),rgba(201,162,39,.06))]',
        'ring-1 ring-gold-500/15 shadow-[inset_0_1px_0_rgba(255,255,255,.28)]',
        size === 'sm' ? 'h-8 w-8 rounded-xl' : 'h-11 w-11 rounded-2xl',
        className
      )}
    >
      {children}
    </span>
  );
}
