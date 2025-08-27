'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Check for registration success message
    const message = searchParams.get('message');
    if (message === 'registration-pending') {
      setSuccessMessage(
        'Registration successful! Your account is pending approval. You will be able to login once an admin approves your account.',
      );
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setAuth(data.token, data.user);

      // Role-based redirection
      switch (data.user.role) {
        case 'SUPER_ADMIN':
          router.push('/admin');
          break;
        case 'TEACHER':
          router.push('/teacher');
          break;
        case 'STUDENT':
          router.push('/student');
          break;
        case 'SECURITY':
          router.push('/security');
          break;
        default:
          router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <h2 className="text-center text-2xl font-bold">Login</h2>
          <p className="text-muted-foreground text-center text-sm">
            Enter your credentials to access the system
          </p>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-600">
                {successMessage}
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                required
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                required
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Don't have an account?{' '}
              </span>
              <Link href="/register" className="text-primary hover:underline">
                Create account
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
