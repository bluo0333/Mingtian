import BottomNavigation from './BottomNavigation';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen cream-bg dark:bg-charcoal-900">
      <div className="pb-24">{children}</div>
      <BottomNavigation />
    </div>
  );
}
