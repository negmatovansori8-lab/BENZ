import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../utils/format';

export type PickOption = { value: string; label: string; color?: string };

const PALETTE = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#38bdf8', '#6366f1', '#a855f7', '#ec4899', '#fb7185',
];

const BRAND_COLOR: Record<string, string> = {
  BMW: '#3b82f6',
  'Mercedes-Benz': '#94a3b8',
  Audi: '#f43f5e',
  Toyota: '#ef4444',
  Lexus: '#64748b',
  Tesla: '#e11d48',
  Porsche: '#dc2626',
  Honda: '#f43f5e',
  Hyundai: '#0ea5e9',
  Kia: '#fb7185',
  Ford: '#2563eb',
  Chevrolet: '#f59e0b',
  KAMAZ: '#38bdf8',
  DAF: '#fb923c',
  MAN: '#fbbf24',
  FAW: '#22c55e',
  GAZ: '#a3e635',
  HOWO: '#f97316',
  Isuzu: '#06b6d4',
  JCB: '#eab308',
  Shacman: '#f59e0b',
  Nissan: '#c41e3a',
};

export function optionColor(label: string, index: number) {
  return BRAND_COLOR[label] || PALETTE[index % PALETTE.length];
}

export function ColorSelect({
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: PickOption[];
  placeholder: string;
  required?: boolean;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const wrap = useRef<HTMLDivElement>(null);
  const colored = useMemo(
    () => options.map((o, i) => ({ ...o, color: o.color || optionColor(o.label, i) })),
    [options]
  );
  const selected = colored.find((o) => o.value === value);
  const filtered = q.trim()
    ? colored.filter((o) => o.label.toLowerCase().includes(q.trim().toLowerCase()))
    : colored;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    if (!open) setQ('');
  }, [open]);

  const accent = selected?.color || '#38bdf8';

  return (
    <div ref={wrap} className="relative">
      {required && <input className="sr-only" tabIndex={-1} required value={value} onChange={() => {}} />}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center gap-2.5 rounded-xl border bg-[#0a0a0c] px-3.5 py-2.5 text-left text-sm text-white transition',
          'disabled:opacity-50'
        )}
        style={{ borderColor: open ? accent : 'rgba(255,255,255,.12)', boxShadow: open ? `0 0 0 3px ${accent}33` : undefined }}
      >
        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: accent }} />
        <span className={cn('flex-1 truncate', !selected && 'text-white/45')}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown className={cn('h-4 w-4 text-white/50 transition', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="pick-menu absolute z-40 mt-2 w-full overflow-hidden rounded-2xl">
          {colored.length > 8 && (
            <div className="border-b border-white/10 p-2">
              <input
                autoFocus
                className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/35"
                placeholder={placeholder}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          )}
          <ul className="max-h-56 overflow-auto py-1">
            {!required && (
              <li>
                <button
                  type="button"
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-white/50 hover:bg-white/5"
                  onClick={() => { onChange(''); setOpen(false); }}
                >
                  {placeholder}
                </button>
              </li>
            )}
            {filtered.map((o) => (
              <li key={o.value}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition',
                    o.value === value ? 'text-white' : 'text-white/80 hover:text-white'
                  )}
                  style={{ background: o.value === value ? `${o.color}22` : undefined }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = `${o.color}28`; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = o.value === value ? `${o.color}22` : 'transparent'; }}
                  onClick={() => { onChange(o.value); setOpen(false); }}
                >
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: o.color }} />
                  {o.label}
                </button>
              </li>
            ))}
            {!filtered.length && (
              <li className="px-3 py-3 text-sm text-white/40">{placeholder}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
