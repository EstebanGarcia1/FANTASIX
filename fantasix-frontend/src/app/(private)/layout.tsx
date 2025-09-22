import { AuthGuard } from '../../shared/guards/AuthGuard';
import { AppNavigation } from '../../shared/components/AppNavigation';

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Navigation */}
        <AppNavigation />
        
        {/* Main Content */}
        <main className="pb-6">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}