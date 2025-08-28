'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuthData } from '@/lib/auth';
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
import {
  QrCode,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Search,
  Trash2,
  RefreshCw,
} from 'lucide-react';
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
  const [mounted, setMounted] = useState(false);
  const [passes, setPasses] = useState<GatePass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showQRCode, setShowQRCode] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    reason: '',
    requestDate: '',
    validUntil: '',
    teacherId: '',
  });

  // Wait for client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const { token, user } = useAuthData();

  // Filter passes based on search term
  const filteredPasses = useMemo(() => {
    if (!searchTerm) return passes;

    return passes.filter(
      (pass) =>
        pass.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pass.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pass.teacher?.name || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );
  }, [passes, searchTerm]);

  const fetchPasses = useCallback(async () => {
    try {
      if (!token) {
        console.error('No token available');
        return;
      }

      const apiUrl = 'http://localhost:3001/api';
      const res = await fetch(`${apiUrl}/gate-pass/student/passes`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setPasses(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch passes:', res.status);
        setPasses([]);
      }
    } catch (error) {
      console.error('Error fetching passes:', error);
      setPasses([]);
    }
  }, [token]);

  const fetchTeachers = useCallback(async () => {
    try {
      if (!token) return;

      const apiUrl = 'http://localhost:3001/api';
      const res = await fetch(`${apiUrl}/students/teachers`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        const data = await res.json();
        setTeachers(Array.isArray(data) ? data : []);
      } else {
        console.error('Failed to fetch teachers:', res.status);
        setTeachers([]);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setTeachers([]);
    }
  }, [token]);

  // Initial data fetch - moved inside useEffect to avoid dependency issues
  useEffect(() => {
    if (mounted && token && user) {
      const fetchInitialData = async () => {
        setLoading(true);
        await Promise.all([fetchPasses(), fetchTeachers()]);
        setLoading(false);
      };

      fetchInitialData();
    }
  }, [mounted, token, user, fetchPasses, fetchTeachers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPasses();
    setRefreshing(false);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = 'http://localhost:3001/api';
      const res = await fetch(`${apiUrl}/gate-pass/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowRequestForm(false);
        setFormData({
          reason: '',
          requestDate: '',
          validUntil: '',
          teacherId: '',
        });
        // Refresh data after creating request
        await fetchPasses();
      }
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  const handleDeleteRequest = async (passId: string) => {
    if (!confirm('Are you sure you want to delete this gate pass request?')) {
      return;
    }

    try {
      const apiUrl = 'http://localhost:3001/api';
      const res = await fetch(`${apiUrl}/gate-pass/request/${passId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        // Refresh data after deleting
        await fetchPasses();
      }
    } catch (error) {
      console.error('Error deleting request:', error);
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

  // Show loading until component is mounted and we have auth data
  if (!mounted || loading) {
    return (
      <Layout title="Student Dashboard">
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
      </Layout>
    );
  }

  // Show auth error if no token/user after mounting
  if (!token || !user) {
    return (
      <Layout title="Student Dashboard">
        <div className="container mx-auto p-6">
          <Card>
            <CardContent className="py-8 text-center">
              <h3 className="mb-2 text-lg font-semibold">
                Authentication Required
              </h3>
              <p className="text-muted-foreground">
                Please log in to access your dashboard.
              </p>
              <Button
                className="mt-4"
                onClick={() => (window.location.href = '/login')}
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Student Dashboard">
      <div className="container mx-auto p-6">
        {/* Header with Search and Actions */}
        <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
            <p className="text-muted-foreground">
              Manage your gate pass requests
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
            <Button onClick={() => setShowRequestForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Request
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-3 left-3 h-4 w-4" />
            <Input
              placeholder="Search gate pass requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">
              All Requests ({filteredPasses.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending (
              {filteredPasses.filter((p) => p.status === 'PENDING').length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved (
              {filteredPasses.filter((p) => p.status === 'APPROVED').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="grid gap-4">
              {filteredPasses.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                      <Eye className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">
                      {searchTerm
                        ? 'No matching requests'
                        : 'No Gate Pass Requests'}
                    </h3>
                    <p className="text-muted-foreground">
                      {searchTerm
                        ? 'Try adjusting your search terms'
                        : 'You haven&apos;t made any gate pass requests yet. Click "New Request" to get started.'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredPasses.map((pass) => (
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
                            {pass.teacher && ` • Teacher: ${pass.teacher.name}`}
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
                          {pass.status === 'PENDING' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteRequest(pass.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
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
                            <span className="font-medium">
                              Teacher Remarks:
                            </span>
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
              {filteredPasses.filter((p) => p.status === 'PENDING').length ===
              0 ? (
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
                filteredPasses
                  .filter((p) => p.status === 'PENDING')
                  .map((pass) => (
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
                                ` • Teacher: ${pass.teacher.name}`}
                            </CardDescription>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteRequest(pass.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="approved">
            <div className="grid gap-4">
              {filteredPasses.filter((p) => p.status === 'APPROVED').length ===
              0 ? (
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
                filteredPasses
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
                      {pass.remarks && (
                        <CardContent>
                          <div>
                            <span className="text-sm font-medium">
                              Teacher Remarks:
                            </span>
                            <p className="text-muted-foreground mt-1 text-sm">
                              {pass.remarks}
                            </p>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* New Request Modal */}
        {showRequestForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
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
                    <label className="text-sm font-medium">Reason *</label>
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
                    <label className="text-sm font-medium">
                      Request Date *
                    </label>
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
                    <label className="text-sm font-medium">Valid Until *</label>
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

        {/* QR Code Modal */}
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
