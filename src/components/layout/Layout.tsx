import BottomNavigation from './BottomNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="pb-20"> {/* padding bottom for nav */}
      {children}
      <BottomNavigation />
    </div>
  );
}