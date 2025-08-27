'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
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
  Scan,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
} from 'lucide-react';
import { format } from 'date-fns';

interface ScannedPass {
  id: string;
  student: {
    name: string;
    email: string;
  };
  teacher: {
    name: string;
  };
  reason: string;
  validUntil: string;
  status: string;
  usedAt: string;
  qrCode: string;
}

interface ActivePass {
  id: string;
  student: {
    name: string;
    email: string;
  };
  reason: string;
  validUntil: string;
  qrCode: string;
}

export default function SecurityDashboard() {
  const { user, token } = useAuth();
  const [scannedPasses, setScannedPasses] = useState<ScannedPass[]>([]);
  const [activePasses, setActivePasses] = useState<ActivePass[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [manualQR, setManualQR] = useState('');
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // You'll need to create these endpoints
      const [scannedRes, activeRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/security/scanned-passes`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/security/active-passes`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // For now, using mock data
      setScannedPasses([]);
      setActivePasses([]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQRScan = async (qrCode: string) => {
    try {
      setScanning(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/security/scan-pass`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ qrCode }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setScanResult({
          success: true,
          message: `Gate pass validated for ${data.student.name}`,
          data,
        });
        fetchData(); // Refresh the data
      } else {
        setScanResult({
          success: false,
          message: data.message || 'Invalid or expired gate pass',
        });
      }
    } catch (error) {
      setScanResult({
        success: false,
        message: 'Error scanning QR code',
      });
    } finally {
      setScanning(false);
    }
  };

  const handleManualScan = () => {
    if (manualQR.trim()) {
      handleQRScan(manualQR.trim());
      setManualQR('');
    }
  };

  const startCamera = () => {
    // This would integrate with a QR scanner library
    alert(
      'Camera QR scanner would be integrated here. For now, use manual entry.',
    );
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
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
          <p className="text-muted-foreground">Scan and validate gate passes</p>
        </div>
        <div className="flex gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{scannedPasses.length}</p>
                <p className="text-muted-foreground text-sm">Today's Scans</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{activePasses.length}</p>
                <p className="text-muted-foreground text-sm">Active Passes</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* QR Scanner Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scan className="h-5 w-5" />
            QR Code Scanner
          </CardTitle>
          <CardDescription>
            Scan gate pass QR codes to validate student exit/entry
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={startCamera} className="flex-1">
              <Scan className="mr-2 h-4 w-4" />
              Start Camera Scanner
            </Button>
            <div className="flex flex-2 gap-2">
              <Input
                placeholder="Or enter QR code manually"
                value={manualQR}
                onChange={(e) => setManualQR(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleManualScan()}
              />
              <Button
                onClick={handleManualScan}
                disabled={!manualQR.trim() || scanning}
              >
                {scanning ? 'Scanning...' : 'Scan'}
              </Button>
            </div>
          </div>

          {scanResult && (
            <div
              className={`rounded-lg border p-4 ${
                scanResult.success
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}
            >
              <div className="flex items-center gap-2">
                {scanResult.success ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span className="font-medium">{scanResult.message}</span>
              </div>
              {scanResult.data && (
                <div className="mt-2 text-sm">
                  <p>
                    <strong>Student:</strong> {scanResult.data.student.name}
                  </p>
                  <p>
                    <strong>Reason:</strong> {scanResult.data.reason}
                  </p>
                  <p>
                    <strong>Valid Until:</strong>{' '}
                    {format(new Date(scanResult.data.validUntil), 'PPp')}
                  </p>
                </div>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="mt-2"
                onClick={() => setScanResult(null)}
              >
                Dismiss
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Scans</TabsTrigger>
          <TabsTrigger value="active">Active Passes</TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <div className="grid gap-4">
            {scannedPasses.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Scan className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <h3 className="mb-2 text-lg font-semibold">
                    No Recent Scans
                  </h3>
                  <p className="text-muted-foreground">
                    Scanned gate passes will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              scannedPasses.map((pass) => (
                <Card key={pass.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <User className="h-4 w-4" />
                          {pass.student.name}
                        </CardTitle>
                        <CardDescription>
                          {pass.student.email} • Approved by {pass.teacher.name}
                        </CardDescription>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Scanned
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Reason:</span>
                        <p className="text-muted-foreground">{pass.reason}</p>
                      </div>
                      <div>
                        <span className="font-medium">Scanned At:</span>
                        <p className="text-muted-foreground">
                          {format(new Date(pass.usedAt), 'PPp')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="active">
          <div className="grid gap-4">
            {activePasses.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <Calendar className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <h3 className="mb-2 text-lg font-semibold">
                    No Active Passes
                  </h3>
                  <p className="text-muted-foreground">
                    Currently valid gate passes will appear here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              activePasses.map((pass) => (
                <Card key={pass.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <User className="h-4 w-4" />
                          {pass.student.name}
                        </CardTitle>
                        <CardDescription>{pass.student.email}</CardDescription>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800"
                      >
                        <Clock className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Reason:</span>
                        <p className="text-muted-foreground">{pass.reason}</p>
                      </div>
                      <div>
                        <span className="font-medium">Valid Until:</span>
                        <p className="text-muted-foreground">
                          {format(new Date(pass.validUntil), 'PPp')}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button
                        size="sm"
                        onClick={() => handleQRScan(pass.qrCode)}
                        disabled={scanning}
                      >
                        <Scan className="mr-1 h-4 w-4" />
                        Mark as Used
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
