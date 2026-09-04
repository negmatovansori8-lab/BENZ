import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { useI18n } from '../context/LocaleContext';

export function EmptyState({
  icon: Icon,
  title,
  text,
  action,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  action?: { to: string; label: string };
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-4 rounded-full bg-gold-500/10 p-4 text-gold-500">
        <Icon className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-[var(--ah-muted)]">{text}</p>
      {action && (
        <Link to={action.to} className="btn-gold mt-6">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const { t } = useI18n();
  return (
    <div className="card px-6 py-12 text-center">
      <h2 className="text-lg font-semibold">{t('somethingWrong')}</h2>
      <p className="mt-1 text-sm text-[var(--ah-muted)]">{t('tryAgain')}</p>
      {onRetry && (
        <button type="button" className="btn-gold mt-5" onClick={onRetry}>
          {t('tryAgain')}
        </button>
      )}
    </div>
  );
}
