import BottomNavigation from './BottomNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="cream-bg min-h-screen pb-28">
      {children}
      <BottomNavigation />
    </div>
  );
}
