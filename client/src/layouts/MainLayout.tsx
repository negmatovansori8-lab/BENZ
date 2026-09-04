import { Link } from 'react-router-dom';
import { Footer, Header, MobileNav } from '../components/Header';
import { RouteShell } from '../components/RouteShell';
import { useCompare } from '../context/CompareContext';

export function MainLayout() {
  const { items } = useCompare();
  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <Header />
      <main className="flex-1">
        <RouteShell />
      </main>
      <Footer />
      <MobileNav />
      {items.length > 0 && (
        <Link
          to="/compare"
          className="fixed bottom-20 right-4 z-30 hidden rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-glow md:bottom-6 md:flex"
        >
          Compare {items.length}
        </Link>
      )}
    </div>
  );
}
