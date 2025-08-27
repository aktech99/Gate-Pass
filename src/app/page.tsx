import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Shield, GraduationCap, User, Scan } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="mb-16 text-center">
          <h1 className="mb-6 text-5xl font-bold text-gray-900">
            Gate Pass Management System
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            Streamline your institution's gate pass process with our digital
            solution. Students can register directly, while admin manages
            teacher and security accounts.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="px-8 py-3 text-lg">
              <Link href="/login">Login to Continue</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-3 text-lg"
              asChild
            >
              <Link href="/register">Register as Student</Link>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="text-center transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <User className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-green-600">Students</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Students can register directly and request gate passes from
                their teachers
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <GraduationCap className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-blue-600">Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Admin creates teacher accounts and they can review student
                requests
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                <Scan className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle className="text-orange-600">Security</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Admin creates security accounts for QR scanning and gate
                management
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center transition-shadow hover:shadow-lg">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-purple-600">Administrators</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create teacher and security accounts, manage roles, and oversee
                the system
              </CardDescription>
            </CardContent>
          </Card>
        </div>
        <div className="mb-16 text-center">
          <h2 className="mb-12 text-3xl font-bold text-gray-900">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold">
                Student Registration
              </h3>
              <p className="text-gray-600">
                Students register directly and can immediately start requesting
                gate passes
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold">Admin Management</h3>
              <p className="text-gray-600">
                Admins create teacher and security accounts, then manage the
                entire system
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mb-2 text-xl font-semibold">QR Code & Exit</h3>
              <p className="text-gray-600">
                Approved requests generate QR codes for security to scan at the
                gate
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Ready to Get Started?
          </h2>
          <p className="mb-6 text-gray-600">
            Join thousands of institutions using our gate pass management system
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/register">Register as Student</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">Staff & Admin Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
