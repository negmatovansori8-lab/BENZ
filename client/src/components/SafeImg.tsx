import { useState } from 'react';
import { carImage, localCarSrc } from '../utils/format';

export function SafeImg({
  src,
  seed,
  index = 0,
  alt,
  className,
}: {
  src?: string | null;
  seed?: string | number | null;
  index?: number;
  alt: string;
  className?: string;
}) {
  const [step, setStep] = useState(0);
  const resolved = step === 0 ? carImage(src, seed, index) : localCarSrc(seed, index + step);

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setStep((s) => (s < 7 ? s + 1 : s))}
    />
  );
}
