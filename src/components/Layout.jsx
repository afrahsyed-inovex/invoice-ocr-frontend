import { Outlet, useLocation } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import Navbar from './Navbar';

export default function Layout() {
  const { pathname } = useLocation();

  return (
    <div className="relative isolate min-h-screen">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-112 bg-linear-to-b from-brand-100/60 via-brand-50/30 to-transparent dark:from-brand-500/10 dark:via-brand-500/5"
      />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg dark:focus:bg-slate-800"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main-content">
        {/* Keyed by path so an error on one page clears when navigating to the other. */}
        <ErrorBoundary resetKey={pathname}>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
