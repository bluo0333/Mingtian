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
    <nav className="floating-dock">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[11px] font-medium transition-colors ${
              isActive
                ? 'bg-jade-100/75 text-jade-700 dark:bg-charcoal-700/65 dark:text-dark-200'
                : 'text-jade-400 dark:text-charcoal-300'
            }`}
          >
            <item.icon size={17} strokeWidth={2.2} />
            <span>{item.label}</span>
            {isActive && <div className="mt-0.5 h-1 w-1 rounded-full bg-jade-600 dark:bg-dark-300" />}
          </Link>
        );
      })}
    </nav>
  );
}
