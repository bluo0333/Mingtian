import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Dump from './pages/Dump';
import Onboarding from './pages/Onboarding';
import Plan from './pages/Plan';
import Settings from './pages/Settings';
import Stats from './pages/Stats';
import { useApp } from './context/AppContext';

function ProtectedRoute({ children }: { children: ReactElement }) {
  const {
    state: { user },
  } = useApp();

  if (!user.onboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="sync" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.12, ease: 'easeInOut' }}
        className="fixed inset-0 overflow-y-auto cream-bg dark:bg-charcoal-900 text-ink-900 dark:text-dark-100"
      >
        <Routes location={location}>
          <Route path="/onboarding" element={<Onboarding />} />
          <Route
            path="/"
            element={(
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/tasks"
            element={(
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/dump"
            element={(
              <ProtectedRoute>
                <Dump />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/plan"
            element={(
              <ProtectedRoute>
                <Plan />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/stats"
            element={(
              <ProtectedRoute>
                <Stats />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/settings"
            element={(
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            )}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
