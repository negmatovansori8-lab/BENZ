import { Phone } from 'lucide-react';
import { useI18n } from '../context/LocaleContext';
import { useToast } from '../context/ToastContext';
import { displayPhone, normalizePhone, whatsappLink } from '../utils/format';

export function ContactActions({ phone, className = '' }: { phone?: string | null; className?: string }) {
  const { t } = useI18n();
  const { push } = useToast();
  const tel = normalizePhone(phone);
  const wa = whatsappLink(phone);

  if (!tel) {
    return <p className={`col-span-2 text-center text-sm text-[var(--ah-muted)] ${className}`}>{t('noPhone')}</p>;
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(tel);
      push(t('phoneCopied'), 'success');
    } catch {
      push(tel, 'success');
    }
  };

  return (
    <div className={`col-span-2 space-y-2 ${className}`}>
      <p className="text-center text-sm font-semibold tracking-wide">{displayPhone(tel)}</p>
      <div className="grid grid-cols-2 gap-2">
        <a className="btn-dark" href={`tel:${tel}`}>
          <Phone className="h-4 w-4" /> {t('callNow')}
        </a>
        <a className="btn-gold" href={wa} target="_blank" rel="noreferrer">
          WhatsApp
        </a>
      </div>
      <button type="button" className="btn-ghost w-full text-sm" onClick={copy}>
        {t('copyPhone')}
      </button>
    </div>
  );
}
