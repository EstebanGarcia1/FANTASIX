import Link from 'next/link';
import { ThemeToggle } from '../../shared/ui/ThemeToggle';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Public Header */}
      <header className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="container-responsive">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <span className="text-xl font-bold text-gradient">
                Fantasix
              </span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/auth" 
                className="text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                Iniciar Sesión
              </Link>
              <ThemeToggle />
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Public Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Public Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="container-responsive py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-br from-brand-500 to-brand-600 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-xs">F</span>
                </div>
                <span className="text-lg font-bold text-gradient">Fantasix</span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                La plataforma líder de Fantasy Esports para Rainbow Six Siege. 
                Crea tu equipo ideal y compite por la gloria.
              </p>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                Producto
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/auth" className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                    Comenzar
                  </Link>
                </li>
                <li>
                  <span className="text-gray-400">Cómo funciona</span>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                Soporte
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="text-gray-400">FAQ</span>
                </li>
                <li>
                  <span className="text-gray-400">Contacto</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 Fantasix. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}