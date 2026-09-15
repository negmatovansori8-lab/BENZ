import { Link } from 'react-router-dom';
import { Footer, Header, MobileNav } from '../components/Header';
import { RouteShell } from '../components/RouteShell';
import { useCompare } from '../context/CompareContext';
import { useI18n } from '../context/LocaleContext';

export function MainLayout() {
  const { items } = useCompare();
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen flex-col pb-[4.5rem] md:pb-0">
      <Header />
      <main className="flex-1">
        <RouteShell />
      </main>
      <Footer />
      <MobileNav />
      {items.length >= 2 && (
        <Link
          to="/compare"
          className="fixed bottom-20 right-3 z-30 rounded-full bg-gold-500 px-4 py-2.5 text-sm font-semibold text-zinc-950 shadow-glow md:bottom-6"
        >
          {t('compareBar')} ({items.length})
        </Link>
      )}
    </div>
  );
}
