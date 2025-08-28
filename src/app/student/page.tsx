'use client';

import { useState, useEffect } from 'react';
import { useAuth, getStoredAuthData } from '@/lib/auth';
import { Layout } from '@/components/Layout';
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { QrCode, Plus, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { QRCodeDisplay } from '@/components/QRCodeDisplay';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Teacher {
  id: string;
  name: string;
  email: string;
}

interface GatePass {
  id: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'USED' | 'EXPIRED';
  requestDate: string;
  validUntil: string;
  remarks?: string;
  qrCode?: string;
  teacher?: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function StudentDashboard() {
  const { user, token } = useAuth();
  const [passes, setPasses] = useState<GatePass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    reason: '',
    requestDate: '',
    validUntil: '',
    teacherId: '',
  });

  // Get auth data with fallback
  const getAuthData = () => {
    if (token && user) {
      return { token, user };
    }
    // Fallback to manual extraction
    return getStoredAuthData();
  };

  const { token: authToken, user: authUser } = getAuthData();

  // Debug auth state
  useEffect(() => {
    console.log('Auth State Debug:');
    console.log('Zustand Token:', !!token);
    console.log('Stored Token:', !!getStoredAuthData().token);
    console.log('Final Token:', !!authToken);
    console.log('Final User:', authUser?.email);
  }, [token, authToken, authUser]);

  const fetchTeachers = async () => {
    try {
      if (!authToken) {
        console.error('No token for teachers fetch');
        return;
      }

      const apiUrl = 'http://localhost:3001/api';
      const res = await fetch(`${apiUrl}/students/teachers`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Teachers fetch status:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('Teachers data:', data);
        setTeachers(Array.isArray(data) ? data : []);
      } else {
        const errorData = await res.text();
        console.error('Failed to fetch teachers:', res.status, errorData);
        setTeachers([]);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
    }
  };

  const fetchPasses = async () => {
    try {
      if (!authToken) {
        console.error('No token found anywhere');
        setLoading(false);
        return;
      }

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      console.log('Using token:', authToken.substring(0, 20) + '...');

      const res = await fetch(`${apiUrl}/gate-pass/student/passes`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('Received data:', data);
        setPasses(Array.isArray(data) ? data : []);
      } else {
        const errorData = await res.text();
        console.error('Failed to fetch passes:', res.status, errorData);
        setPasses([]);
      }
    } catch (error) {
      console.error('Error fetching passes:', error);
      setPasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasses();
    fetchTeachers();
  }, [fetchPasses, fetchTeachers]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gate-pass/request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );

      if (res.ok) {
        setShowRequestForm(false);
        setFormData({
          reason: '',
          requestDate: '',
          validUntil: '',
          teacherId: '',
        });
        fetchPasses();
      }
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      USED: 'bg-blue-100 text-blue-800',
      EXPIRED: 'bg-gray-100 text-gray-800',
    };
    return (
      variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Eye className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="h-3 w-1/2 rounded bg-gray-200"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Layout title="Student Dashboard">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
            <p className="text-muted-foreground">
              Manage your gate pass requests
            </p>
          </div>
          <Button onClick={() => setShowRequestForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid gap-4">
              {passes.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                      <Eye className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      No Gate Pass Requests
                    </h3>
                    <p className="text-muted-foreground">
                      You haven&apos;t made any gate pass requests yet. Click
                      &quot;New Request&quot; to get started.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                passes.map((pass) => (
                  <Card key={pass.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {pass.reason}
                          </CardTitle>
                          <CardDescription>
                            Requested:{' '}
                            {format(new Date(pass.requestDate), 'PPp')}
                            {pass.teacher &&
                              ` • Approved by: ${pass.teacher.name}`}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusBadge(pass.status)}>
                            {getStatusIcon(pass.status)}
                            <span className="ml-1">{pass.status}</span>
                          </Badge>
                          {pass.status === 'APPROVED' && pass.qrCode && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setShowQRCode(pass.qrCode!)}
                            >
                              <QrCode className="mr-1 h-4 w-4" />
                              QR Code
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Valid Until:</span>
                          <p className="text-muted-foreground">
                            {format(new Date(pass.validUntil), 'PPp')}
                          </p>
                        </div>
                        {pass.remarks && (
                          <div>
                            <span className="font-medium">Remarks:</span>
                            <p className="text-muted-foreground">
                              {pass.remarks}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="pending">
            <div className="grid gap-4">
              {passes.filter((p) => p.status === 'PENDING').length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Clock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-semibold">
                      No Pending Requests
                    </h3>
                    <p className="text-muted-foreground">
                      You don&apos;t have any pending gate pass requests.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                passes
                  .filter((p) => p.status === 'PENDING')
                  .map((pass) => (
                    <Card key={pass.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{pass.reason}</CardTitle>
                        <CardDescription>
                          Requested: {format(new Date(pass.requestDate), 'PPp')}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="approved">
            <div className="grid gap-4">
              {passes.filter((p) => p.status === 'APPROVED').length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <CheckCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-semibold">
                      No Approved Requests
                    </h3>
                    <p className="text-muted-foreground">
                      You don&apos;t have any approved gate pass requests yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                passes
                  .filter((p) => p.status === 'APPROVED')
                  .map((pass) => (
                    <Card key={pass.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">
                              {pass.reason}
                            </CardTitle>
                            <CardDescription>
                              Approved by: {pass.teacher?.name}
                            </CardDescription>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setShowQRCode(pass.qrCode!)}
                          >
                            <QrCode className="mr-1 h-4 w-4" />
                            Show QR
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* New Request Modal */}
        {showRequestForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>New Gate Pass Request</CardTitle>
              </CardHeader>
              <form onSubmit={handleSubmitRequest}>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">
                      Select Teacher *
                    </label>
                    <Select
                      value={formData.teacherId}
                      onValueChange={(value) =>
                        setFormData({ ...formData, teacherId: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name} ({teacher.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Reason</label>
                    <Input
                      required
                      placeholder="Reason for leaving"
                      value={formData.reason}
                      onChange={(e) =>
                        setFormData({ ...formData, reason: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Request Date</label>
                    <Input
                      type="datetime-local"
                      required
                      value={formData.requestDate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requestDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Valid Until</label>
                    <Input
                      type="datetime-local"
                      required
                      value={formData.validUntil}
                      onChange={(e) =>
                        setFormData({ ...formData, validUntil: e.target.value })
                      }
                    />
                  </div>
                </CardContent>
                <CardContent className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Submit Request
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRequestForm(false)}
                  >
                    Cancel
                  </Button>
                </CardContent>
              </form>
            </Card>
          </div>
        )}
        {showQRCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-sm text-center">
              <CardHeader>
                <CardTitle>Your Gate Pass QR Code</CardTitle>
                <CardDescription>
                  Show this to security at the gate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QRCodeDisplay value={showQRCode} size={200} />
              </CardContent>
              <CardContent className="pt-0">
                <Button onClick={() => setShowQRCode(null)} className="w-full">
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
