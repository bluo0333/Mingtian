import { Home, CheckSquare, Lightbulb, Calendar, BarChart3 } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Lightbulb, label: 'Dump', path: '/dump' },
  { icon: Calendar, label: 'Plan', path: '/plan' },
  { icon: BarChart3, label: 'Stats', path: '/stats' },
];

export default function BottomNavigation() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-charcoal-900 border-t border-jade-200 dark:border-dark-700/20 px-2 py-2 flex justify-around">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
              isActive
                ? 'text-jade-600 dark:text-dark-400'
                : 'text-jade-400 dark:text-charcoal-400'
            }`}
          >
            <item.icon size={18} />
            <span className="text-xs">{item.label}</span>
            {isActive && <div className="w-1 h-1 bg-jade-600 dark:bg-dark-400 rounded-full mt-1"></div>}
          </Link>
        );
      })}
    </nav>
  );
}