import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Tasks from './pages/Tasks';
import Dump from './pages/Dump';
import Onboarding from './pages/Onboarding';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-cream text-jade-800 dark:bg-charcoal-900 dark:text-dark-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/dump" element={<Dump />} />
          <Route path="/onboarding" element={<Onboarding />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;