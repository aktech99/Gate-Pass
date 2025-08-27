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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  UserCheck,
  UserX,
  Users,
  Clock,
  Shield,
  GraduationCap,
  User,
} from 'lucide-react';
import { format } from 'date-fns';

interface PendingTeacher {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AllUser {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'TEACHER' | 'STUDENT' | 'SECURITY';
  isApproved: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user, token } = useAuth();
  const [pendingTeachers, setPendingTeachers] = useState<PendingTeacher[]>([]);
  const [allUsers, setAllUsers] = useState<AllUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pendingRes, allUsersRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/teachers/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/teachers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const pendingData = await pendingRes.json();
      const allUsersData = await allUsersRes.json();

      setPendingTeachers(pendingData);
      setAllUsers(allUsersData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveTeacher = async (teacherId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/teachers/${teacherId}/approve`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error approving teacher:', error);
    }
  };

  const handleRejectTeacher = async (teacherId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/teachers/${teacherId}/reject`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error rejecting teacher:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/users/${userId}/role`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ role: newRole }),
        },
      );

      if (res.ok) {
        setSelectedUser(null);
        setNewRole('');
        fetchData();
      }
    } catch (error) {
      console.error('Error changing role:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Shield className="h-4 w-4" />;
      case 'TEACHER':
        return <GraduationCap className="h-4 w-4" />;
      case 'STUDENT':
        return <User className="h-4 w-4" />;
      case 'SECURITY':
        return <Shield className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role: string, isApproved: boolean) => {
    const baseClasses = 'flex items-center gap-1';

    if (!isApproved && role !== 'STUDENT') {
      return (
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
    }

    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <Badge className="bg-purple-100 text-purple-800">
            {getRoleIcon(role)}
            <span className="ml-1">Super Admin</span>
          </Badge>
        );
      case 'TEACHER':
        return (
          <Badge className="bg-blue-100 text-blue-800">
            {getRoleIcon(role)}
            <span className="ml-1">Teacher</span>
          </Badge>
        );
      case 'STUDENT':
        return (
          <Badge className="bg-green-100 text-green-800">
            {getRoleIcon(role)}
            <span className="ml-1">Student</span>
          </Badge>
        );
      case 'SECURITY':
        return (
          <Badge className="bg-orange-100 text-orange-800">
            {getRoleIcon(role)}
            <span className="ml-1">Security</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {getRoleIcon(role)}
            <span className="ml-1">{role}</span>
          </Badge>
        );
    }
  };

  const userStats = {
    total: allUsers.length,
    students: allUsers.filter((u) => u.role === 'STUDENT').length,
    teachers: allUsers.filter((u) => u.role === 'TEACHER' && u.isApproved)
      .length,
    security: allUsers.filter((u) => u.role === 'SECURITY').length,
    pending: allUsers.filter((u) => !u.isApproved && u.role !== 'STUDENT')
      .length,
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
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users and system settings
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{userStats.total}</p>
              <p className="text-muted-foreground text-sm">Total Users</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{userStats.students}</p>
              <p className="text-muted-foreground text-sm">Students</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{userStats.teachers}</p>
              <p className="text-muted-foreground text-sm">Teachers</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-2xl font-bold">{userStats.security}</p>
              <p className="text-muted-foreground text-sm">Security</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold">{userStats.pending}</p>
              <p className="text-muted-foreground text-sm">Pending</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">
            Pending Approvals ({pendingTeachers.length})
          </TabsTrigger>
          <TabsTrigger value="users">All Users ({allUsers.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {pendingTeachers.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <UserCheck className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <h3 className="mb-2 text-lg font-semibold">
                    No Pending Approvals
                  </h3>
                  <p className="text-muted-foreground">
                    All teacher registrations have been processed.
                  </p>
                </CardContent>
              </Card>
            ) : (
              pendingTeachers.map((teacher) => (
                <Card key={teacher.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          {teacher.name}
                        </CardTitle>
                        <CardDescription>{teacher.email}</CardDescription>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800"
                      >
                        <Clock className="mr-1 h-3 w-3" />
                        Pending Approval
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm">
                        Registered: {format(new Date(teacher.createdAt), 'PPp')}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveTeacher(teacher.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <UserCheck className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectTeacher(teacher.id)}
                        >
                          <UserX className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="grid gap-4">
            {allUsers.map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{user.name}</CardTitle>
                      <CardDescription>{user.email}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(user.role, user.isApproved)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedUser(user.id);
                          setNewRole(user.role);
                        }}
                      >
                        Change Role
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <span className="text-muted-foreground text-sm">
                    Joined: {format(new Date(user.createdAt), 'PPp')}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Role Change Modal */}
      {selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Change User Role</CardTitle>
              <CardDescription>Select a new role for the user</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Student
                    </div>
                  </SelectItem>
                  <SelectItem value="TEACHER">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Teacher
                    </div>
                  </SelectItem>
                  <SelectItem value="SECURITY">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Security
                    </div>
                  </SelectItem>
                  <SelectItem value="SUPER_ADMIN">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Super Admin
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
            <CardContent className="flex gap-2">
              <Button
                className="flex-1"
                onClick={() => handleRoleChange(selectedUser, newRole)}
                disabled={!newRole}
              >
                Update Role
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedUser(null);
                  setNewRole('');
                }}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
