import { useRef } from 'react';

export const OTP_LEN = 6;

export function OtpBoxes({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: OTP_LEN }, (_, i) => value[i] || '');

  const focusAt = (i: number) => {
    refs.current[Math.max(0, Math.min(OTP_LEN - 1, i))]?.focus();
  };

  const setDigits = (next: string[], focus?: number) => {
    onChange(next.join('').replace(/\D/g, '').slice(0, OTP_LEN));
    if (focus != null) focusAt(focus);
  };

  return (
    <div className="flex justify-center gap-2" dir="ltr">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          className="h-12 w-11 rounded-xl border border-[var(--ah-line)] bg-[var(--ah-surface)] text-center font-display text-xl outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 sm:h-14 sm:w-12"
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          autoFocus={i === 0}
          maxLength={1}
          disabled={disabled}
          value={d}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, '');
            if (!raw) {
              const next = [...digits];
              next[i] = '';
              setDigits(next, i);
              return;
            }
            if (raw.length > 1) {
              const pasted = raw.slice(0, OTP_LEN).split('');
              const next = Array.from({ length: OTP_LEN }, (_, idx) => pasted[idx] || '');
              setDigits(next, Math.min(pasted.length, OTP_LEN - 1));
              return;
            }
            const next = [...digits];
            next[i] = raw;
            setDigits(next, i + 1);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace') {
              e.preventDefault();
              const next = [...digits];
              if (next[i]) {
                next[i] = '';
                setDigits(next, i);
              } else {
                next[i - 1] = '';
                setDigits(next, i - 1);
              }
            }
            if (e.key === 'ArrowLeft') focusAt(i - 1);
            if (e.key === 'ArrowRight') focusAt(i + 1);
          }}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LEN);
            if (!pasted) return;
            e.preventDefault();
            const next = Array.from({ length: OTP_LEN }, (_, idx) => pasted[idx] || '');
            setDigits(next, Math.min(pasted.length, OTP_LEN - 1));
          }}
        />
      ))}
    </div>
  );
}
