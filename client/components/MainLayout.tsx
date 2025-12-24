import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useExpenseStore } from "@/store/expenseStore";
import { Home, Users, History, User, LogOut, Sparkles } from "lucide-react";

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Groups', href: '/groups', icon: Users },
  { name: 'History', href: '/history', icon: History },
  { name: 'Splitzy AI', href: '/splitzy-ai', icon: Sparkles },
  { name: 'Profile', href: '/profile', icon: User },
];

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useExpenseStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h1 className="text-xl font-bold text-primary">Spiltzy</h1>
            </div>
            <div className="mt-5 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname.startsWith(item.href);
                  return (
                    <Button
                      key={item.name}
                      onClick={() => navigate(item.href)}
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start gap-3',
                        isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Button>
                  );
                })}
              </nav>
            </div>
            <div className="p-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">View profile</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sidebar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <div className="flex justify-around py-2">
          {navigation.slice(0, 4).map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Button
                key={item.name}
                variant="ghost"
                size="icon"
                className={cn(
                  'flex flex-col items-center justify-center h-14 w-full',
                  isActive ? 'text-primary' : 'text-gray-500'
                )}
                onClick={() => navigate(item.href)}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.name}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar - only for mobile */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <h1 className="text-xl font-bold text-primary">Spiltzy</h1>
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
            <User className="h-5 w-5" />
          </Button>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
