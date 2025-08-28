// src/app/teacher/page.tsx
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
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import { format } from 'date-fns';

interface PendingRequest {
  id: string;
  reason: string;
  status: string;
  requestDate: string;
  validUntil: string;
  student: {
    name: string;
    email: string;
  };
  createdAt: string;
}

interface ApprovedRequest {
  id: string;
  reason: string;
  status: string;
  requestDate: string;
  validUntil: string;
  remarks?: string;
  qrCode?: string;
  student: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function TeacherDashboard() {
  const { user, token } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [approvedRequests, setApprovedRequests] = useState<ApprovedRequest[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');

  // Get auth data with fallback
  const getAuthData = () => {
    if (token && user) {
      return { token, user };
    }
    return getStoredAuthData();
  };

  const { token: authToken, user: authUser } = getAuthData();

  useEffect(() => {
    console.log('Teacher Dashboard - Auth Token:', !!authToken);
    console.log('Teacher Dashboard - User:', authUser?.email);
  }, [authToken, authUser]);

  useEffect(() => {
    if (authToken && authUser) {
      fetchRequests();

      // Set up polling for real-time updates every 30 seconds
      const interval = setInterval(() => {
        fetchRequests();
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [authToken, authUser]);

  const fetchRequests = async () => {
    try {
      if (!authToken) {
        console.error('No auth token for teacher requests');
        setLoading(false);
        return;
      }

      const [pendingRes, approvedRes] = await Promise.all([
        fetch(`http://localhost:3001/api/gate-pass/teacher/pending`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
        fetch(`http://localhost:3001/api/gate-pass/teacher/approved`, {
          headers: { Authorization: `Bearer ${authToken}` },
        }),
      ]);

      if (pendingRes.ok) {
        const pendingData = await pendingRes.json();
        console.log('Pending requests data:', pendingData);
        setPendingRequests(Array.isArray(pendingData) ? pendingData : []);
      } else {
        console.error('Failed to fetch pending requests:', pendingRes.status);
        setPendingRequests([]);
      }

      if (approvedRes.ok) {
        const approvedData = await approvedRes.json();
        console.log('Approved requests data:', approvedData);
        setApprovedRequests(Array.isArray(approvedData) ? approvedData : []);
      } else {
        console.error('Failed to fetch approved requests:', approvedRes.status);
        setApprovedRequests([]);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setPendingRequests([]);
      setApprovedRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gate-pass/approve/${requestId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ remarks }),
        },
      );

      if (res.ok) {
        setSelectedRequest(null);
        setRemarks('');
        fetchRequests(); // Refresh data after approval
      }
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gate-pass/reject/${requestId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ remarks }),
        },
      );

      if (res.ok) {
        setSelectedRequest(null);
        setRemarks('');
        fetchRequests(); // Refresh data after rejection
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
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
    <Layout title="Teacher Dashboard">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {user?.name}</h1>
            <p className="text-muted-foreground">
              Review and approve gate pass requests
            </p>
          </div>
          <div className="flex gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">{pendingRequests.length}</p>
                  <p className="text-muted-foreground text-sm">Pending</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {approvedRequests.length}
                  </p>
                  <p className="text-muted-foreground text-sm">Approved</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Requests ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              My Approvals ({approvedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="grid gap-4">
              {pendingRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-semibold">
                      No Pending Requests
                    </h3>
                    <p className="text-muted-foreground">
                      No students have requested gate passes from you yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                pendingRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {request.reason}
                          </CardTitle>
                          <CardDescription>
                            Student: {request.student.name} (
                            {request.student.email})
                          </CardDescription>
                        </div>
                        <Badge
                          variant="secondary"
                          className="bg-yellow-100 text-yellow-800"
                        >
                          <Clock className="mr-1 h-3 w-3" />
                          Pending
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Requested Date:</span>
                          <p className="text-muted-foreground">
                            {format(new Date(request.requestDate), 'PPp')}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium">Valid Until:</span>
                          <p className="text-muted-foreground">
                            {format(new Date(request.validUntil), 'PPp')}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setSelectedRequest(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Review
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="approved">
            <div className="grid gap-4">
              {approvedRequests.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <CheckCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-semibold">
                      No Approved Requests
                    </h3>
                    <p className="text-muted-foreground">
                      Requests you approve will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                approvedRequests.map((request) => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {request.reason}
                          </CardTitle>
                          <CardDescription>
                            Student: {request.student.name}
                          </CardDescription>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Approved
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Valid Until:</span>
                          <p className="text-muted-foreground">
                            {format(new Date(request.validUntil), 'PPp')}
                          </p>
                        </div>
                        {request.remarks && (
                          <div>
                            <span className="font-medium">Your Remarks:</span>
                            <p className="text-muted-foreground">
                              {request.remarks}
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
        </Tabs>

        {/* Review Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Review Gate Pass Request</CardTitle>
                <CardDescription>
                  Add remarks and approve or reject the request
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Remarks (Optional)
                  </label>
                  <Textarea
                    placeholder="Add any comments or instructions..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardContent className="flex gap-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => handleApprove(selectedRequest)}
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => handleReject(selectedRequest)}
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRequest(null);
                    setRemarks('');
                  }}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
