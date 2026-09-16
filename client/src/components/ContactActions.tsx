import { Phone } from './icons';
import { Icon } from './icons/Icon';
import { useI18n } from '../context/LocaleContext';
import { useToast } from '../context/ToastContext';
import { displayPhone, normalizePhone, whatsappLink } from '../utils/format';

export function ContactActions({
  phone,
  className = '',
  listingTitle,
}: {
  phone?: string | null;
  className?: string;
  listingTitle?: string;
}) {
  const { t } = useI18n();
  const { push } = useToast();
  const tel = normalizePhone(phone);
  const digits = tel.replace(/\D/g, '');
  const waBase = whatsappLink(phone);
  const waText = listingTitle
    ? encodeURIComponent(`${t('hello')}! ${listingTitle} — BENZ`)
    : '';
  const wa = waBase
    ? `${waBase}${waText ? `&text=${waText}` : ''}`
    : '';

  if (!tel || digits.length < 7) {
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

  const openWhatsApp = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (!wa) {
      push(t('noPhone'), 'error');
      return;
    }
    window.open(wa, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`col-span-2 space-y-2 ${className}`}>
      <p className="text-center text-sm font-semibold tracking-wide">{displayPhone(tel)}</p>
      <div className="grid grid-cols-2 gap-2">
        <a
          className="btn-dark inline-flex items-center justify-center gap-2"
          href={`tel:${tel}`}
        >
          <Icon icon={Phone} size="sm" decorative /> {t('callNow')}
        </a>
        <a
          className="btn-gold inline-flex items-center justify-center"
          href={wa || '#'}
          target="_blank"
          rel="noopener noreferrer"
          onClick={openWhatsApp}
        >
          WhatsApp
        </a>
      </div>
      <button type="button" className="btn-ghost w-full text-sm" onClick={copy}>
        {t('copyPhone')}
      </button>
    </div>
  );
}
