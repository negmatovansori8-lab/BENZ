import { Link } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { useI18n } from '../context/LocaleContext';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <div className="container-ah py-24 text-center">
      <Seo title={`404 — BENZ`} />
      <p className="text-sm uppercase tracking-[0.3em] text-gold-600">Error 404</p>
      <h1 className="font-display mt-3 text-5xl">{t('pageNotFound')}</h1>
      <p className="mt-3 text-[var(--ah-muted)]">{t('somethingWrong')}</p>
      <Link to="/" className="btn-gold mt-8">{t('backHome')}</Link>
    </div>
  );
}
