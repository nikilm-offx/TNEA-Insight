import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  FileCheck,
  TrendingUp,
} from "lucide-react";

interface DashboardStats {
  students: {
    total: number;
  };
  eligibility: {
    total: number;
    eligible: number;
    needsReview: number;
    rejected: number;
    pending: number;
  };
  flags: {
    active: number;
    critical: number;
    high: number;
  };
  recentActivities: Array<{
    action: string;
    resource: string;
    createdAt: string;
    severity: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch("/api/admin/dashboard-stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      const data = await response.json();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      toast({
        title: "Error",
        description: "Failed to fetch dashboard stats",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error || "Failed to load dashboard"}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const eligibilityData = [
    { name: "Eligible", value: stats.eligibility.eligible, fill: "#10b981" },
    { name: "Needs Review", value: stats.eligibility.needsReview, fill: "#f59e0b" },
    { name: "Rejected", value: stats.eligibility.rejected, fill: "#ef4444" },
    { name: "Pending", value: stats.eligibility.pending, fill: "#6b7280" },
  ];

  const flagSeverityData = [
    { name: "Critical", count: stats.flags.critical, fill: "#dc2626" },
    { name: "High", count: stats.flags.high, fill: "#ea580c" },
    { name: "Medium", count: Math.max(0, stats.flags.active - stats.flags.critical - stats.flags.high), fill: "#f59e0b" },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">DigiLocker Certificate Verification System</p>
        </div>
        <Button onClick={fetchDashboardStats} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.students.total}</div>
              <Users className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Verified Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.eligibility.eligible}</div>
              <CheckCircle2 className="h-8 w-8 text-green-500 opacity-50" />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {stats.students.total > 0
                ? ((stats.eligibility.eligible / stats.students.total) * 100).toFixed(1)
                : 0}
              % of students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Needs Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.eligibility.needsReview}</div>
              <Clock className="h-8 w-8 text-amber-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Active Flags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{stats.flags.active}</div>
              <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
            </div>
            {stats.flags.critical > 0 && (
              <p className="text-xs text-red-600 mt-2">
                {stats.flags.critical} critical flags
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Eligibility Distribution</CardTitle>
            <CardDescription>Students by eligibility status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={eligibilityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Flag Severity Distribution</CardTitle>
            <CardDescription>Active flags by severity level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={flagSeverityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Eligibility Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Eligible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.eligibility.eligible}</div>
            <p className="text-sm text-gray-600 mt-2">Ready for counselling</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Needs Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.eligibility.needsReview}</div>
            <p className="text-sm text-gray-600 mt-2">Pending admin verification</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.eligibility.rejected}</div>
            <p className="text-sm text-gray-600 mt-2">Not eligible for counselling</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Latest system events and actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity, i) => {
                const severityColor = {
                  critical: "text-red-600 bg-red-50",
                  warning: "text-amber-600 bg-amber-50",
                  info: "text-blue-600 bg-blue-50",
                }[activity.severity] || "text-gray-600 bg-gray-50";

                return (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border ${severityColor}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm opacity-75">{activity.resource}</p>
                      </div>
                      <Badge variant="outline">
                        {new Date(activity.createdAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-600 text-center py-8">No recent activities</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
