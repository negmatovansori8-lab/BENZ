import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

function RouteFallback() {
  return (
    <div className="container-ah py-10">
      <div className="skeleton h-7 w-40 rounded-lg" />
      <div className="skeleton mt-5 h-72 w-full rounded-3xl" />
    </div>
  );
}

export function RouteShell() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);

  return (
    <Suspense fallback={<RouteFallback />}>
      <div key={location.pathname} className="route-in">
        <Outlet />
      </div>
    </Suspense>
  );
}
