'use client';

import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { User, LogOut, Shield, GraduationCap, Scan, Users } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function Layout({ children, title }: LayoutProps) {
  const { user, clearAuth } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return <Shield className="h-5 w-5" />;
      case 'TEACHER':
        return <GraduationCap className="h-5 w-5" />;
      case 'STUDENT':
        return <User className="h-5 w-5" />;
      case 'SECURITY':
        return <Scan className="h-5 w-5" />;
      default:
        return <User className="h-5 w-5" />;
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'SUPER_ADMIN':
        return 'text-purple-600';
      case 'TEACHER':
        return 'text-blue-600';
      case 'STUDENT':
        return 'text-green-600';
      case 'SECURITY':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Users className="text-primary h-6 w-6" />
                <h1 className="text-xl font-bold">Gate Pass System</h1>
              </div>
              {title && (
                <div className="hidden sm:block">
                  <span className="text-gray-300">|</span>
                  <span className="ml-4 text-lg font-medium text-gray-700">
                    {title}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <div className={`flex items-center gap-1 ${getRoleColor()}`}>
                  {getRoleIcon()}
                  <span className="font-medium">
                    {user.role
                      .replace('_', ' ')
                      .toLowerCase()
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{user.name}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
