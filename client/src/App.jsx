import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext.jsx';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import BackToTop from './components/BackToTop.jsx';
import Toasts from './components/Toasts.jsx';
import Home from './pages/Home.jsx';
import WordPage from './pages/WordPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

/** Resets scroll position on route change (except when only the query changes). */
function ScrollManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

/** "/" focuses the first visible search input — a common power-user shortcut. */
function useSearchShortcut() {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      const tag = target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || target?.isContentEditable) return;
      const input = document.querySelector('[data-search-input]');
      if (!input) return;
      event.preventDefault();
      input.focus();
      input.select?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}

export default function App() {
  useSearchShortcut();

  return (
    <BrowserRouter>
      <AppProvider>
        <ScrollManager />
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        <Navbar />

        <main id="main" className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/word/:word" element={<WordPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <Footer />
        <BackToTop />
        <Toasts />
      </AppProvider>
    </BrowserRouter>
  );
}
