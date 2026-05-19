import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import type { ReactElement } from 'react';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Dump from './pages/Dump';
import Onboarding from './pages/Onboarding';
import Plan from './pages/Plan';
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

function App() {
  return (
    <Router>
      <div className="min-h-screen cream-bg text-ink-900 dark:bg-charcoal-900 dark:text-dark-100">
        <Routes>
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
