import { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useExpenseStore } from '@/store/expenseStore';
import { Button } from '@/components/ui/button';
import {
  Menu,
  LogOut,
  Home,
  User,
  ChevronLeft,
} from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
  showBack?: boolean;
  title?: string;
}

export default function Layout({ children, showBack, title }: LayoutProps) {
  const { user, logout } = useExpenseStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthPage =
    location.pathname === '/login' || location.pathname === '/otp';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {showBack && (
                <button
                  onClick={() => navigate(-1)}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {title || 'Spiltzy'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden mt-4 pt-4 border-t space-y-2">
              <button
                onClick={() => {
                  navigate('/dashboard');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Home size={20} className="inline mr-2" />
                Dashboard
              </button>
              <button
                onClick={() => {
                  navigate('/profile');
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <User size={20} className="inline mr-2" />
                Profile
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={20} className="inline mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Logout button (desktop) */}
      {user && (
        <button
          onClick={handleLogout}
          className="hidden sm:fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-colors"
          title="Logout"
        >
          <LogOut size={24} />
        </button>
      )}
    </div>
  );
}
